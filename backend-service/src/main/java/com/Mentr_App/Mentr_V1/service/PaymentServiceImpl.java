package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.config.StripeConfig;
import com.Mentr_App.Mentr_V1.dto.payment.CreatePaymentResponse;
import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.model.enums.MentorPresenceStatus;
import com.Mentr_App.Mentr_V1.repository.*;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.ChargeCollection;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final SessionRepository sessionRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final BookingRepository bookingRepository;
    private final StripeService stripeService;
    private final StripeConfig stripeConfig;
    private final BookingStatusUpdater bookingStatusUpdater;
    private final SessionServiceImpl sessionService; // ✅ use central session service
    private final MentorPresenceRepository mentorPresenceRepository;
    private final BookingChatSyncService bookingChatSyncService;

    private static final int TALKNOW_RING_TIMEOUT_SECONDS = 90;
    /**
     * 1️⃣ Create payment intent for a booking
     */
    @Override
    @Transactional
    public CreatePaymentResponse createPaymentForBooking(Booking booking, User learner) throws StripeException {
        log.info("💳 Initiating payment for Booking ID: {}", booking.getId());

        BigDecimal amount = booking.getAmount(); // ✅ use computed total
        if (amount == null) {
            // Fallback safety: compute 1x unit, but ideally never hit this
            amount = booking.getMentor().getCallPrice();
            booking.setAmount(amount);
        }

        String currency = stripeConfig.getCurrency();
        booking.setCurrency(currency); // persist chosen currency for this booking

        Map<String, String> metadata = stripeService.buildMetadata(
                booking.getId(),
                learner.getUserId(),
                booking.getMentor().getMentorId()
        );

        PaymentIntent paymentIntent = stripeService.createPaymentIntent(amount, currency, metadata);

        Payment payment = Payment.builder()
                .booking(booking)
                .payer(learner)
                .amount(amount)
                .currency(currency)
                .status("PENDING_PAYMENT")
                .stripePaymentIntentId(paymentIntent.getId())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        paymentRepository.save(payment);
        bookingRepository.saveAndFlush(booking); // persist currency/amount just set

        return CreatePaymentResponse.builder()
                .paymentId(payment.getId())
                .clientSecret(paymentIntent.getClientSecret())
                .currency(currency)
                .amount(amount)
                .build();
    }

    /**
     * HANDLE PAYMENT SUCCESS (Stripe webhook)
     * ---------------------------------------
     * Called when Stripe sends "payment_intent.succeeded".
     *
     * Two paths:
     *  1) BOOK_LATER bookings:
     *      - FCFS based on existsConfirmedOverlap(...)
     *      - CONFIRMED + session created, or REJECTED_CONFLICT + refund.
     *
     *  2) TALK_NOW bookings:
     *      - Uses MentorPresence to pick a single winner:
     *          • LIVE → RINGING (winner, shows popup to mentor)
     *          • Otherwise → auto-refund + REJECTED_CONFLICT (loser)
     */
    @Override
    @Transactional
    public void handlePaymentSuccess(String paymentIntentId) {
        log.info("✅ Stripe PaymentIntent succeeded: {}", paymentIntentId);

        // 1️⃣ Find local Payment record
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new IllegalStateException("Payment record not found for intent ID " + paymentIntentId));

        // Idempotency: skip if already processed
        if ("SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
            log.warn("⚠️ Payment already processed -> skipping duplicate webhook for {}", paymentIntentId);
            return;
        }

        Booking booking = payment.getBooking();
        if (booking == null) {
            log.error("❌ Booking not found for payment {}", paymentIntentId);
            return;
        }

        // 2️⃣ Try to fetch Stripe chargeId (optional, for dashboard link)
        String chargeId = null;
        try {
            Map<String, Object> chargeParams = new HashMap<>();
            chargeParams.put("payment_intent", paymentIntentId);
            ChargeCollection charges = Charge.list(chargeParams);
            if (charges.getData() != null && !charges.getData().isEmpty()) {
                chargeId = charges.getData().get(0).getId();
            }
        } catch (Exception e) {
            log.error("⚠️ Failed to fetch Stripe charge for {}: {}", paymentIntentId, e.getMessage(), e);
        }

        // 3️⃣ Mark payment as SUCCEEDED
        payment.setStatus("SUCCEEDED");
        payment.setPaymentDate(Instant.now());
        payment.setStripeChargeId(chargeId);
        payment.setReceiptUrl("https://dashboard.stripe.com/payments/" + paymentIntentId);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.saveAndFlush(payment);

        boolean isTalkNow = "TALK_NOW".equalsIgnoreCase(booking.getBookingType());

        /* --------------------------------------------------
         * TALK NOW FLOW: choose winner based on MentorPresence
         * -------------------------------------------------- */
        if (isTalkNow) {
            Mentor mentor = booking.getMentor();
            Long mentorId = mentor.getMentorId();
            Instant now = Instant.now();
            Instant ringExpiresAt = now.plusSeconds(TALKNOW_RING_TIMEOUT_SECONDS);

            // Ensure presence row exists (offline by default)
            MentorPresence presence = mentorPresenceRepository.findByMentor_MentorId(mentorId)
                    .orElseGet(() -> mentorPresenceRepository.save(
                            MentorPresence.builder()
                                    .mentor(mentor)
                                    .status(MentorPresenceStatus.OFFLINE)
                                    .lastHeartbeatAt(now)
                                    .build()
                    ));

            // Atomic LIVE → RINGING claim:
            //  - If mentor is LIVE, this call wins and becomes RINGING
            //  - If mentor is not LIVE or already in RINGING/IN_CALL, we lose
            int updated = mentorPresenceRepository.updateStatusIfMatches(
                    mentorId,
                    MentorPresenceStatus.LIVE,
                    MentorPresenceStatus.RINGING,
                    booking.getId(),
                    ringExpiresAt
            );

            // Loser path: mentor not LIVE or already busy → auto-refund
            if (updated == 0) {
                log.warn("⛔ Talk Now payment succeeded but mentor {} not LIVE or already busy; auto-refunding booking #{}",
                        mentorId, booking.getId());

                booking.setStatus("REJECTED_CONFLICT");
                booking.setUpdatedAt(Instant.now());
                booking.setPayment(payment);
                booking.setClientSecret(payment.getStripePaymentIntentId());
                booking.setAmount(payment.getAmount());
                booking.setCurrency(payment.getCurrency());
                bookingRepository.saveAndFlush(booking);

                bookingChatSyncService.syncChatPermissionForPair(
                        booking.getLearner().getUserId(),
                        booking.getMentor().getMentorId(),
                        "TALKNOW_PAYMENT_REJECTED_CONFLICT",
                        booking.getId()
                );


                try {
                    refundToOriginalPayment(payment.getId(), payment.getAmount(), "TALKNOW_LOST_RACE_OR_OFFLINE");
                } catch (Exception ex) {
                    log.error("❌ Auto-refund failed for Talk Now booking #{}: {}", booking.getId(), ex.getMessage(), ex);
                }
                return;
            }

            // Winner path: mentor is now RINGING for this booking
            booking.setStatus("RINGING");
            booking.setPayment(payment);
            booking.setClientSecret(payment.getStripePaymentIntentId());
            booking.setAmount(payment.getAmount());
            booking.setCurrency(payment.getCurrency());
            booking.setUpdatedAt(Instant.now());
            bookingRepository.saveAndFlush(booking);

            log.info("🔔 Talk Now booking #{} is now RINGING for mentor {} (expires at {})",
                    booking.getId(), mentorId, ringExpiresAt);
            return;
        }

        /* --------------------------------------------------
         * BOOK LATER FLOW (existing FCFS behavior)
         * -------------------------------------------------- */

        // 4️⃣ FCFS: check if any CONFIRMED overlap already exists
        boolean conflict = bookingRepository.existsConfirmedOverlap(
                booking.getMentor().getMentorId(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        // Conflict path: we lost race → auto-refund
        if (conflict) {
            log.warn("⛔ Payment succeeded but slot already taken (FCFS) for booking #{}", booking.getId());

            booking.setStatus("REJECTED_CONFLICT");
            booking.setUpdatedAt(Instant.now());
            booking.setPayment(payment);
            booking.setClientSecret(payment.getStripePaymentIntentId());
            booking.setAmount(payment.getAmount());
            booking.setCurrency(payment.getCurrency());
            bookingRepository.saveAndFlush(booking);

            bookingChatSyncService.syncChatPermissionForPair(
                    booking.getLearner().getUserId(),
                    booking.getMentor().getMentorId(),
                    "PAYMENT_SUCCESS_REJECTED_CONFLICT",
                    booking.getId()
            );


            try {
                refundToOriginalPayment(payment.getId(), payment.getAmount(), "REJECTED_CONFLICT");
            } catch (Exception ex) {
                log.error("❌ Auto-refund failed for conflict booking #{}: {}", booking.getId(), ex.getMessage(), ex);
            }
            return;
        }

        // 5️⃣ No conflict → auto-confirm booking + create session
        booking.setStatus("CONFIRMED");
        booking.setUpdatedAt(Instant.now());
        booking.setPayment(payment);
        booking.setClientSecret(payment.getStripePaymentIntentId());
        booking.setAmount(payment.getAmount());
        booking.setCurrency(payment.getCurrency());
        bookingRepository.saveAndFlush(booking);

        bookingChatSyncService.syncChatPermissionForPair(
                booking.getLearner().getUserId(),
                booking.getMentor().getMentorId(),
                "PAYMENT_SUCCESS_CONFIRMED",
                booking.getId()
        );


        sessionService.createSessionAfterPayment(booking);

        log.info("📘 Booking #{} auto-CONFIRMED and session created ({} → {})",
                booking.getId(), booking.getStartTime(), booking.getEndTime());
    }





    /**
     * 3️⃣ Handle failed payments
     */
    @Override
    @Transactional
    public void handlePaymentFailure(String paymentIntentId) {
        log.warn("Stripe PaymentIntent failed: {}", paymentIntentId);
        paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .ifPresent(payment -> {
                    payment.setStatus("FAILED");
                    payment.setUpdatedAt(Instant.now());
                    paymentRepository.save(payment);
                });
    }

    /**
     * 4️⃣ Process refunds
     */
    @Override
    @Transactional
    public void processRefund(Long paymentId, BigDecimal refundAmount, String reason) throws StripeException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalStateException("Payment not found with ID: " + paymentId));

        if (!"SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Cannot refund a non-successful payment");
        }

        Refund refund = stripeService.createRefund(payment.getStripeChargeId(), refundAmount, reason);

        // Update Payment
        payment.setStatus("REFUNDED");
        payment.setRefundTransactionId(refund.getId());
        payment.setRefundReason(reason);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        // Credit learner’s wallet
        Wallet learnerWallet = walletRepository.findByUser_UserId(payment.getPayer().getUserId())
                .orElseThrow(() -> new IllegalStateException("Learner wallet not found"));
        learnerWallet.credit(refundAmount);
        walletRepository.save(learnerWallet);

        // Log transaction
        Transaction refundTxn = Transaction.builder()
                .wallet(learnerWallet)
                .amount(refundAmount)
                .currency(payment.getCurrency())
                .type("CREDIT")
                .reason("REFUND")
                .status("COMPLETED")
                .referenceId(refund.getId())
                .description("Refund for Booking #" + payment.getBooking().getId())
                .createdAt(Instant.now())
                .build();

        transactionRepository.save(refundTxn);
        log.info("Refund processed successfully: {}", refund.getId());
    }


    @Override
    @Transactional
    public void finalizeMentorPayout(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalStateException("Payment not found: " + paymentId));

        if (!"SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Cannot finalize payout for non-succeeded payment: " + paymentId);
        }
        if (Boolean.TRUE.equals(payment.isMentorPayoutProcessed())) {
            log.info("Payout already processed for payment {}", paymentId);
            return;
        }

        Booking booking = payment.getBooking();
        Mentor mentor = booking.getMentor();

        Wallet mentorWallet = walletRepository.findByUser_UserId(mentor.getUser().getUserId())
                .orElseThrow(() -> new IllegalStateException("Mentor wallet not found for user: " + mentor.getUser().getUserId()));

        BigDecimal commissionPercent = BigDecimal.valueOf(stripeConfig.getPlatformCommissionPercent());
        BigDecimal commission = payment.getAmount()
                .multiply(commissionPercent)
                .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal mentorEarning = payment.getAmount().subtract(commission);

        if (mentorWallet.getBalance() == null) mentorWallet.setBalance(BigDecimal.ZERO);
        if (mentorWallet.getLifetimeEarnings() == null) mentorWallet.setLifetimeEarnings(BigDecimal.ZERO);

        mentorWallet.credit(mentorEarning);
        walletRepository.saveAndFlush(mentorWallet);

        Transaction txn = Transaction.builder()
                .wallet(mentorWallet)
                .amount(mentorEarning)
                .currency(payment.getCurrency())
                .type("CREDIT")
                .reason("MENTOR_PAYOUT")
                .status("COMPLETED")
                .referenceId(payment.getStripePaymentIntentId())
                .description("Earning from Booking #" + booking.getId())
                .createdAt(Instant.now())
                .build();

        transactionRepository.saveAndFlush(txn);

        payment.setMentorPayoutProcessed(true);
        paymentRepository.saveAndFlush(payment);

        log.info("Mentor payout finalized for payment {} → {} {}", paymentId, mentorEarning, payment.getCurrency());
    }

    @Override
    @Transactional
    public void refundToOriginalPayment(Long paymentId, BigDecimal refundAmount, String reason) throws StripeException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalStateException("Payment not found with ID: " + paymentId));

        if (!"SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Cannot refund a non-successful payment");
        }

        if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Refund amount must be > 0");
        }

        // Stripe partial/full refund back to original payment method
        Refund refund = stripeService.createRefund(payment.getStripeChargeId(), refundAmount, reason);

        // Update payment record (note: simple model; mark as REFUNDED even for partial)
        payment.setStatus("REFUNDED");
        payment.setRefundTransactionId(refund.getId());
        payment.setRefundReason(reason);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.saveAndFlush(payment);

        log.info("↩️ Refunded {} {} to original method for payment {} (booking #{})",
                refundAmount, payment.getCurrency(), paymentId, payment.getBooking().getId());
    }

    @Override
    @Transactional
    public void refundToWallet(Long paymentId, BigDecimal refundAmount, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalStateException("Payment not found with ID: " + paymentId));

        if (!"SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
            throw new IllegalStateException("Cannot refund a non-successful payment");
        }

        if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Refund amount must be > 0");
        }

        // Credit learner wallet (no Stripe refund here)
        Wallet learnerWallet = walletRepository.findByUser_UserId(payment.getPayer().getUserId())
                .orElseThrow(() -> new IllegalStateException("Learner wallet not found"));

        learnerWallet.credit(refundAmount);
        walletRepository.saveAndFlush(learnerWallet);

        Transaction refundTxn = Transaction.builder()
                .wallet(learnerWallet)
                .amount(refundAmount)
                .currency(payment.getCurrency())
                .type("CREDIT")
                .reason("REFUND")
                .status("COMPLETED")
                .referenceId("WL-" + Instant.now().toEpochMilli())
                .description(reason != null ? reason : "Wallet refund for Booking #" + payment.getBooking().getId())
                .createdAt(Instant.now())
                .build();
        transactionRepository.saveAndFlush(refundTxn);

        // Mark payment as refunded-to-wallet (keeps funds on platform)
        payment.setStatus("REFUNDED_TO_WALLET");
        payment.setRefundTransactionId(refundTxn.getReferenceId());
        payment.setRefundReason(reason);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.saveAndFlush(payment);

        log.info("💸 Refunded {} {} to WALLET for user {} (payment {}, booking #{})",
                refundAmount, payment.getCurrency(), payment.getPayer().getUserId(),
                paymentId, payment.getBooking().getId());
    }

}

