package com.Mentr_App.Mentr_V1.model;


import com.Mentr_App.Mentr_V1.model.enums.SessionExtensionStatus;
import com.Mentr_App.Mentr_V1.model.enums.SessionExtensionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "session_extensions",
        indexes = {
                @Index(name = "idx_ext_session_status", columnList = "session_id,status"),
                @Index(name = "idx_ext_pi", columnList = "stripe_payment_intent_id", unique = true)
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionExtension {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many extensions can happen on one session
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SessionExtensionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private SessionExtensionStatus status;

    // fixed blocks (15 mins), but kept flexible
    @Column(nullable = false)
    private Integer minutes;

    // who initiated (userId)
    @Column(name = "initiated_by_user_id", nullable = false)
    private Long initiatedByUserId;

    // who decided (userId)
    @Column(name = "decided_by_user_id")
    private Long decidedByUserId;

    @Column(name = "decided_at")
    private Instant decidedAt;

    // amount/currency charged for this extension
    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 10)
    private String currency;

    // Stripe fields
    @Column(name = "stripe_payment_intent_id", length = 120, unique = true)
    private String stripePaymentIntentId;

    @Column(name = "stripe_charge_id", length = 120)
    private String stripeChargeId;

    @Column(name = "receipt_url", length = 1000)
    private String receiptUrl;

    @Column(name = "refund_transaction_id", length = 120)
    private String refundTransactionId;

    @Column(name = "refund_reason", length = 500)
    private String refundReason;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "applied_at")
    private Instant appliedAt;

    // For polling + cleanup TTL
    @Column(name = "expires_at")
    private Instant expiresAt;

    // after apply, store resulting new endTime (useful for frontend)
    @Column(name = "new_end_time")
    private Instant newEndTime;

    @Column(name = "created_at", nullable = false, updatable = false)
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

