package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.user.ProfileImageDeleteResponse;
import com.Mentr_App.Mentr_V1.dto.user.ProfileImageResponse;
import com.Mentr_App.Mentr_V1.exception.ApiException;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import com.Mentr_App.Mentr_V1.util.ImageProcessingUtil;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Bucket;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileImageServiceImpl implements UserProfileImageService {

    // ✅ All configurable via application.yml / env (defaults provided)
    @Value("${app.profile-image.max-bytes:5242880}")
    private long maxBytes;

    @Value("${app.profile-image.max-dimension:5000}")
    private int maxDimension;

    @Value("${app.profile-image.max-pixels:20000000}")
    private long maxPixels;

    @Value("${app.profile-image.output-size:512}")
    private int outputSize;

    @Value("${app.profile-image.jpeg-quality:0.85}")
    private float jpegQuality;

    private final UserRepository userRepository;
    private final FirebaseApp firebaseApp;

    // MVP idempotency store (10 minutes)
    private final com.github.benmanes.caffeine.cache.Cache<String, ProfileImageResponse> idemCache =
            com.github.benmanes.caffeine.cache.Caffeine.newBuilder()
                    .expireAfterWrite(java.time.Duration.ofMinutes(10))
                    .maximumSize(10_000)
                    .build();

    @Override
    @Transactional
    public ProfileImageResponse uploadProfileImage(Long userId, MultipartFile image, String idempotencyKey) {

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            ProfileImageResponse cached = idemCache.getIfPresent(cacheKey(userId, idempotencyKey));
            if (cached != null) return cached;
        }

        // 1) Validate request/file shape
        if (image == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MISSING_FILE", "Image file is required.");
        }
        if (image.isEmpty() || image.getSize() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MISSING_FILE", "Uploaded file is empty.");
        }
        if (image.getSize() > maxBytes) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE",
                    "Max allowed size is " + maxBytes + " bytes.");
        }

        // 2) Validate content type
        String contentType = image.getContentType() != null ? image.getContentType().toLowerCase() : "";
        if (!isAllowedContentType(contentType)) {
            throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_TYPE",
                    "Only image/jpeg, image/png, image/webp are allowed.");
        }

        // 3) Read bytes
        byte[] rawBytes;
        try {
            rawBytes = image.getBytes();
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_IMAGE", "Unable to read uploaded file.");
        }

        // 4) Decode + validate actual bytes
        java.awt.image.BufferedImage decoded;
        try {
            decoded = ImageProcessingUtil.decodeImage(rawBytes);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_IMAGE", "Uploaded file is not a valid image.");
        }
        if (decoded == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_IMAGE", "Uploaded file is not a valid image.");
        }

        // 5) Validate dimensions (anti-bomb)
        try {
            ImageProcessingUtil.validateDimensions(decoded, maxDimension, maxPixels);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "IMAGE_TOO_LARGE_DIMENSIONS",
                    "Image dimensions are too large.");
        }

        // 6) ✅ LinkedIn-style normalize: square crop + resize to outputSize + JPEG encode
        byte[] normalized;
        try {
            normalized = ImageProcessingUtil.normalizeToJpegAvatar(decoded, outputSize, jpegQuality);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_IMAGE", "Failed to normalize image.");
        }

        // 7) Load user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        String oldPath = user.getProfileImagePath();

        // 8) Generate versioned storage path
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString();
        String storagePath = "users/" + userId + "/profile/" + timestamp + "_" + uuid + ".jpg";

        // Firebase token (stable download URL)
        String token = UUID.randomUUID().toString();

        Bucket bucket = StorageClient.getInstance(firebaseApp).bucket();
        if (bucket == null) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FAILED",
                    "Firebase Storage bucket is not configured.");
        }
        String bucketName = bucket.getName();

        // 9) Upload first, then DB update
        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("firebaseStorageDownloadTokens", token);

            BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, storagePath)
                    .setContentType("image/jpeg")
                    .setCacheControl("public, max-age=31536000") // safe due to versioned filename
                    .setMetadata(metadata)
                    .build();

            bucket.getStorage().create(blobInfo, normalized);

        } catch (Exception e) {
            log.error("Profile image upload failed (userId={}, path={}): {}", userId, storagePath, e.getMessage(), e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "UPLOAD_FAILED", "Failed to upload image to storage.");
        }

        String imageUrl = buildFirebaseTokenUrl(bucketName, storagePath, token);
        Instant now = Instant.now();

        // 10) DB update (truth points to existing object)
        try {
            user.setProfileImagePath(storagePath);
            user.setProfileImageToken(token);
            user.setProfileImageUrl(imageUrl);
            user.setProfileImageUpdatedAt(now);

            // Backward compatibility for existing DTOs/services
            user.setProfilePic(imageUrl);

            userRepository.save(user);
        } catch (Exception e) {
            safeDelete(bucket, storagePath); // compensate
            log.error("DB update failed after upload (userId={}): {}", userId, e.getMessage(), e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "DB_UPDATE_FAILED",
                    "Failed to update user profile with new image.");
        }

        // 11) Best-effort delete old object
        if (oldPath != null && !oldPath.isBlank() && !oldPath.equals(storagePath)) {
            safeDelete(bucket, oldPath);
        }

        ProfileImageResponse resp = ProfileImageResponse.builder()
                .imageUrl(imageUrl)
                .storagePath(storagePath)
                .contentType("image/jpeg")
                .sizeBytes(normalized.length)
                .updatedAt(now)
                .build();

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            idemCache.put(cacheKey(userId, idempotencyKey), resp);
        }

        return resp;
    }

    @Override
    public ProfileImageResponse getProfileImage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        if (user.getProfileImageUrl() == null || user.getProfileImageUrl().isBlank()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NO_PROFILE_IMAGE", "No profile image uploaded.");
        }

        return ProfileImageResponse.builder()
                .imageUrl(user.getProfileImageUrl())
                .storagePath(user.getProfileImagePath())
                .contentType("image/jpeg")
                .sizeBytes(0L)
                .updatedAt(user.getProfileImageUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public ProfileImageDeleteResponse deleteProfileImage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found."));

        String path = user.getProfileImagePath();
        if (path == null || path.isBlank()) {
            return ProfileImageDeleteResponse.builder().deleted(true).build();
        }

        Bucket bucket = StorageClient.getInstance(firebaseApp).bucket();
        if (bucket != null) {
            safeDelete(bucket, path);
        }

        user.setProfileImagePath(null);
        user.setProfileImageToken(null);
        user.setProfileImageUrl(null);
        user.setProfileImageUpdatedAt(null);

        // keep compatibility
        user.setProfilePic(null);

        userRepository.save(user);

        return ProfileImageDeleteResponse.builder().deleted(true).build();
    }

    private boolean isAllowedContentType(String ct) {
        return "image/jpeg".equals(ct)
                || "image/jpg".equals(ct)   // some clients send this
                || "image/png".equals(ct)
                || "image/webp".equals(ct);
    }

    private String buildFirebaseTokenUrl(String bucket, String objectPath, String token) {
        String encoded = URLEncoder.encode(objectPath, StandardCharsets.UTF_8).replace("+", "%20");
        return "https://firebasestorage.googleapis.com/v0/b/" + bucket + "/o/" + encoded + "?alt=media&token=" + token;
    }

    private void safeDelete(Bucket bucket, String path) {
        try {
            Blob blob = bucket.get(path);
            if (blob != null) {
                boolean ok = blob.delete();
                if (!ok) {
                    log.warn("Old profile image delete returned false (path={})", path);
                }
            }
        } catch (Exception e) {
            log.warn("Old profile image delete failed (path={}): {}", path, e.getMessage());
        }
    }

    private String cacheKey(Long userId, String key) {
        return userId + "::" + key;
    }
}
