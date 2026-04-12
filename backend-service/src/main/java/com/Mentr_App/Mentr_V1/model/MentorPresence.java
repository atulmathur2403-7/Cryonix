package com.Mentr_App.Mentr_V1.model;

import com.Mentr_App.Mentr_V1.model.enums.MentorPresenceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * MENTOR PRESENCE ENTITY (Talk Now)
 * ---------------------------------
 * One row per mentor to track real-time Talk Now presence.
 *
 * Fields:
 *  - status          : OFFLINE / LIVE / RINGING / IN_CALL
 *  - activeBookingId : current Talk Now booking when RINGING / IN_CALL
 *  - ringExpiresAt   : when the current "ringing" should auto-expire
 *  - lastHeartbeatAt : last heartbeat from mentor client (auto OFFLINE when stale)
 *
 * Product Flow:
 *  - Updated by MentorPresenceService (goLive / goOffline / heartbeat).
 *  - Used by PaymentServiceImpl to atomically choose a Talk Now "winner".
 *  - Used by TalkNowService for mentor polling (RINGING popup).
 */
@Entity
@Table(name = "mentor_presence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorPresence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * One-to-one with Mentor.
     * One mentor → one presence row.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentor_id", nullable = false, unique = true)
    private Mentor mentor;

    /**
     * Current Talk Now presence state.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MentorPresenceStatus status = MentorPresenceStatus.OFFLINE;

    /**
     * Active Talk Now booking id when RINGING or IN_CALL.
     * We reuse Booking.id as the Talk Now "requestId".
     */
    @Column(name = "active_booking_id")
    private Long activeBookingId;

    /**
     * If status = RINGING, this is the moment after which
     * the ringing should auto-expire if mentor does nothing.
     */
    @Column(name = "ring_expires_at")
    private Instant ringExpiresAt;

    /**
     * Last heartbeat timestamp from mentor dashboard.
     * Auto OFFLINE if this becomes too old.
     */
    @Column(name = "last_heartbeat_at")
    private Instant lastHeartbeatAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /* ----------------- Lifecycle hooks ----------------- */

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (lastHeartbeatAt == null) {
            lastHeartbeatAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
        if (lastHeartbeatAt == null) {
            lastHeartbeatAt = Instant.now();
        }
    }
}

