package com.Mentr_App.Mentr_V1.model;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * TRANSACTION ENTITY (Phase 3 — Wallet & Monetization Ledger)
 * -----------------------------------------------------------
 * Represents every financial operation performed on a user's wallet.
 *
 * Product Flow alignment:
 *  • Learner: Deduction after payment success, refund credits, wallet top-ups.
 *  • Mentor: Credit after session completion (payment success).
 *  • Platform: Tracks commission share via metadata.
 *  • Admin: Review transaction logs and payouts.
 */

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The wallet this transaction belongs to.
     * Each wallet can have many transactions.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    /**
     * Type of transaction:
     *  - CREDIT → adds to wallet (mentor earnings, refunds)
     *  - DEBIT → subtracts from wallet (learner payments, withdrawals)
     */
    @Column(nullable = false, length = 20)
    private String type; // CREDIT / DEBIT

    /**
     * Transaction amount (always positive).
     * Stored in main currency units (e.g. INR, USD).
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    /**
     * Currency of the transaction (ISO format, e.g. "inr", "usd").
     */
    @Column(nullable = false, length = 10)
    private String currency = "inr";

    /**
     * Status of the transaction:
     *  - PENDING
     *  - COMPLETED
     *  - FAILED
     *  - REVERSED (for refunded commissions or reversals)
     */
    @Column(nullable = false, length = 30)
    private String status = "PENDING";

    /**
     * Reason / category for the transaction.
     *  - SESSION_PAYMENT
     *  - MENTOR_PAYOUT
     *  - WALLET_TOPUP
     *  - REFUND
     *  - PLATFORM_COMMISSION
     *  - ADJUSTMENT
     */
    @Column(nullable = false, length = 50)
    private String reason;

    /**
     * Optional Stripe / Payment reference.
     * Helps correlate with external Stripe PaymentIntent or Charge IDs.
     */
    @Column(name = "reference_id", length = 150)
    private String referenceId;

    /**
     * Optional metadata field (JSON string or notes).
     * Example: {"bookingId":123,"mentorId":5,"commission":10.00}
     */
    @Column(columnDefinition = "TEXT")
    private String metadata;

    /**
     * Optional remark for user visibility in dashboard.
     */
    @Column(length = 500)
    private String description;

    /**
     * When the transaction occurred.
     */
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /**
     * When the transaction was last updated.
     */
    @Column(name = "updated_at")
    private Instant updatedAt;

    // ----------------------------------------------------------------------
    // Helper Methods
    // ----------------------------------------------------------------------

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = "PENDING";
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}

