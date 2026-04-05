package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.payment.CreatePaymentResponse;
import com.Mentr_App.Mentr_V1.model.Booking;
import com.Mentr_App.Mentr_V1.model.User;
import com.stripe.exception.StripeException;

import java.math.BigDecimal;

/**
 * PAYMENT SERVICE INTERFACE
 * ------------------------------------------------------
 * Defines the operations for handling payments, refunds,
 * and synchronization between Stripe, Wallet, and Bookings.
 *
 * Product Flow alignment:
 *  - Payment Prompt  → createPaymentForBooking()
 *  - Payment Success → handlePaymentSuccess()
 *  - Refund Flow     → processRefund()
 */
public interface PaymentService {

    /**
     * Creates a Stripe PaymentIntent and stores a Payment record.
     * Triggered when learner books a mentor (status = PENDING_PAYMENT).
     */
    CreatePaymentResponse createPaymentForBooking(Booking booking, User learner) throws StripeException;

    /**
     * Called when Stripe webhook sends "payment_intent.succeeded".
     * Marks payment as successful, updates booking, creates session,
     * and credits mentor’s wallet.
     */
    void handlePaymentSuccess(String paymentIntentId);

    /**
     * Called when Stripe webhook sends "payment_intent.payment_failed".
     * Marks the payment as failed for tracking.
     */
    void handlePaymentFailure(String paymentIntentId);

    /**
     * Initiates a refund for a completed payment and updates Wallets + Logs.
     */
    void processRefund(Long paymentId, BigDecimal refundAmount, String reason) throws StripeException;


    /**
     * Finalize mentor payout for an already SUCCEEDED payment:
     * - credit mentor wallet (minus commission)
     * - create transaction record
     * - mark payment.mentorPayoutProcessed = true
     */
    void finalizeMentorPayout(Long paymentId);


    void refundToOriginalPayment(Long paymentId, java.math.BigDecimal refundAmount, String reason) throws com.stripe.exception.StripeException;

    void refundToWallet(Long paymentId, java.math.BigDecimal refundAmount, String reason);

}
