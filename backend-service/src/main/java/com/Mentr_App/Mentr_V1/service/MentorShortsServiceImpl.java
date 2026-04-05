package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.config.MentorShortsProperties;
import com.Mentr_App.Mentr_V1.dto.shorts.*;
import com.Mentr_App.Mentr_V1.exception.*;
import com.Mentr_App.Mentr_V1.mapper.MentorShortVideoMapper;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.model.MentorShortVideo;
import com.Mentr_App.Mentr_V1.model.enums.MentorShortVideoStatus;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.repository.MentorShortVideoRepository;
import com.Mentr_App.Mentr_V1.util.Mp4MetadataUtil;
import com.Mentr_App.Mentr_V1.util.Mp4SnifferUtil;
import com.Mentr_App.Mentr_V1.util.ShortsTextValidationUtil;
import com.google.cloud.ReadChannel;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.channels.Channels;
import java.nio.file.*;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MentorShortsServiceImpl implements MentorShortsService {

    private final MentorShortsProperties props;
    private final MentorRepository mentorRepository;
    private final MentorShortVideoRepository repo;
    private final GcsSignedUrlService signedUrlService;
    private final Storage storage;

    private static final String REQUIRED_CT = "video/mp4";

    /**
     * Slots are occupied if status is one of these.
     * FAILED/EXPIRED/DELETED do NOT block slot reservation anymore.
     */
    private static final Set<MentorShortVideoStatus> OCCUPIED = EnumSet.of(
            MentorShortVideoStatus.RESERVED,
            MentorShortVideoStatus.READY,
            MentorShortVideoStatus.UPLOADING,
            MentorShortVideoStatus.LIVE
    );

    @Override
    @Transactional
    public ReserveMentorShortResponse reserve(Long userId, ReserveMentorShortRequest req, String idempotencyKey) {

        // Mentor existence + role assumption (controller is @PreAuthorize, but keep safe)
        Mentor mentor = mentorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("MENTOR_NOT_FOUND", "Mentor profile not found"));

        // ---- Idempotency ----
        if (!isBlank(idempotencyKey)) {
            Optional<MentorShortVideo> existing = repo.findByUserIdAndIdempotencyKey(userId, idempotencyKey.trim());
            if (existing.isPresent()) {
                MentorShortVideo e = existing.get();

                // If it’s still RESERVED and not expired, return a fresh signed URL
                if (e.getStatus() == MentorShortVideoStatus.RESERVED
                        && e.getReservedUntil() != null
                        && e.getReservedUntil().isAfter(Instant.now())) {

                    var signed = signedUrlService.createSignedPutUrl(
                            e.getGcsBucket(),
                            e.getGcsObjectPath(),
                            REQUIRED_CT,
                            Duration.ofSeconds(props.getSignedUrlTtlSeconds()),
                            props.getMaxFileBytes()
                    );

                    return ReserveMentorShortResponse.builder()
                            .uploadId(e.getId())
                            .slot(e.getSlot())
                            .status(e.getStatus().name())
                            .uploadUrl(signed.url().toString())
                            .requiredHeaders(signed.requiredHeaders())
                            .expiresAt(e.getReservedUntil())
                            .maxBytes(props.getMaxFileBytes())
                            .bucket(e.getGcsBucket())
                            .objectPath(e.getGcsObjectPath())
                            .build();
                }

                // Otherwise return current state (idempotent behavior).
                // Client should use a NEW idempotency key to create a new reservation.
                return ReserveMentorShortResponse.builder()
                        .uploadId(e.getId())
                        .slot(e.getSlot())
                        .status(e.getStatus().name())
                        .uploadUrl(null)
                        .requiredHeaders(Map.of())
                        .expiresAt(e.getReservedUntil())
                        .maxBytes(props.getMaxFileBytes())
                        .bucket(e.getGcsBucket())
                        .objectPath(e.getGcsObjectPath())
                        .build();
            }
        }

        // ---- Validate title/desc/tags per YouTube limits ----
        String title = safe(req.getTitle());
        if (title.isBlank()) {
            throw new InvalidInputException("TITLE_REQUIRED", "title is required");
        }
        if (title.length() > ShortsTextValidationUtil.YT_TITLE_MAX_CHARS) {
            throw new InvalidInputException("TITLE_TOO_LONG", "title max 100 characters");
        }

        String description = req.getDescription() == null ? null : req.getDescription();
        if (description != null && ShortsTextValidationUtil.utf8Bytes(description) > ShortsTextValidationUtil.YT_DESCRIPTION_MAX_BYTES) {
            throw new InvalidInputException("DESCRIPTION_TOO_LONG",
                    "description max 5000 bytes (UTF-8 bytes, not characters)");
        }

        List<String> tags = ShortsTextValidationUtil.normalizeTags(req.getTags());
        int tagsTotal = ShortsTextValidationUtil.totalTagCharsCommaJoined(tags);
        if (tagsTotal > ShortsTextValidationUtil.YT_TAGS_TOTAL_MAX_CHARS) {
            throw new InvalidInputException("TAGS_TOO_LONG", "tags combined total must be <= 500 characters");
        }

        // ---- Pick lowest free slot 1..max ----
        int maxSlots = Math.max(1, props.getMaxVideosPerMentor());

        List<MentorShortVideo> occupiedRows = repo.findByUserIdAndStatuses(userId, OCCUPIED);
        Set<Integer> usedSlots = occupiedRows.stream()
                .map(MentorShortVideo::getSlot)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        int slot = 1;
        while (slot <= maxSlots && usedSlots.contains(slot)) slot++;
        if (slot > maxSlots) {
            throw new ConflictException("SLOTS_FULL", "All Shorts slots are currently in use.");
        }

        String bucket = props.getStagingBucket();
        if (isBlank(bucket)) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "STAGING_BUCKET_MISSING", "Staging bucket not configured.");
        }

        // Bind object path to DB row by embedding user+slot+time+uuid
        String objectPath = props.getObjectPrefix()
                + "/u_" + userId
                + "/slot_" + slot
                + "/" + Instant.now().toEpochMilli()
                + "_" + UUID.randomUUID()
                + ".mp4";

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(props.getReservationTtlSeconds());

        MentorShortVideo row = MentorShortVideo.builder()
                .userId(userId)
                .slot(slot)
                .status(MentorShortVideoStatus.RESERVED)
                .idempotencyKey(isBlank(idempotencyKey) ? null : idempotencyKey.trim())
                .title(title)
                .description(description)
                .tags(tags)
                .gcsBucket(bucket)
                .gcsObjectPath(objectPath)
                .reservedAt(now)
                .reservedUntil(expiresAt)
                .attemptCount(0)
                .nextAttemptAt(null)
                .build();

        // Note: slot-concurrency protection is best done via a DB constraint.
        // If you apply the recommended partial unique index (see migration),
        // we can safely retry once on conflict.
        try {
            repo.save(row);
        } catch (DataIntegrityViolationException dive) {
            // Best-effort single retry (race condition)
            log.warn("Reserve race detected for userId={}, retrying once. {}", userId, dive.getMessage());
            return reserve(userId, req, idempotencyKey); // one retry path
        }

        var signed = signedUrlService.createSignedPutUrl(
                bucket,
                objectPath,
                REQUIRED_CT,
                Duration.ofSeconds(props.getSignedUrlTtlSeconds()),
                props.getMaxFileBytes()
        );

        return ReserveMentorShortResponse.builder()
                .uploadId(row.getId())
                .slot(slot)
                .status(row.getStatus().name())
                .uploadUrl(signed.url().toString())
                .requiredHeaders(signed.requiredHeaders())
                .expiresAt(expiresAt)
                .maxBytes(props.getMaxFileBytes())
                .bucket(bucket)
                .objectPath(objectPath)
                .build();
    }

    @Override
    @Transactional
    public FinalizeMentorShortResponse finalizeUpload(Long userId, Long uploadId) {

        MentorShortVideo row = repo.findByIdAndUserId(uploadId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SHORT_NOT_FOUND", "Short upload not found"));

        // Idempotent finalize
        if (row.getStatus() == MentorShortVideoStatus.READY
                || row.getStatus() == MentorShortVideoStatus.UPLOADING
                || row.getStatus() == MentorShortVideoStatus.LIVE) {

            return FinalizeMentorShortResponse.builder()
                    .uploadId(row.getId())
                    .status(row.getStatus().name())
                    .bucket(row.getGcsBucket())
                    .objectPath(row.getGcsObjectPath())
                    .contentType(row.getContentType())
                    .sizeBytes(row.getSizeBytes() == null ? 0 : row.getSizeBytes())
                    .finalizedAt(row.getFinalizedAt())
                    .queued(true)
                    .build();
        }

        if (row.getStatus() != MentorShortVideoStatus.RESERVED) {
            throw new ConflictException("INVALID_STATE", "Cannot finalize upload in status: " + row.getStatus());
        }

        Instant now = Instant.now();
        if (row.getReservedUntil() != null && now.isAfter(row.getReservedUntil())) {
            row.setStatus(MentorShortVideoStatus.EXPIRED);
            repo.save(row);
            throw new ConflictException("RESERVATION_EXPIRED", "Upload reservation expired. Please reserve again.");
        }

        Blob blob = storage.get(row.getGcsBucket(), row.getGcsObjectPath());
        if (blob == null) {
            Map<String, Object> details = new HashMap<>();
            details.put("bucket", row.getGcsBucket());
            details.put("objectPath", row.getGcsObjectPath());
            throw new InvalidInputException("STAGED_OBJECT_MISSING", "Uploaded object not found in staging bucket", details);
        }

        long actualSize = blob.getSize();
        String actualCt = blob.getContentType();

        // Strict type checks (new requirement)
        if (actualCt == null || !REQUIRED_CT.equalsIgnoreCase(actualCt.trim())) {
            failAndDelete(row, blob, "ONLY_MP4_ALLOWED");
            throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "ONLY_MP4_ALLOWED", "Only video/mp4 is allowed");
        }

        if (actualSize <= 0) {
            failAndDelete(row, blob, "EMPTY_UPLOAD");
            throw new InvalidInputException("EMPTY_UPLOAD", "Uploaded file is empty.");
        }

        if (actualSize > props.getMaxFileBytes()) {
            failAndDelete(row, blob, "FILE_TOO_LARGE");
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "Uploaded file exceeds max allowed bytes.");
        }

        // Download once for sniff + metadata extraction
        Path temp = null;
        try {
            temp = Files.createTempFile("mentr_finalize_" + row.getId() + "_", ".mp4");

            try (ReadChannel reader = blob.reader();
                 InputStream in = Channels.newInputStream(reader)) {
                Files.copy(in, temp, StandardCopyOption.REPLACE_EXISTING);
            }

            // MP4 sniff ("ftyp")
            try (InputStream headerIn = Files.newInputStream(temp, StandardOpenOption.READ)) {
                if (!Mp4SnifferUtil.looksLikeMp4(headerIn)) {
                    failAndDelete(row, blob, "INVALID_MP4");
                    throw new InvalidInputException("INVALID_MP4", "Uploaded bytes do not look like a valid MP4 file.");
                }
            }

            // Extract MP4 metadata (duration + width/height incl rotation)
            Mp4MetadataUtil.VideoMetadata meta = Mp4MetadataUtil.read(temp);

            // Shorts validation (new requirements)
            int minSeconds = Math.max(1, props.getMinDurationSeconds());
            int configuredMax = Math.max(1, props.getMaxDurationSeconds());
            int hardCap = 180;
            int maxAllowed = Math.min(configuredMax, hardCap);

            double dur = meta.durationSeconds();
            int w = meta.width();
            int h = meta.height();

            if (dur < minSeconds) {
                failAndDelete(row, blob, "DURATION_TOO_SHORT_MIN_5S");
                throw new InvalidInputException("DURATION_TOO_SHORT_MIN_5S",
                        "Video duration must be >= " + minSeconds + " seconds");
            }

            if (dur > maxAllowed) {
                String code = (dur > hardCap) ? "NOT_SHORTS_ELIGIBLE" : "DURATION_TOO_LONG";
                failAndDelete(row, blob, code);
                throw new InvalidInputException(code, "Video duration must be <= " + maxAllowed + " seconds");
            }

            if (props.isRequireVerticalOrSquare()) {
                if (w <= 0 || h <= 0) {
                    failAndDelete(row, blob, "METADATA_UNAVAILABLE");
                    throw new InvalidInputException("METADATA_UNAVAILABLE", "Unable to read MP4 dimensions.");
                }

                boolean square = (w == h);
                boolean verticalOrSquare = (h > w) || (props.isAllowSquare() && square);

                if (!verticalOrSquare) {
                    failAndDelete(row, blob, "INVALID_SHORTS_ASPECT");
                    throw new InvalidInputException("INVALID_SHORTS_ASPECT",
                            "Shorts must be vertical or square (height >= width).");
                }
            }

            // ✅ Passed fast gate → READY + enqueue worker
            row.setStatus(MentorShortVideoStatus.READY);
            row.setFinalizedAt(now);
            row.setContentType(REQUIRED_CT);
            row.setSizeBytes(actualSize);

            row.setDurationSeconds(dur);
            row.setVideoWidth(w);
            row.setVideoHeight(h);

            row.setLastError(null);
            row.setNextAttemptAt(now);
            repo.save(row);

            return FinalizeMentorShortResponse.builder()
                    .uploadId(row.getId())
                    .status(row.getStatus().name())
                    .bucket(row.getGcsBucket())
                    .objectPath(row.getGcsObjectPath())
                    .contentType(row.getContentType())
                    .sizeBytes(row.getSizeBytes())
                    .finalizedAt(row.getFinalizedAt())
                    .queued(true)
                    .build();

        } catch (InvalidInputException iie) {
            // Must be BEFORE ApiException because InvalidInputException extends ApiException
            throw iie;

        } catch (ApiException ae) {
            throw ae;

        } catch (Exception ex) {
            log.error("Finalize failed (id={}): {}", row.getId(), ex.getMessage(), ex);
            failAndDelete(row, blob, "FINALIZE_ERROR: " + ex.getMessage());
            throw new ApiException(HttpStatus.BAD_REQUEST, "FINALIZE_FAILED", "Failed to finalize upload.");

        } finally {
            if (temp != null) {
                try { Files.deleteIfExists(temp); } catch (Exception ignore) {}
            }
        }

    }

    @Override
    @Transactional(readOnly = true)
    public MentorShortVideoListResponse listMyShorts(Long userId) {
        List<MentorShortVideo> items = repo.findByUserIdAndStatusNotOrderBySlotAscCreatedAtAsc(userId, MentorShortVideoStatus.DELETED);
        return MentorShortVideoListResponse.builder()
                .items(items.stream().map(MentorShortVideoMapper::toItem).toList())
                .build();
    }

    @Override
    @Transactional
    public DeleteMentorShortResponse deleteShort(Long userId, Long uploadId) {
        MentorShortVideo row = repo.findByIdAndUserId(uploadId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SHORT_NOT_FOUND", "Short not found"));

        // Soft delete (keeps history + avoids race with worker)
        row.setStatus(MentorShortVideoStatus.DELETED);
        repo.save(row);

        // Best-effort: delete staging object too
        try {
            if (row.getGcsBucket() != null && row.getGcsObjectPath() != null) {
                storage.delete(row.getGcsBucket(), row.getGcsObjectPath());
            }
        } catch (Exception e) {
            log.warn("Staging delete failed (id={}): {}", row.getId(), e.getMessage());
        }

        return DeleteMentorShortResponse.builder().deleted(true).build();
    }

    private void failAndDelete(MentorShortVideo row, Blob blob, String errCode) {
        row.setStatus(MentorShortVideoStatus.FAILED);
        row.setLastError(errCode);
        row.setNextAttemptAt(null);
        repo.save(row);

        try {
            if (blob != null) {
                storage.delete(blob.getBlobId());
            } else if (row.getGcsBucket() != null && row.getGcsObjectPath() != null) {
                storage.delete(row.getGcsBucket(), row.getGcsObjectPath());
            }
        } catch (Exception e) {
            log.warn("Finalize cleanup delete failed (id={}): {}", row.getId(), e.getMessage());
        }
    }

    private static String safe(String s) { return s == null ? "" : s.trim(); }
    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
