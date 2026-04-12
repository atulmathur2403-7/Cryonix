package com.Mentr_App.Mentr_V1.config;


import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;

import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

@Configuration
@Slf4j
public class GcpStorageConfig {

    @Value("${gcp.service-account-path:}")
    private String serviceAccountPath;

    @Bean
    public Storage gcsStorage() {
        try {
            StorageOptions.Builder builder = StorageOptions.newBuilder();

            if (serviceAccountPath != null && !serviceAccountPath.isBlank()) {
                // Supports classpath resource path (similar to FirebaseConfig)
                try (InputStream in = new ClassPathResource(serviceAccountPath).getInputStream()) {
                    GoogleCredentials credentials = GoogleCredentials.fromStream(in);
                    builder.setCredentials(credentials);
                    log.info("✅ GCS Storage initialized using service account from classpath: {}", serviceAccountPath);
                }
            } else {
                // Application Default Credentials (ADC)
                log.info("✅ GCS Storage initialized using Application Default Credentials (ADC)");
            }

            return builder.build().getService();
        } catch (Exception e) {
            log.error("❌ Failed to initialize GCS Storage client: {}", e.getMessage(), e);
            throw new IllegalStateException("GCS Storage client init failed");
        }
    }
}

