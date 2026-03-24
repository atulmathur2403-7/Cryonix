package com.mentr.backend.repository;

import com.mentr.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByMentorId(String mentorId);
    List<Review> findByLearnerId(String learnerId);
}
