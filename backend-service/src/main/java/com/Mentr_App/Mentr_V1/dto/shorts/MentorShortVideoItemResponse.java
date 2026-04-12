package com.Mentr_App.Mentr_V1.dto.shorts;


import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class MentorShortVideoItemResponse {
    private Long id;
    private Integer slot;
    private String status;

    private String title;
    private String description;
    private List<String> tags;

    private String contentType;
    private long sizeBytes;

    private Double durationSeconds;
    private Integer width;
    private Integer height;

    private String youtubeVideoId;
    private String youtubeUrl;

    private Instant createdAt;
    private Instant uploadedAt;

    private String lastError;
}
