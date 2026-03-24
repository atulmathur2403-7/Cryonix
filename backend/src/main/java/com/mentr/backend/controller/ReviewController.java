package com.mentr.backend.controller;

import com.mentr.backend.model.Review;
import com.mentr.backend.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @GetMapping("/mentor/{mentorId}")
    public List<Review> getReviewsByMentor(@PathVariable String mentorId) {
        return reviewRepository.findByMentorId(mentorId);
    }

    @GetMapping("/learner/{learnerId}")
    public List<Review> getReviewsByLearner(@PathVariable String learnerId) {
        return reviewRepository.findByLearnerId(learnerId);
    }

    @PostMapping
    public Review createReview(@RequestBody Review review) {
        review.setCreatedAt(java.time.Instant.now().toString());
        return reviewRepository.save(review);
    }
}
