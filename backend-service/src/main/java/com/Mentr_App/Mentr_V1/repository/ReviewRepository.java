package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.dto.dashboard.DateCountProjection;
import com.Mentr_App.Mentr_V1.dto.review.MentorRatingStats;
import com.Mentr_App.Mentr_V1.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMentor_MentorId(Long mentorId);
    boolean existsBySession_IdAndLearner_UserId(Long sessionId, Long learnerId);
    Page<Review> findByMentor_MentorId(Long mentorId, Pageable pageable);


    // ✅ Optimized aggregate query for all mentors
    @Query("""
        SELECT r.mentor.mentorId AS mentorId,
               AVG(r.rating) AS averageRating,
               COUNT(r.id) AS reviewCount
        FROM Review r
        GROUP BY r.mentor.mentorId
        """)
    List<MentorRatingStats> getMentorRatingStats();


    @Query("""
    SELECT r.mentor.mentorId AS mentorId,
           AVG(r.rating) AS averageRating,
           COUNT(r.id) AS reviewCount
    FROM Review r
    WHERE r.mentor.mentorId = :mentorId
    GROUP BY r.mentor.mentorId
    """)
    Optional<MentorRatingStats> getRatingsSummaryForMentor(Long mentorId);


    @Query(value = """
        SELECT (DATE_TRUNC('day', r.created_at))::date AS day,
               COUNT(*) AS count,
               NULL::bigint AS minutes
        FROM reviews r
        WHERE r.mentor_id = :mentorId
          AND r.created_at >= (CURRENT_TIMESTAMP - CAST(:rangeInterval AS interval))
        GROUP BY day
        ORDER BY day
        """, nativeQuery = true)
    List<DateCountProjection> aggregateReviewsByDay(
            @Param("mentorId") Long mentorId,
            @Param("rangeInterval") String rangeInterval);

    @Query(value = """
        SELECT COUNT(*) FROM reviews r
        WHERE r.mentor_id = :mentorId
          AND r.created_at >= (CURRENT_TIMESTAMP - CAST(:rangeInterval AS interval))
        """, nativeQuery = true)
    Long summaryReviews(
            @Param("mentorId") Long mentorId,
            @Param("rangeInterval") String rangeInterval);

}

