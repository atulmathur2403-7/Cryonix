package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.MentorPresence;
import com.Mentr_App.Mentr_V1.model.enums.MentorPresenceStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * MENTOR PRESENCE REPOSITORY (Talk Now)
 * -------------------------------------
 * JPA access for MentorPresence rows.
 *
 * Product Flow:
 *  - PaymentServiceImpl: atomic LIVE → RINGING claim.
 *  - TalkNowServiceImpl: RINGING / IN_CALL transitions.
 *  - TalkNowCleanupScheduler: cleanup stale LIVE / RINGING.
 */
@Repository
public interface MentorPresenceRepository extends JpaRepository<MentorPresence, Long> {

    Optional<MentorPresence> findByMentor_MentorId(Long mentorId);

    List<MentorPresence> findByStatus(MentorPresenceStatus status);

    /**
     * Atomic LIVE → RINGING transition with active booking + expiry.
     *
     * Usage:
     *  - Called by PaymentServiceImpl.handlePaymentSuccess(...)
     *    to pick the Talk Now winner.
     *
     * Returns:
     *  - 1 → success (we won the race; now RINGING with this booking)
     *  - 0 → failure (mentor not LIVE or already taken)
     */
    @Modifying
    @Query("""
        UPDATE MentorPresence p
           SET p.status = :newStatus,
               p.activeBookingId = :bookingId,
               p.ringExpiresAt = :ringExpiresAt,
               p.updatedAt = CURRENT_TIMESTAMP
         WHERE p.mentor.mentorId = :mentorId
           AND p.status = :expectedStatus
    """)
    int updateStatusIfMatches(@Param("mentorId") Long mentorId,
                              @Param("expectedStatus") MentorPresenceStatus expectedStatus,
                              @Param("newStatus") MentorPresenceStatus newStatus,
                              @Param("bookingId") Long bookingId,
                              @Param("ringExpiresAt") Instant ringExpiresAt);

    /**
     * Clear active booking & ringing + change status guarded by expectedStatus.
     *
     * Used for:
     *  - RINGING → LIVE (declined / expired).
     *  - RINGING → OFFLINE (auto-off via scheduler).
     */
    @Modifying
    @Query("""
        UPDATE MentorPresence p
           SET p.status = :newStatus,
               p.activeBookingId = null,
               p.ringExpiresAt = null,
               p.updatedAt = CURRENT_TIMESTAMP
         WHERE p.mentor.mentorId = :mentorId
           AND p.status = :expectedStatus
           AND (p.activeBookingId IS NULL OR p.activeBookingId = :bookingId)
    """)
    int clearActiveBookingAndUpdateStatus(@Param("mentorId") Long mentorId,
                                          @Param("expectedStatus") MentorPresenceStatus expectedStatus,
                                          @Param("newStatus") MentorPresenceStatus newStatus,
                                          @Param("bookingId") Long bookingId);
}

