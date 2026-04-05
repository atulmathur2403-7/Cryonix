package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.Booking;
import com.Mentr_App.Mentr_V1.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PAYMENT REPOSITORY (Phase 3 — Monetization Layer)
 * -------------------------------------------------
 * Handles payment records from creation to Stripe confirmation and refunds.
 *
 * Product Flow alignment:
 *  - Learner pays before joining a session → findByBooking_Id()
 *  - Stripe webhook updates payment → findByStripePaymentIntentId()
 *  - Mentor wallet credits after session completion → findUnpaidMentorEarnings()
 *  - Refunds & disputes → updateRefundDetails()
 */

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * 🔍 Find payment record linked to a specific booking.
     * Used after booking creation or when displaying receipt details.
     */
    Optional<Payment> findByBooking_Id(Long bookingId);

    /**
     * 🔍 Find by Stripe PaymentIntent ID.
     * Used by webhook handler to mark payment success/failure.
     */
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    /**
     * 🔍 Find all payments by payer (learner).
     * Used in learner dashboard to show receipts & past payments.
     */
    List<Payment> findByPayer_UserIdOrderByCreatedAtDesc(Long payerUserId);

    /**
     * 🔍 Find all successful payments for a given mentor (via booking → mentor).
     * Used for mentor earnings & payout dashboard.
     */
    @Query("""
        SELECT p FROM Payment p
        WHERE p.booking.mentor.mentorId = :mentorId
          AND p.status = 'SUCCEEDED'
        ORDER BY p.paymentDate DESC
    """)
    List<Payment> findSuccessfulPaymentsByMentor(Long mentorId);

    /**
     * 🔍 Find all successful payments where mentor payout is still pending.
     * Used by background job or admin panel to process mentor withdrawals.
     */
    @Query("""
        SELECT p FROM Payment p
        WHERE p.status = 'SUCCEEDED'
          AND p.mentorPayoutProcessed = false
    """)
    List<Payment> findUnpaidMentorEarnings();

    /**
     * 🔁 Mark a payment as refunded (by admin or webhook event).
     * Used in refund flow → Product Flow: Report Issue → Request Refund.
     */
    @Modifying
    @Query("""
        UPDATE Payment p
        SET p.status = 'REFUNDED',
            p.refundTransactionId = :refundTxnId,
            p.refundReason = :refundReason,
            p.updatedAt = CURRENT_TIMESTAMP
        WHERE p.id = :paymentId
    """)
    void updateRefundDetails(Long paymentId, String refundTxnId, String refundReason);

    Optional<Payment> findByBooking(Booking booking);
//    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

}

