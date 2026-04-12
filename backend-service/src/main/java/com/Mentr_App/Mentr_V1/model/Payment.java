package com.Mentr_App.Mentr_V1.model;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * PAYMENT ENTITY (Phase 3 — Monetization Layer)
 * ------------------------------------------------
 * Represents every transaction processed through Stripe or Wallet.
 * Linked directly to a Booking record and Stripe's PaymentIntent.
 *
 * Product Flow alignment:
 *  - Payment Prompt → create record (PENDING)
 *  - Payment Success → mark SUCCEEDED + generate receipt
 *  - Payment Failure → mark FAILED
 *  - Refunds / disputes → mark REFUNDED
 *
 * Each payment connects a learner (payer) and a mentor (receiver)
 * via the related booking.
 */

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Booking associated with this payment.
     * One-to-one mapping ensures each booking has a single payment record.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    /**
     * The user (learner) who paid for the session.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_user_id", nullable = false)
    private User payer;

    /**
     * Stripe PaymentIntent ID (maps to Stripe API object).
     * Example: "pi_3Qa45Fxxxxx"
     */
    @Column(name = "stripe_payment_intent_id", length = 120)
    private String stripePaymentIntentId;

    /**
     * Stripe Charge ID — populated after payment succeeds.
     * Example: "ch_3Qa4xBxxxxx"
     */
    @Column(name = "stripe_charge_id", length = 120)
    private String stripeChargeId;

    /**
     * Amount charged to learner in selected currency.
     * Stored in main currency units (e.g. INR, USD).
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    /**
     * Currency of the transaction (INR, USD, etc.)
     */
    @Column(nullable = false, length = 10)
    private String currency;

    /**
     * Payment status:
     *  - PENDING_PAYMENT: Booking created but not yet paid
     *  - SUCCEEDED: Payment successful
     *  - FAILED: Payment failed or canceled
     *  - REFUNDED: Payment refunded to learner
     */
    @Column(nullable = false, length = 40)
    private String status;

    /**
     * Stripe-provided receipt URL (for learner download).
     */
    @Column(name = "receipt_url", length = 1000)
    private String receiptUrl;

    /**
     * Mentors can later withdraw their earnings → recorded in wallet.
     * This flag ensures payment has been settled to mentor wallet.
     */
    @Column(name = "mentor_payout_processed", nullable = false, columnDefinition = "boolean not null default false")
    private boolean mentorPayoutProcessed = false;

    /**
     * Optional refund transaction ID (for refund tracking).
     */
    @Column(name = "refund_transaction_id", length = 120)
    private String refundTransactionId;

    /**
     * Optional field to store refund reason (if learner requested).
     */
    @Column(name = "refund_reason", length = 500)
    private String refundReason;

    /**
     * Audit timestamps.
     */
    @Column(name = "payment_date")
    private Instant paymentDate;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    /**
     * Automatically set timestamps when persisting.
     */
    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (paymentDate == null && "SUCCEEDED".equalsIgnoreCase(status)) {
            paymentDate = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
