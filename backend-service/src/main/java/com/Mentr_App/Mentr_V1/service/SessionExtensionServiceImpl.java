package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.config.StripeConfig;
import com.Mentr_App.Mentr_V1.dto.session.extension.*;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.model.enums.SessionExtensionStatus;
import com.Mentr_App.Mentr_V1.model.enums.SessionExtensionType;
import com.Mentr_App.Mentr_V1.repository.*;
import com.stripe.exception.StripeException;
import com.stripe.model.ChargeCollection;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SessionExtensionServiceImpl implements SessionExtensionService {

    private static final int EXTENSION_BLOCK_MINUTES = 15;

    // decision TTL (approve/decline or accept/decline)
    private static final long DECISION_TTL_SECONDS = 120;

    // after approved/accepted, how long learner has to pay
    private static final long PAYMENT_TTL_SECONDS = 5 * 60;

    // allow showing extension button only near end (frontend polls)
    private static final long PROMPT_WINDOW_SECONDS = 6 * 60;

    // safety cap per session
    private static final int MAX_TOTAL_EXTENSION_MINUTES = 120;

    private final SessionRepository sessionRepository;
    private final SessionExtensionRepository sessionExtensionRepository;

    private final StripeService stripeService;
    private final StripeConfig stripeConfig;

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    private final DailyVideoService dailyVideoService;

    private final EntityManager entityManager;

    @Override
    public SessionExtensionCreateResponse requestByLearner(Long sessionId, Long learnerUserId) {
        Session session = loadSessionOrThrow(sessionId);
        validateLearnerIsParticipant(session, learnerUserId);
        validateSessionStillExtendable(session);

        ensureNoActiveExtension(sessionId);

        SessionExtension ext = SessionExtension.builder()
                .session(session)
                .type(SessionExtensionType.LEARNER_REQUEST)
                .status(SessionExtensionStatus.PENDING_DECISION)
                .minutes(EXTENSION_BLOCK_MINUTES)
                .initiatedByUserId(learnerUserId)
                .expiresAt(Instant.now().plusSeconds(DECISION_TTL_SECONDS))
                .build();

        SessionExtension saved = sessionExtensionRepository.save(ext);

        return SessionExtensionCreateResponse.builder()
                .extensionId(saved.getId())
                .sessionId(sessionId)
                .type(saved.getType().name())
                .status(saved.getStatus().name())
                .minutes(saved.getMinutes())
                .expiresAt(saved.getExpiresAt())
                .build();
    }

    @Override
    public SessionExtensionCreateResponse offerByMentor(Long sessionId, Long mentorUserId) {
        Session session = loadSessionOrThrow(sessionId);
        validateMentorIsParticipant(session, mentorUserId);
        validateSessionStillExtendable(session);

        ensureNoActiveExtension(sessionId);

        SessionExtension ext = SessionExtension.builder()
                .session(session)
                .type(SessionExtensionType.MENTOR_OFFER)
                .status(SessionExtensionStatus.PENDING_DECISION)
                .minutes(EXTENSION_BLOCK_MINUTES)
                .initiatedByUserId(mentorUserId)
                .expiresAt(Instant.now().plusSeconds(DECISION_TTL_SECONDS))
                .build();

        SessionExtension saved = sessionExtensionRepository.save(ext);

        return SessionExtensionCreateResponse.builder()
                .extensionId(saved.getId())
                .sessionId(sessionId)
                .type(saved.getType().name())
                .status(saved.getStatus().name())
                .minutes(saved.getMinutes())
                .expiresAt(saved.getExpiresAt())
                .build();
    }

    @Override
    public SessionExtensionDecisionResponse approve(Long sessionId, Long extensionId, Long mentorUserId) {
        SessionExtension ext = loadExtensionForUpdate(extensionId);
        if (!ext.getSession().getId().equals(sessionId)) throw new BookingException("Extension/session mismatch");

        Session session = ext.getSession();
        validateMentorIsParticipant(session, mentorUserId);

        if (ext.getType() != SessionExtensionType.LEARNER_REQUEST) {
            throw new BookingException("Only learner-request can be approved by mentor");
        }
        if (ext.getStatus() != SessionExtensionStatus.PENDING_DECISION) {
            throw new BookingException("Extension not awaiting decision");
        }
        if (ext.getExpiresAt() != null && Instant.now().isAfter(ext.getExpiresAt())) {
            ext.setStatus(SessionExtensionStatus.EXPIRED);
            sessionExtensionRepository.save(ext);
            throw new BookingException("Extension request expired");
        }

        ext.setDecidedByUserId(mentorUserId);
        ext.setDecidedAt(Instant.now());
        ext.setStatus(SessionExtensionStatus.APPROVED_AWAITING_PAYMENT);
        ext.setExpiresAt(Instant.now().plusSeconds(PAYMENT_TTL_SECONDS)); // learner must pay within TTL

        sessionExtensionRepository.save(ext);

        return SessionExtensionDecisionResponse.builder()
                .extensionId(ext.getId())
                .sessionId(sessionId)
                .status(ext.getStatus().name())
                .expiresAt(ext.getExpiresAt())
                .build();
    }

    @Override
    public SessionExtensionDecisionResponse acceptOffer(Long sessionId, Long extensionId, Long learnerUserId) {
        SessionExtension ext = loadExtensionForUpdate(extensionId);
        if (!ext.getSession().getId().equals(sessionId)) throw new BookingException("Extension/session mismatch");

        Session session = ext.getSession();
        validateLearnerIsParticipant(session, learnerUserId);

        if (ext.getType() != SessionExtensionType.MENTOR_OFFER) {
            throw new BookingException("Only mentor-offer can be accepted by learner");
        }
        if (ext.getStatus() != SessionExtensionStatus.PENDING_DECISION) {
            throw new BookingException("Extension not awaiting decision");
        }
        if (ext.getExpiresAt() != null && Instant.now().isAfter(ext.getExpiresAt())) {
            ext.setStatus(SessionExtensionStatus.EXPIRED);
            sessionExtensionRepository.save(ext);
            throw new BookingException("Extension offer expired");
        }

        ext.setDecidedByUserId(learnerUserId);
        ext.setDecidedAt(Instant.now());
        ext.setStatus(SessionExtensionStatus.APPROVED_AWAITING_PAYMENT);
        ext.setExpiresAt(Instant.now().plusSeconds(PAYMENT_TTL_SECONDS));

        sessionExtensionRepository.save(ext);

        return SessionExtensionDecisionResponse.builder()
                .extensionId(ext.getId())
                .sessionId(sessionId)
                .status(ext.getStatus().name())
                .expiresAt(ext.getExpiresAt())
                .build();
    }

    @Override
    public SessionExtensionDecisionResponse decline(Long sessionId, Long extensionId, Long userId) {
        SessionExtension ext = loadExtensionForUpdate(extensionId);
        if (!ext.getSession().getId().equals(sessionId)) throw new BookingException("Extension/session mismatch");

        Session session = ext.getSession();

        boolean canDecline =
                (ext.getType() == SessionExtensionType.LEARNER_REQUEST && isMentor(session, userId)) ||
                        (ext.getType() == SessionExtensionType.MENTOR_OFFER && isLearner(session, userId));

        if (!canDecline) throw new BookingException("You are not allowed to decline this extension");

        if (ext.getStatus() != SessionExtensionStatus.PENDING_DECISION) {
            throw new BookingException("Extension not awaiting decision");
        }

        ext.setDecidedByUserId(userId);
        ext.setDecidedAt(Instant.now());
        ext.setStatus(SessionExtensionStatus.DECLINED);

        sessionExtensionRepository.save(ext);

        return SessionExtensionDecisionResponse.builder()
                .extensionId(ext.getId())
                .sessionId(sessionId)
                .status(ext.getStatus().name())
                .expiresAt(ext.getExpiresAt())
                .build();
    }

    @Override
    public SessionExtensionDecisionResponse cancel(Long sessionId, Long extensionId, Long userId) {
        SessionExtension ext = loadExtensionForUpdate(extensionId);
        if (!ext.getSession().getId().equals(sessionId)) throw new BookingException("Extension/session mismatch");

        if (!userId.equals(ext.getInitiatedByUserId())) {
            throw new BookingException("Only initiator can cancel");
        }

        if (ext.getStatus() == SessionExtensionStatus.APPLIED ||
                ext.getStatus() == SessionExtensionStatus.SUCCEEDED ||
                ext.getStatus() == SessionExtensionStatus.REFUNDED) {
            throw new BookingException("Cannot cancel after payment/apply");
        }

        ext.setStatus(SessionExtensionStatus.CANCELLED);
        sessionExtensionRepository.save(ext);

        return SessionExtensionDecisionResponse.builder()
                .extensionId(ext.getId())
                .sessionId(sessionId)
                .status(ext.getStatus().name())
                .expiresAt(ext.getExpiresAt())
                .build();
    }

    @Override
    public CreateExtensionPaymentResponse createPaymentIntent(Long sessionId, Long extensionId, Long learnerUserId) {
        SessionExtension ext = loadExtensionForUpdate(extensionId);
        if (!ext.getSession().getId().equals(sessionId)) throw new BookingException("Extension/session mismatch");

        Session session = ext.getSession();
        validateLearnerIsParticipant(session, learnerUserId);
        validateSessionStillExtendable(session);

        if (ext.getStatus() != SessionExtensionStatus.APPROVED_AWAITING_PAYMENT) {
            throw new BookingException("Extension is not approved/accepted for payment");
        }
        if (ext.getExpiresAt() != null && Instant.now().isAfter(ext.getExpiresAt())) {
            ext.setStatus(SessionExtensionStatus.EXPIRED);
            sessionExtensionRepository.save(ext);
            throw new BookingException("Extension payment window expired");
        }

        // idempotency: if already has PaymentIntent, return error to avoid duplicates
        if (ext.getStripePaymentIntentId() != null) {
            throw new BookingException("Payment already initialized for this extension");
        }

        BigDecimal amount = computeExtensionAmount(session, ext.getMinutes());
        String currency = resolveCurrency(session);

        Map<String, String> md = new HashMap<>();
        md.put("purpose", "SESSION_EXTENSION");
        md.put("sessionId", String.valueOf(session.getId()));
        md.put("extensionId", String.valueOf(ext.getId()));
        md.put("minutes", String.valueOf(ext.getMinutes()));
        md.put("learnerId", String.valueOf(session.getLearner().getUserId()));
        md.put("mentorId", String.valueOf(session.getMentor().getMentorId()));
        md.put("app", "Mentr_V1");

        try {
            PaymentIntent pi = stripeService.createPaymentIntent(amount, currency, md);

            ext.setAmount(amount);
            ext.setCurrency(currency);
            ext.setStripePaymentIntentId(pi.getId());
            ext.setStatus(SessionExtensionStatus.PAYMENT_PENDING);

            sessionExtensionRepository.save(ext);

            return CreateExtensionPaymentResponse.builder()
                    .extensionId(ext.getId())
                    .stripePaymentIntentId(pi.getId())
                    .clientSecret(pi.getClientSecret())
                    .amount(amount)
                    .currency(currency)
                    .minutes(ext.getMinutes())
                    .build();

        } catch (StripeException e) {
            log.error("Failed to create extension payment intent", e);
            throw new BookingException("Failed to create extension payment");
        }
    }

    @Override
    public void handleExtensionPaymentSuccess(String paymentIntentId, Map<String, String> metadata) {
        SessionExtension ext = sessionExtensionRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new IllegalStateException("Extension not found for intent " + paymentIntentId));

        if (ext.getStatus() == SessionExtensionStatus.APPLIED) {
            log.info("Extension {} already applied; skipping duplicate webhook", ext.getId());
            return;
        }

        // Get chargeId for refund/receipt
        String chargeId = fetchChargeId(paymentIntentId);

        ext.setStripeChargeId(chargeId);
        ext.setPaidAt(Instant.now());
        ext.setReceiptUrl("https://dashboard.stripe.com/payments/" + paymentIntentId);

        // If extension is not valid anymore, refund immediately
        if (ext.getStatus() == SessionExtensionStatus.EXPIRED ||
                ext.getStatus() == SessionExtensionStatus.CANCELLED ||
                ext.getStatus() == SessionExtensionStatus.DECLINED) {

            refundIfPossible(ext, "EXTENSION_BECAME_INVALID_AFTER_PAYMENT");
            return;
        }

        ext.setStatus(SessionExtensionStatus.SUCCEEDED);
        sessionExtensionRepository.saveAndFlush(ext);

        // Apply extension (locks session row)
        Session session = ext.getSession();
        entityManager.lock(session, LockModeType.PESSIMISTIC_WRITE);

        validateSessionStillExtendable(session);

        // cap total extension
        int alreadyExtended = getTotalAppliedExtensionMinutes(session.getId());
        if (alreadyExtended + ext.getMinutes() > MAX_TOTAL_EXTENSION_MINUTES) {
            refundIfPossible(ext, "EXTENSION_CAP_EXCEEDED");
            return;
        }

        Instant oldEnd = session.getEndTime();
        if (oldEnd == null) {
            refundIfPossible(ext, "SESSION_ENDTIME_MISSING");
            return;
        }

        Instant newEnd = oldEnd.plusSeconds(ext.getMinutes() * 60L);
        session.setEndTime(newEnd);
        session.setUpdatedAt(Instant.now());
        sessionRepository.saveAndFlush(session);

        // Keep booking aligned for UI (don’t touch booking.amount here)
        Booking booking = session.getBooking();
        if (booking != null && booking.getEndTime() != null && booking.getDurationMinutes() != null) {
            booking.setEndTime(booking.getEndTime().plusSeconds(ext.getMinutes() * 60L));
            booking.setDurationMinutes(booking.getDurationMinutes() + ext.getMinutes());
            booking.setUpdatedAt(Instant.now());
        }

        // Update Daily room exp ONLY if room already exists (meetingLink not null)
        try {
            dailyVideoService.updateRoomExpiryIfExists(session);
        } catch (Exception e) {
            // If Daily update fails, still keep DB extended (participants won’t be kicked if room not created;
            // but if room exists, they might be ejected early). So log loudly.
            log.error("Daily room exp update failed for session {}", session.getId(), e);
        }

        // Credit mentor wallet for this extension (same commission logic as your PaymentServiceImpl)
        try {
            creditMentor(session, ext);
        } catch (Exception e) {
            log.error("Mentor wallet credit failed for extension {}", ext.getId(), e);
            // We do NOT rollback extension time. Finance can be reconciled later.
        }

        ext.setStatus(SessionExtensionStatus.APPLIED);
        ext.setAppliedAt(Instant.now());
        ext.setNewEndTime(newEnd);
        sessionExtensionRepository.saveAndFlush(ext);

        log.info("✅ Extension applied: session {} endTime {} -> {} (extId={})",
                session.getId(), oldEnd, newEnd, ext.getId());
    }

    @Override
    public void handleExtensionPaymentFailure(String paymentIntentId) {
        sessionExtensionRepository.findByStripePaymentIntentId(paymentIntentId)
                .ifPresent(ext -> {
                    if (ext.getStatus() == SessionExtensionStatus.APPLIED) return;
                    ext.setStatus(SessionExtensionStatus.FAILED);
                    sessionExtensionRepository.save(ext);
                });
    }

    @Override
    public SessionExtensionActiveResponse getActive(Long sessionId, Long userId) {
        Session session = loadSessionOrThrow(sessionId);

        boolean participant = isLearner(session, userId) || isMentor(session, userId);
        if (!participant) throw new BookingException("Not allowed");

        Instant now = Instant.now();
        Instant end = session.getEndTime();
        long remaining = (end != null) ? Math.max(0, Duration.between(now, end).getSeconds()) : 0;

        // only show within prompt window
        if (end != null && remaining > PROMPT_WINDOW_SECONDS) {
            return SessionExtensionActiveResponse.builder()
                    .sessionId(sessionId)
                    .sessionEndTime(end)
                    .remainingSeconds(remaining)
                    .build();
        }

        // Find latest active extension (if any)
        List<SessionExtension> recent = sessionExtensionRepository.findTop5BySession_IdOrderByCreatedAtDesc(sessionId);
        SessionExtension found = recent.stream()
                .filter(e -> e.getStatus() == SessionExtensionStatus.PENDING_DECISION
                        || e.getStatus() == SessionExtensionStatus.APPROVED_AWAITING_PAYMENT
                        || e.getStatus() == SessionExtensionStatus.PAYMENT_PENDING)
                .findFirst()
                .orElse(null);

        if (found == null) {
            return SessionExtensionActiveResponse.builder()
                    .sessionId(sessionId)
                    .sessionEndTime(end)
                    .remainingSeconds(remaining)
                    .build();
        }

        return SessionExtensionActiveResponse.builder()
                .extensionId(found.getId())
                .sessionId(sessionId)
                .type(found.getType().name())
                .status(found.getStatus().name())
                .minutes(found.getMinutes())
                .amount(found.getAmount())
                .currency(found.getCurrency())
                .initiatedByUserId(found.getInitiatedByUserId())
                .expiresAt(found.getExpiresAt())
                .sessionEndTime(end)
                .remainingSeconds(remaining)
                .build();
    }

    /* =========================
       Helpers
       ========================= */

    private Session loadSessionOrThrow(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BookingException("Session not found"));
    }

    private SessionExtension loadExtensionForUpdate(Long extensionId) {
        return sessionExtensionRepository.findByIdForUpdate(extensionId)
                .orElseThrow(() -> new BookingException("Extension not found"));
    }

    private void ensureNoActiveExtension(Long sessionId) {
        List<SessionExtension> active = sessionExtensionRepository.findActiveForSession(
                sessionId,
                List.of(
                        SessionExtensionStatus.PENDING_DECISION,
                        SessionExtensionStatus.APPROVED_AWAITING_PAYMENT,
                        SessionExtensionStatus.PAYMENT_PENDING
                )
        );
        if (!active.isEmpty()) {
            throw new BookingException("Another extension is already in progress");
        }
    }

    private void validateSessionStillExtendable(Session session) {
        if (session.getEndTime() == null) throw new BookingException("Session endTime missing");
        if (Instant.now().isAfter(session.getEndTime())) {
            throw new BookingException("Session already ended");
        }
    }

    private boolean isLearner(Session session, Long userId) {
        return session.getLearner() != null && session.getLearner().getUserId().equals(userId);
    }

    private boolean isMentor(Session session, Long userId) {
        return session.getMentor() != null
                && session.getMentor().getUser() != null
                && session.getMentor().getUser().getUserId().equals(userId);
    }

    private void validateLearnerIsParticipant(Session session, Long learnerUserId) {
        if (!isLearner(session, learnerUserId)) throw new BookingException("Only session learner can do this");
    }

    private void validateMentorIsParticipant(Session session, Long mentorUserId) {
        if (!isMentor(session, mentorUserId)) throw new BookingException("Only session mentor can do this");
    }

    private BigDecimal computeExtensionAmount(Session session, int minutes) {
        Booking booking = session.getBooking();
        if (booking != null && booking.getAmount() != null && booking.getDurationMinutes() != null && booking.getDurationMinutes() > 0) {
            BigDecimal perMin = booking.getAmount()
                    .divide(BigDecimal.valueOf(booking.getDurationMinutes()), 4, RoundingMode.HALF_UP);
            return perMin.multiply(BigDecimal.valueOf(minutes)).setScale(2, RoundingMode.HALF_UP);
        }

        // fallback: use mentor callPrice pro-rated by minutes
        BigDecimal callPrice = session.getMentor() != null ? session.getMentor().getCallPrice() : null;
        if (callPrice == null) throw new BookingException("Cannot compute extension amount");

        // assume callPrice is for 30 min if booking duration unknown
        BigDecimal perMin = callPrice.divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
        return perMin.multiply(BigDecimal.valueOf(minutes)).setScale(2, RoundingMode.HALF_UP);
    }

    private String resolveCurrency(Session session) {
        Booking booking = session.getBooking();
        if (booking != null && booking.getCurrency() != null) return booking.getCurrency();
        return stripeConfig.getCurrency();
    }

    private String fetchChargeId(String paymentIntentId) {
        try {
            Map<String, Object> chargeParams = new HashMap<>();
            chargeParams.put("payment_intent", paymentIntentId);
            ChargeCollection charges = com.stripe.model.Charge.list(chargeParams);
            if (charges.getData() != null && !charges.getData().isEmpty()) {
                return charges.getData().get(0).getId();
            }
        } catch (Exception e) {
            log.error("Failed to fetch Stripe chargeId for {}", paymentIntentId, e);
        }
        return null;
    }

    private void refundIfPossible(SessionExtension ext, String reason) {
        try {
            if (ext.getStripeChargeId() != null && ext.getAmount() != null) {
                Refund refund = stripeService.createRefund(ext.getStripeChargeId(), ext.getAmount(), reason);
                ext.setStatus(SessionExtensionStatus.REFUNDED);
                ext.setRefundTransactionId(refund.getId());
                ext.setRefundReason(reason);
                sessionExtensionRepository.saveAndFlush(ext);
                log.warn("↩️ Refunded extension {} due to {}", ext.getId(), reason);
                return;
            }
        } catch (Exception e) {
            log.error("Refund failed for extension {}", ext.getId(), e);
        }
        ext.setStatus(SessionExtensionStatus.FAILED);
        ext.setRefundReason(reason);
        sessionExtensionRepository.saveAndFlush(ext);
    }

    private int getTotalAppliedExtensionMinutes(Long sessionId) {
        List<SessionExtension> recent = sessionExtensionRepository.findTop5BySession_IdOrderByCreatedAtDesc(sessionId);
        return recent.stream()
                .filter(e -> e.getStatus() == SessionExtensionStatus.APPLIED)
                .mapToInt(e -> e.getMinutes() != null ? e.getMinutes() : 0)
                .sum();
    }

    private void creditMentor(Session session, SessionExtension ext) {
        if (ext.getAmount() == null || ext.getAmount().compareTo(BigDecimal.ZERO) <= 0) return;

        // mentor wallet is keyed by mentor.user.userId in your PaymentServiceImpl
        Long mentorUserId = session.getMentor().getUser().getUserId();
        Wallet mentorWallet = walletRepository.findByUser_UserId(mentorUserId)
                .orElseThrow(() -> new IllegalStateException("Mentor wallet not found"));

        BigDecimal commissionPercent = BigDecimal.valueOf(stripeConfig.getPlatformCommissionPercent());
        BigDecimal commission = ext.getAmount()
                .multiply(commissionPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal mentorEarning = ext.getAmount().subtract(commission);

        if (mentorWallet.getBalance() == null) mentorWallet.setBalance(BigDecimal.ZERO);
        if (mentorWallet.getLifetimeEarnings() == null) mentorWallet.setLifetimeEarnings(BigDecimal.ZERO);

        mentorWallet.credit(mentorEarning);
        walletRepository.saveAndFlush(mentorWallet);

        Transaction txn = Transaction.builder()
                .wallet(mentorWallet)
                .amount(mentorEarning)
                .currency(ext.getCurrency() != null ? ext.getCurrency() : stripeConfig.getCurrency())
                .type("CREDIT")
                .reason("MENTOR_EXTENSION_PAYOUT")
                .status("COMPLETED")
                .referenceId(ext.getStripePaymentIntentId())
                .description("Extension payout for Session #" + session.getId() + " (+" + ext.getMinutes() + "m)")
                .createdAt(Instant.now())
                .build();

        transactionRepository.saveAndFlush(txn);
    }

    @Override
    public void handleExtensionPaymentFailure(String paymentIntentId, Map<String, String> metadata) {
        sessionExtensionRepository.findByStripePaymentIntentId(paymentIntentId)
                .ifPresent(ext -> {
                    if (ext.getStatus() == SessionExtensionStatus.APPLIED) return;
                    ext.setStatus(SessionExtensionStatus.FAILED);
                    sessionExtensionRepository.save(ext);
                });
    }

}

