package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.config.StripeConfig;
import com.stripe.Stripe;
import com.stripe.exception.*;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * STRIPE SERVICE (Phase 3 — Payment Gateway Layer)
 * ------------------------------------------------
 * Handles direct communication with Stripe APIs for:
 *  • PaymentIntent creation
 *  • Refund initiation
 *  • Webhook signature verification
 *
 * Product Flow alignment:
 *  • Payment Prompt  → createPaymentIntent()
 *  • Payment Success → verified via webhook event
 *  • Refund & Dispute → createRefund()
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    private final StripeConfig stripeConfig;

    /**
     * Creates a new Stripe PaymentIntent for a learner booking.
     *
     * @param amount     Amount in main currency units (e.g. INR)
     * @param currency   ISO currency code
     * @param metadata   Extra identifiers (bookingId, learnerId, mentorId)
     * @return PaymentIntent object from Stripe
     */
    public PaymentIntent createPaymentIntent(BigDecimal amount, String currency, Map<String, String> metadata)
            throws StripeException {

        Stripe.apiKey = stripeConfig.getApiKey(); // ensure key is up-to-date

        // Stripe requires amount in the smallest currency unit (e.g., paise for INR)
        long amountInSubunit = amount.multiply(BigDecimal.valueOf(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInSubunit)
                .setCurrency(currency)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .putAllMetadata(metadata)
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        log.info("💳 Created PaymentIntent: {} for booking {}", paymentIntent.getId(), metadata.get("bookingId"));
        return paymentIntent;
    }

    /**
     * Initiates a refund for a previously successful charge.
     *
     * @param chargeId Stripe charge ID to refund.
     * @param amount   Refund amount (optional — full refund if null).
     * @param reason   Reason for refund (shown in Stripe dashboard).
     * @return Stripe Refund object.
     */
    public Refund createRefund(String chargeId, BigDecimal amount, String reason) throws StripeException {
        Stripe.apiKey = stripeConfig.getApiKey();

        RefundCreateParams.Builder refundBuilder = RefundCreateParams.builder()
                .setCharge(chargeId)
                .setReason(reason != null ? RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER : null);

        if (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) {
            long amountInSubunit = amount.multiply(BigDecimal.valueOf(100)).longValue();
            refundBuilder.setAmount(amountInSubunit);
        }

        Refund refund = Refund.create(refundBuilder.build());
        log.info("↩️ Created refund for charge {} → refundId {}", chargeId, refund.getId());
        return refund;
    }

    /**
     * Verifies and constructs a Stripe webhook event safely.
     *
     * @param payload   Raw request body from Stripe.
     * @param sigHeader Stripe-Signature header.
     * @return Verified Stripe Event object.
     * @throws SignatureVerificationException if signature is invalid.
     */
    public Event constructEvent(String payload, String sigHeader) throws SignatureVerificationException {
        String webhookSecret = stripeConfig.getWebhookSecret();
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        log.debug("✅ Verified Stripe webhook event: {}", event.getType());
        return event;
    }

    /**
     * Converts a Stripe PaymentIntent ID into its latest state from Stripe API.
     *
     * @param paymentIntentId Stripe PaymentIntent ID
     * @return Refreshed PaymentIntent
     */
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        Stripe.apiKey = stripeConfig.getApiKey();
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        log.debug("📦 Retrieved PaymentIntent {} → status={}", intent.getId(), intent.getStatus());
        return intent;
    }

    /**
     * Utility method for standard Stripe metadata used across all payments.
     */
    public Map<String, String> buildMetadata(Long bookingId, Long learnerId, Long mentorId) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("bookingId", String.valueOf(bookingId));
        metadata.put("learnerId", String.valueOf(learnerId));
        metadata.put("mentorId", String.valueOf(mentorId));
        metadata.put("app", "Mentr_V1");
        return metadata;
    }
}

