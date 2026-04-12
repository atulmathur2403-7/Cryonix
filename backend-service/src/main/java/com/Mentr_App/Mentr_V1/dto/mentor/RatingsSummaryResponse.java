package com.Mentr_App.Mentr_V1.dto.mentor;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for mentor rating summary (average rating + review count).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingsSummaryResponse {
    private Long mentorId;
    private Double averageRating;
    private Integer reviewCount;
}

