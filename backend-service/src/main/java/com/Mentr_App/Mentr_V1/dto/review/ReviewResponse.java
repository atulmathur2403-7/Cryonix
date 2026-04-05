package com.Mentr_App.Mentr_V1.dto.review;

import lombok.Data;
import java.time.Instant;

@Data
public class ReviewResponse {
    private Long id;
    private int rating;
    private String comment;
    private String learnerName;
    private Instant createdAt;
}