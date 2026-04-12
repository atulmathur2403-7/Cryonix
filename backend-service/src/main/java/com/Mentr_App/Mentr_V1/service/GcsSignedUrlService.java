package com.Mentr_App.Mentr_V1.service;


import java.net.URL;
import java.time.Duration;
import java.util.Map;

public interface GcsSignedUrlService {

    SignedPutUrl createSignedPutUrl(
            String bucket,
            String objectPath,
            String contentType,
            Duration ttl,
            long maxBytes
    );

    record SignedPutUrl(URL url, Map<String, String> requiredHeaders) {}
}
