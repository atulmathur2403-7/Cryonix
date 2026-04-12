package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.review.ReviewRequest;
import com.Mentr_App.Mentr_V1.dto.review.ReviewResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ReviewService {
    ReviewResponse addReview(Long sessionId, Long learnerId, ReviewRequest request);
    ReviewResponse addReviewForMentor(Long mentorId, Long learnerId, ReviewRequest request);
    List<ReviewResponse> getReviewsForMentor(Long mentorId);
    Page<ReviewResponse> getAllReviewsForMentor(Long mentorId, int page, int size);
}

