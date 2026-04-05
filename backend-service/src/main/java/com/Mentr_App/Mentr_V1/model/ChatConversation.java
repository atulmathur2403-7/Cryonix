package com.Mentr_App.Mentr_V1.model;


import com.Mentr_App.Mentr_V1.model.enums.EligibilityReason;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "chat_conversations",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"learner_id", "mentor_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Learner side (User row).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", nullable = false)
    private User learner;

    /**
     * Mentor side.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentor_id", nullable = false)
    private Mentor mentor;

    /**
     * Deterministic conversation id used in Firestore.
     *
     * Built via FirebaseIdentityUtil.buildConversationId(learnerUserId, mentorId)
     * so that both learner and mentor hit the same document:
     *   conversations/{conversationId}
     */
    @Column(name = "conversation_id", nullable = false, length = 100, unique = true)
    private String conversationId;

    /**
     * Whether chat is currently enabled for this pair.
     * - Controlled by BookingChatSyncService / ChatConversationService
     *   based on booking status and block/eligibility rules.
     */
    @Column(name = "enabled", nullable = false)
    private boolean enabled = false;

    /**
     * Hard block flag (admin / abuse).
     * When true, overrides enabled=false.
     */
    @Column(name = "blocked", nullable = false)
    private boolean blocked = false;

    /**
     * Human-readable reason why chat is disabled for this pair.
     *
     * Mirrors EligibilityReason when not ELIGIBLE, and is also
     * pushed to Firestore as "disabledReason" for the frontend.
     *
     * Examples:
     *  - "NO_VALID_BOOKINGS"
     *  - "BLOCKED"
     *  - "CONVERSATION_DISABLED"
     */
    @Column(name = "disabled_reason", length = 100)
    private String disabledReason;

    /**
     * Last eligibility reason derived from bookings & block state.
     * Kept as enum for backend logic / reporting.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "last_eligibility_reason", length = 50)
    private EligibilityReason lastEligibilityReason;

    /**
     * Optional: last booking id that influenced the decision.
     */
    @Column(name = "last_booking_id")
    private Long lastBookingId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
