package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.SessionExtension;
import com.Mentr_App.Mentr_V1.model.enums.SessionExtensionStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionExtensionRepository extends JpaRepository<SessionExtension, Long> {

    Optional<SessionExtension> findByStripePaymentIntentId(String stripePaymentIntentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM SessionExtension e WHERE e.id = :id")
    Optional<SessionExtension> findByIdForUpdate(@Param("id") Long id);

    List<SessionExtension> findTop5BySession_IdOrderByCreatedAtDesc(Long sessionId);

    @Query("""
        SELECT e FROM SessionExtension e
         WHERE e.session.id = :sessionId
           AND e.status IN :statuses
         ORDER BY e.createdAt DESC
    """)
    List<SessionExtension> findActiveForSession(@Param("sessionId") Long sessionId,
                                                @Param("statuses") List<SessionExtensionStatus> statuses);

    @Query("""
        SELECT e FROM SessionExtension e
         WHERE e.status IN :statuses
           AND e.expiresAt IS NOT NULL
           AND e.expiresAt <= :now
    """)
    List<SessionExtension> findExpired(@Param("statuses") List<SessionExtensionStatus> statuses,
                                       @Param("now") Instant now);
}

