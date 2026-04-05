package com.Mentr_App.Mentr_V1.dto.review;


/**
 * Projection for aggregated mentor rating stats.
 */
public interface MentorRatingStats {
    Long getMentorId();
    Double getAverageRating();
    Integer getReviewCount();
}

