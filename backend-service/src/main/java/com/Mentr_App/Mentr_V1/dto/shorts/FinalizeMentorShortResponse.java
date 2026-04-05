package com.Mentr_App.Mentr_V1.dto.shorts;


import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class FinalizeMentorShortResponse {
    private Long uploadId;
    private String status;

    private String bucket;
    private String objectPath;

    private String contentType;
    private long sizeBytes;

    private Instant finalizedAt;
    private boolean queued;
}

