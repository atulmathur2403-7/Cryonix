package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.exception.ApiException;
import com.google.cloud.storage.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class GcsSignedUrlServiceImpl implements GcsSignedUrlService {

    private final Storage storage;

    @Override
    public SignedPutUrl createSignedPutUrl(String bucket, String objectPath, String contentType, Duration ttl, long maxBytes) {
        try {
            BlobInfo blobInfo = BlobInfo.newBuilder(bucket, objectPath)
                    .setContentType(contentType)
                    .build();

            // Enforce max upload size at GCS layer.
            // IMPORTANT: Must be included in request headers and signature.
            String rangeHeaderValue = "0," + maxBytes;

            Map<String, String> extHeaders = Map.of(
                    "x-goog-content-length-range", rangeHeaderValue
            );

            Map<String, String> requiredHeaders = new LinkedHashMap<>();
            requiredHeaders.put("Content-Type", contentType);
            requiredHeaders.put("x-goog-content-length-range", rangeHeaderValue);

            URL url = storage.signUrl(
                    blobInfo,
                    ttl.toSeconds(),
                    TimeUnit.SECONDS,
                    Storage.SignUrlOption.httpMethod(HttpMethod.PUT),
                    Storage.SignUrlOption.withV4Signature(),
                    Storage.SignUrlOption.withContentType(),
                    Storage.SignUrlOption.withExtHeaders(extHeaders)
            );

            return new SignedPutUrl(url, requiredHeaders);

        } catch (Exception e) {
            log.error("Failed to create signed PUT URL (bucket={}, path={}): {}", bucket, objectPath, e.getMessage(), e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "SIGNED_URL_FAILED", "Failed to create signed upload URL.");
        }
    }
}
