package com.Mentr_App.Mentr_V1.dto.user;


import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ProfileImageResponse {
    private String imageUrl;
    private String storagePath;
    private String contentType;
    private long sizeBytes;
    private Instant updatedAt;
}

