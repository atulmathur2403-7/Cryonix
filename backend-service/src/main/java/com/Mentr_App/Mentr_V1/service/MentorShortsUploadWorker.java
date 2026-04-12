package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.config.MentorShortsProperties;
import com.Mentr_App.Mentr_V1.model.MentorShortVideo;
import com.Mentr_App.Mentr_V1.model.enums.MentorShortVideoStatus;
import com.Mentr_App.Mentr_V1.repository.MentorShortVideoRepository;
import com.google.cloud.ReadChannel;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Storage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.channels.Channels;
import java.nio.file.*;
import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MentorShortsUploadWorker {

    private final MentorShortsProperties props;
    private final MentorShortVideoRepository repo;
    private final Storage storage;
    private final YouTubeUploadService youTubeUploadService;

    @Scheduled(fixedDelayString = "${mentr.youtube.shorts.worker.poll-delay-ms:15000}")
    @Transactional
    public void processBatch() {
        Instant now = Instant.now();

        List<MentorShortVideo> batch = repo.findNextReadyForUpload(
                MentorShortVideoStatus.READY,
                now,
                PageRequest.of(0, Math.max(1, props.getWorker().getBatchSize()))
        );

        for (MentorShortVideo row : batch) {
            try {
                processOne(row);
            } catch (Exception ex) {
                log.error("Short worker failed (id={}): {}", row.getId(), ex.getMessage(), ex);
                failWithBackoff(row, "WORKER_ERROR: " + ex.getMessage());
            }
        }
    }

    private void processOne(MentorShortVideo row) throws Exception {

        // Skip if status changed while picked
        if (row.getStatus() != MentorShortVideoStatus.READY) return;

        int attempts = row.getAttemptCount() == null ? 0 : row.getAttemptCount();
        if (attempts >= props.getWorker().getMaxAttempts()) {
            row.setStatus(MentorShortVideoStatus.FAILED);
            row.setLastError("MAX_ATTEMPTS_REACHED");
            repo.save(row);
            return;
        }

        row.setStatus(MentorShortVideoStatus.UPLOADING);
        repo.save(row);

        Path temp = Files.createTempFile("mentr_short_" + row.getId() + "_", ".mp4");
        try {
            Blob blob = storage.get(row.getGcsBucket(), row.getGcsObjectPath());
            if (blob == null) {
                row.setStatus(MentorShortVideoStatus.FAILED);
                row.setLastError("STAGED_OBJECT_MISSING");
                repo.save(row);
                return;
            }

            try (ReadChannel reader = blob.reader();
                 InputStream in = Channels.newInputStream(reader)) {
                Files.copy(in, temp, StandardCopyOption.REPLACE_EXISTING);
            }

            // Worker no longer validates duration/aspect — finalize already guaranteed Shorts-only.
            String title = (row.getTitle() == null || row.getTitle().isBlank())
                    ? ("Mentr Short (slot " + row.getSlot() + ")")
                    : row.getTitle();

            String desc = row.getDescription() == null ? "" : row.getDescription();
            List<String> tags = row.getTags() == null ? List.of() : row.getTags();

            YouTubeUploadService.UploadResult res = youTubeUploadService.uploadShortVideo(temp, title, desc, tags);

            row.setYoutubeVideoId(res.videoId());
            row.setYoutubeUrl(res.youtubeUrl());
            row.setUploadedAt(Instant.now());
            row.setStatus(MentorShortVideoStatus.LIVE);
            row.setLastError(null);
            repo.save(row);

            // Best-effort cleanup staged object
            try {
                storage.delete(row.getGcsBucket(), row.getGcsObjectPath());
            } catch (Exception e) {
                log.warn("Staging cleanup failed for id={}: {}", row.getId(), e.getMessage());
            }

        } finally {
            try { Files.deleteIfExists(temp); } catch (Exception ignore) {}
        }
    }

    private void failWithBackoff(MentorShortVideo row, String err) {
        int attempts = row.getAttemptCount() == null ? 0 : row.getAttemptCount();
        attempts++;

        row.setAttemptCount(attempts);
        row.setLastError(err);

        if (attempts >= props.getWorker().getMaxAttempts()) {
            row.setStatus(MentorShortVideoStatus.FAILED);
            row.setNextAttemptAt(null);
        } else {
            long base = props.getWorker().getBaseBackoffSeconds();
            long backoff = (long) (base * Math.pow(2, Math.min(6, attempts - 1))); // cap exponent
            row.setStatus(MentorShortVideoStatus.READY);
            row.setNextAttemptAt(Instant.now().plusSeconds(backoff));
        }
        repo.save(row);
    }
}
