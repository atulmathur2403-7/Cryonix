package com.Mentr_App.Mentr_V1.controller;



import com.Mentr_App.Mentr_V1.service.PaymentService;
import com.Mentr_App.Mentr_V1.service.StripeService;
import com.Mentr_App.Mentr_V1.service.SessionExtensionService; // <-- you will implement this in extension feature
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * STRIPE WEBHOOK CONTROLLER
 * ---------------------------------------------------------
 * Routes Stripe webhook events to correct domain handler:
 *  - Booking PaymentIntent -> PaymentService.handlePaymentSuccess/failure
 *  - Session Extension PaymentIntent -> SessionExtensionService handlers
 *
 * Stripe automatically retries failed webhooks — ensure idempotent handling.
 */
@RestController
@RequestMapping("/api/payments/stripe/webhook")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private static final String META_PURPOSE = "purpose";
    private static final String PURPOSE_SESSION_EXTENSION = "SESSION_EXTENSION";

    // Optional extra markers (choose whatever you standardize in extension flow)
    private static final String META_EXTENSION_SESSION_ID_1 = "sessionId";
    private static final String META_EXTENSION_SESSION_ID_2 = "extensionSessionId";
    private static final String META_EXTENSION_MINUTES = "extensionMinutes";

    private final StripeService stripeService;
    private final PaymentService paymentService;

    // New: extension payment webhook handler (you’ll implement as part of extension feature)
    private final SessionExtensionService sessionExtensionService;

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestHeader("Stripe-Signature") String sigHeader,
            @RequestBody String payload
    ) {
        final Event event;
        try {
            event = stripeService.constructEvent(payload, sigHeader);
        } catch (SignatureVerificationException e) {
            log.error("❌ Stripe webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Signature verification failed");
        } catch (Exception e) {
            log.error("⚠️ Error parsing Stripe event: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        log.info("📦 Received Stripe event: type={}, id={}", event.getType(), event.getId());

        try {
            switch (event.getType()) {

                /**
                 * If you use Stripe Checkout for extensions, you often get:
                 *  - checkout.session.completed
                 * That session contains payment_intent -> we retrieve it and route.
                 */
                case "checkout.session.completed" -> {
                    Session checkoutSession = (Session) event.getDataObjectDeserializer()
                            .getObject().orElse(null);

                    if (checkoutSession == null) {
                        log.warn("checkout.session.completed but session object is null");
                        return ResponseEntity.ok("Received");
                    }

                    String paymentIntentId = checkoutSession.getPaymentIntent();
                    if (paymentIntentId == null || paymentIntentId.isBlank()) {
                        log.warn("checkout.session.completed without payment_intent");
                        return ResponseEntity.ok("Received");
                    }

                    PaymentIntent intent = stripeService.retrievePaymentIntent(paymentIntentId);
                    routePaymentIntent(intent, "checkout.session.completed");
                }

                // ✅ Payment success (PaymentIntent-based)
                case "payment_intent.succeeded" -> {
                    PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                            .getObject().orElse(null);

                    if (paymentIntent == null) {
                        log.warn("payment_intent.succeeded but PaymentIntent object is null");
                        return ResponseEntity.ok("Received");
                    }

                    routePaymentIntent(paymentIntent, "payment_intent.succeeded");
                }

                // ❌ Payment failed
                case "payment_intent.payment_failed" -> {
                    PaymentIntent failedIntent = (PaymentIntent) event.getDataObjectDeserializer()
                            .getObject().orElse(null);

                    if (failedIntent == null) {
                        log.warn("payment_intent.payment_failed but PaymentIntent object is null");
                        return ResponseEntity.ok("Received");
                    }

                    routePaymentIntentFailure(failedIntent, "payment_intent.payment_failed");
                }

                // ↩️ Refund-related events (log-only here; your refund flows happen elsewhere)
                case "charge.refunded" -> {
                    var deser = event.getDataObjectDeserializer();
                    deser.getObject().ifPresent(obj -> {
                        if (obj instanceof com.stripe.model.Charge charge) {
                            log.info("↩️ Charge refunded: chargeId={}, payment_intent={}, amount_refunded={}",
                                    charge.getId(), charge.getPaymentIntent(), charge.getAmountRefunded());
                        } else {
                            log.warn("Unexpected object for charge.refunded: {}", obj.getClass().getName());
                        }
                    });
                }

                case "charge.refund.updated", "refund.succeeded" -> {
                    var deser = event.getDataObjectDeserializer();
                    deser.getObject().ifPresent(obj -> {
                        if (obj instanceof com.stripe.model.Refund refund) {
                            log.info("↩️ Refund event: refundId={}, charge={}, status={}, amount={}",
                                    refund.getId(), refund.getCharge(), refund.getStatus(), refund.getAmount());
                        } else {
                            log.warn("Unexpected object for {}: {}", event.getType(), obj.getClass().getName());
                        }
                    });
                }

                default -> log.debug("ℹ️ Unhandled Stripe event: {}", event.getType());
            }

        } catch (Exception ex) {
            // Return 500 so Stripe retries (important if extension/booking update failed transiently)
            log.error("💥 Error handling Stripe event {}: {}", event.getType(), ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing event");
        }

        return ResponseEntity.ok("Received");
    }

    /**
     * Decide whether this PaymentIntent belongs to:
     *  - Booking payment flow (existing)
     *  - Session extension flow (new)
     */
    private void routePaymentIntent(PaymentIntent intent, String sourceEvent) {
        String paymentIntentId = intent.getId();
        Map<String, String> meta = intent.getMetadata();

        boolean isExtension =
                (meta != null && PURPOSE_SESSION_EXTENSION.equalsIgnoreCase(meta.get(META_PURPOSE)))
                        || (meta != null && (meta.containsKey(META_EXTENSION_SESSION_ID_1) || meta.containsKey(META_EXTENSION_SESSION_ID_2)))
                        || (meta != null && meta.containsKey(META_EXTENSION_MINUTES));

        if (isExtension) {
            log.info("🧩 Routing PI {} from {} -> SESSION EXTENSION handler. metadata={}", paymentIntentId, sourceEvent, meta);
            sessionExtensionService.handleExtensionPaymentSuccess(paymentIntentId, meta);
            return;
        }

        log.info("✅ Routing PI {} from {} -> BOOKING payment handler. metadata={}", paymentIntentId, sourceEvent, meta);
        paymentService.handlePaymentSuccess(paymentIntentId);
    }

    private void routePaymentIntentFailure(PaymentIntent intent, String sourceEvent) {
        String paymentIntentId = intent.getId();
        Map<String, String> meta = intent.getMetadata();

        boolean isExtension =
                (meta != null && PURPOSE_SESSION_EXTENSION.equalsIgnoreCase(meta.get(META_PURPOSE)))
                        || (meta != null && (meta.containsKey(META_EXTENSION_SESSION_ID_1) || meta.containsKey(META_EXTENSION_SESSION_ID_2)))
                        || (meta != null && meta.containsKey(META_EXTENSION_MINUTES));

        if (isExtension) {
            log.warn("🧩 Routing PI {} from {} -> SESSION EXTENSION failure handler. metadata={}", paymentIntentId, sourceEvent, meta);
            sessionExtensionService.handleExtensionPaymentFailure(paymentIntentId, meta);
            return;
        }

        log.warn("❌ Routing PI {} from {} -> BOOKING payment failure handler. metadata={}", paymentIntentId, sourceEvent, meta);
        paymentService.handlePaymentFailure(paymentIntentId);
    }
}
