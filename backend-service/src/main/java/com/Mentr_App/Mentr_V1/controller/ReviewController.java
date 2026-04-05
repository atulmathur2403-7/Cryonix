package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.dto.review.ReviewRequest;
import com.Mentr_App.Mentr_V1.dto.review.ReviewResponse;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/sessions/{sessionId}/reviews")
    public ResponseEntity<ReviewResponse> addReview(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId,
            @Valid @RequestBody ReviewRequest request) {

        ReviewResponse resp = reviewService.addReview(sessionId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @GetMapping("/reviews/mentor/{mentorId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForMentor(@PathVariable Long mentorId) {
        return ResponseEntity.ok(reviewService.getReviewsForMentor(mentorId));
    }
}

