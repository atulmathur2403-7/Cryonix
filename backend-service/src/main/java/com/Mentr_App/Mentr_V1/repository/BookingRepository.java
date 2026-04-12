package com.Mentr_App.Mentr_V1.repository;



import com.Mentr_App.Mentr_V1.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByLearner_UserId(Long learnerId);
    List<Booking> findByMentor_MentorId(Long mentorId);

    // Learner bookings (paginated)
    Page<Booking> findByLearner_UserId(Long learnerId, Pageable pageable);

    // Mentor bookings (paginated)
    Page<Booking> findByMentor_MentorId(Long mentorId, Pageable pageable);


    /**
     * Returns true if there exists any CONFIRMED booking for the same mentor
     * that overlaps the given [start, end) window.
     */
    @Query("""
        select case when count(b) > 0 then true else false end
        from Booking b
        where b.mentor.mentorId = :mentorId
          and upper(b.status) = 'CONFIRMED'
          and b.startTime < :endTs
          and b.endTime   > :startTs
    """)
    boolean existsConfirmedOverlap(@Param("mentorId") Long mentorId,
                                   @Param("startTs") Instant startTs,
                                   @Param("endTs") Instant endTs);


    @Query("""
  select b from Booking b
  where b.mentor.mentorId = :mentorId
    and upper(b.status) = 'CONFIRMED'
    and b.startTime < :toTs
    and b.endTime   > :fromTs
  order by b.startTime asc
""")
    List<Booking> findConfirmedInRange(
            @Param("mentorId") Long mentorId,
            @Param("fromTs") Instant fromTs,
            @Param("toTs") Instant toTs
    );


    /**
     * Check if there exists at least one booking between learner and mentor
     * whose status is in the provided validStatuses list.
     *
     * Used by:
     *  - ChatEligibilityService to decide if chat is allowed.
     *  - BookingChatSyncService when toggling ChatConversation.isEnabled.
     */
    @Query("""
        select case when count(b) > 0 then true else false end
        from Booking b
        where b.learner.userId = :learnerId
          and b.mentor.mentorId = :mentorId
          and upper(b.status) in :validStatuses
    """)
    boolean existsValidBookingBetween(
            @Param("learnerId") Long learnerId,
            @Param("mentorId") Long mentorId,
            @Param("validStatuses") List<String> validStatuses
    );


    /**
     * Find the latest booking between a learner and mentor whose status
     * is in the provided validStatuses list.
     *
     * "Latest" is defined as the booking with the most recent startTime.
     */
    @Query("""
        select b
        from Booking b
        where b.learner.userId = :learnerId
          and b.mentor.mentorId = :mentorId
          and upper(b.status) in :validStatuses
        order by b.startTime desc
    """)
    Optional<Booking> findLatestValidBookingBetween(
            @Param("learnerId") Long learnerId,
            @Param("mentorId") Long mentorId,
            @Param("validStatuses") List<String> validStatuses
    );


}
