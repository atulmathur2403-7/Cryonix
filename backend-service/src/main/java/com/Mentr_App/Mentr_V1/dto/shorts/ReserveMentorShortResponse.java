package com.Mentr_App.Mentr_V1.dto.shorts;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
public class ReserveMentorShortResponse {

    private Long uploadId;
    private Integer slot;
    private String status;

    private String uploadUrl;
    private Map<String, String> requiredHeaders;

    private Instant expiresAt;
    private long maxBytes;

    // Useful for debugging/support (object binding)
    private String bucket;
    private String objectPath;
}
