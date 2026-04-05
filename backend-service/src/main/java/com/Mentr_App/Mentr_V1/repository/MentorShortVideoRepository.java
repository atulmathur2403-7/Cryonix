package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.MentorShortVideo;
import com.Mentr_App.Mentr_V1.model.enums.MentorShortVideoStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;

@Repository
public interface MentorShortVideoRepository extends JpaRepository<MentorShortVideo, Long> {

    List<MentorShortVideo> findByUserIdAndStatusNotOrderBySlotAscCreatedAtAsc(Long userId, MentorShortVideoStatus status);

    Optional<MentorShortVideo> findByUserIdAndIdempotencyKey(Long userId, String idempotencyKey);

    Optional<MentorShortVideo> findByIdAndUserId(Long id, Long userId);

    @Query("""
        select msv
        from MentorShortVideo msv
        where msv.userId = :userId
          and msv.status in :statuses
        order by msv.slot asc, msv.createdAt asc
    """)
    List<MentorShortVideo> findByUserIdAndStatuses(
            @Param("userId") Long userId,
            @Param("statuses") Collection<MentorShortVideoStatus> statuses
    );

    @Query("""
        select msv
        from MentorShortVideo msv
        where msv.status = :status
          and msv.reservedUntil is not null
          and msv.reservedUntil <= :now
    """)
    List<MentorShortVideo> findExpiredReservations(
            @Param("status") MentorShortVideoStatus status,
            @Param("now") Instant now
    );

    /**
     * Worker picks READY items whose nextAttemptAt is null or <= now.
     * Pessimistic lock prevents multiple workers from uploading the same row.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select msv
        from MentorShortVideo msv
        where msv.status = :status
          and (msv.nextAttemptAt is null or msv.nextAttemptAt <= :now)
        order by msv.createdAt asc
    """)
    List<MentorShortVideo> findNextReadyForUpload(
            @Param("status") MentorShortVideoStatus status,
            @Param("now") Instant now,
            Pageable pageable
    );
}
