package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.dto.review.ReviewRequest;
import com.Mentr_App.Mentr_V1.dto.review.ReviewResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.Review;
import com.Mentr_App.Mentr_V1.model.Session;
import com.Mentr_App.Mentr_V1.model.enums.SessionStatus;
import com.Mentr_App.Mentr_V1.repository.ReviewRepository;
import com.Mentr_App.Mentr_V1.repository.SessionRepository;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse addReview(Long sessionId, Long learnerId, ReviewRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BookingException("Session not found"));

        if (!session.getLearner().getUserId().equals(learnerId)) {
            throw new BookingException("You are not allowed to review this session");
        }
        if (!SessionStatus.COMPLETED.equals(session.getStatus())) {
            throw new BookingException("Session not completed yet");
        }
        if (reviewRepository.existsBySession_IdAndLearner_UserId(sessionId, learnerId)) {
            throw new BookingException("Review already submitted for this session");
        }

        Review review = Review.builder()
                .session(session)
                .learner(session.getLearner())
                .mentor(session.getMentor())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    @Override
    public List<ReviewResponse> getReviewsForMentor(Long mentorId) {
        return reviewRepository.findByMentor_MentorId(mentorId).stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewResponse toResponse(Review r) {
        ReviewResponse dto = new ReviewResponse();
        dto.setId(r.getId());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setLearnerName(r.getLearner().getName());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }

    @Override
    public Page<ReviewResponse> getAllReviewsForMentor(Long mentorId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByMentor_MentorId(mentorId, pageable);

        return reviews.map(this::toResponse); // map entities → DTOs
    }

}

