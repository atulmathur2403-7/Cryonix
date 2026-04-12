package com.Mentr_App.Mentr_V1.repository;




import com.Mentr_App.Mentr_V1.dto.dashboard.DateCountProjection;
import com.Mentr_App.Mentr_V1.dto.dashboard.SummaryProjection;
import com.Mentr_App.Mentr_V1.model.Session;
import com.Mentr_App.Mentr_V1.model.enums.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByMentor_MentorIdOrderByStartTimeDesc(Long mentorId);
    List<Session> findByLearner_UserIdOrderByStartTimeDesc(Long learnerId);
    Optional<Session> findByBookingId(Long bookingId);
    @EntityGraph(attributePaths = {"mentor.user", "learner"})
    Optional<Session> findById(Long id);

    Optional<Session> findTopByLearner_UserIdAndMentor_MentorIdAndStatusOrderByStartTimeDesc(
            Long learnerId, Long mentorId, SessionStatus status);

    // ✅ new pageable versions
    Page<Session> findByMentor_MentorIdOrderByStartTimeDesc(Long mentorId, Pageable pageable);
    Page<Session> findByLearner_UserIdOrderByStartTimeDesc(Long learnerId, Pageable pageable);

    // summary: total sessions & total minutes in a time window (rangeInterval e.g. '30 days')
    @Query(value = """
        SELECT COUNT(*) AS total_sessions,
               COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))/60)::bigint,0) AS total_minutes
        FROM sessions s
        WHERE s.mentor_id = :mentorId
          AND s.status = 'COMPLETED'
          AND s.start_time >= (CURRENT_TIMESTAMP - CAST(:rangeInterval AS interval))
        """, nativeQuery = true)
    SummaryProjection summarySessions(
            @Param("mentorId") Long mentorId,
            @Param("rangeInterval") String rangeInterval);

    // daily aggregation for sessions: day, count, minutes
    @Query(value = """
        SELECT (DATE_TRUNC('day', s.start_time))::date AS day,
               COUNT(*) AS count,
               COALESCE(SUM(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/60)::bigint,0) AS minutes
        FROM sessions s
        WHERE s.mentor_id = :mentorId
          AND s.status = 'COMPLETED'
          AND s.start_time >= (CURRENT_TIMESTAMP - CAST(:rangeInterval AS interval))
        GROUP BY day
        ORDER BY day
        """, nativeQuery = true)
    List<DateCountProjection> aggregateSessionsByDay(
            @Param("mentorId") Long mentorId,
            @Param("rangeInterval") String rangeInterval);

    /**
     * Find all sessions that are still CONFIRMED but whose endTime is already in the past.
     *
     * Used by the auto-end scheduler to avoid calls running forever in DB state.
     */
    List<Session> findByStatusAndEndTimeBefore(SessionStatus status, Instant cutoffTime);

}

