package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.model.enums.MentorPresenceStatus;
import com.Mentr_App.Mentr_V1.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * TALK NOW CLEANUP SCHEDULER
 * --------------------------
 * Background job to self-heal Talk Now states:
 *
 * 1) LIVE / IN_CALL with stale heartbeat:
 *    - If lastHeartbeatAt > OFFLINE_THRESHOLD_SECONDS ago → OFFLINE.
 *
 * 2) RINGING that has passed ringExpiresAt:
 *    - Mark booking EXPIRED.
 *    - Auto-refund payment if SUCCEEDED.
 *    - Reset presence back to LIVE.
 *
 * 3) TALK_NOW PENDING_PAYMENT older than TTL:
 *    - Mark booking EXPIRED (no money movement).
 *
 * Requires:
 *  - @EnableScheduling on MentrV1Application.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TalkNowCleanupScheduler {

    private final MentorPresenceRepository mentorPresenceRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;
    private final BookingChatSyncService bookingChatSyncService;

    // Thresholds (can be externalized to config if needed)
    private static final long OFFLINE_THRESHOLD_SECONDS = 90;
    private static final long PENDING_PAYMENT_TTL_MINUTES = 5;

    /**
     * Runs every 60 seconds.
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void cleanupTalkNowStates() {
        Instant now = Instant.now();

        /* ----------------------------------------------
         * 1) LIVE / IN_CALL with stale heartbeat → OFFLINE
         * ---------------------------------------------- */
        List<MentorPresence> allPresence = mentorPresenceRepository.findAll();
        for (MentorPresence p : allPresence) {
            if (p.getLastHeartbeatAt() == null) continue;

            long ageSec = Duration.between(p.getLastHeartbeatAt(), now).getSeconds();

            boolean isLiveOrInCall =
                    p.getStatus() == MentorPresenceStatus.LIVE ||
                            p.getStatus() == MentorPresenceStatus.IN_CALL;

            if (isLiveOrInCall && ageSec > OFFLINE_THRESHOLD_SECONDS) {
                p.setStatus(MentorPresenceStatus.OFFLINE);
                p.setActiveBookingId(null);
                p.setRingExpiresAt(null);
                log.info("⏱ Auto-set mentor {} OFFLINE (stale heartbeat)", p.getMentor().getMentorId());
            }

            /* ----------------------------------------------
             * 2) RINGING timed out → EXPIRED + refund
             * ---------------------------------------------- */
            if (p.getStatus() == MentorPresenceStatus.RINGING &&
                    p.getRingExpiresAt() != null &&
                    now.isAfter(p.getRingExpiresAt()) &&
                    p.getActiveBookingId() != null) {

                Long bookingId = p.getActiveBookingId();
                Booking booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null && !"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
                    booking.setStatus("EXPIRED");
                    booking.setUpdatedAt(now);
                    bookingRepository.saveAndFlush(booking);

                    bookingChatSyncService.syncChatPermissionForPair(
                            booking.getLearner().getUserId(),
                            booking.getMentor().getMentorId(),
                            "TALKNOW_RING_EXPIRED_SCHEDULER",
                            booking.getId()
                    );


                    paymentRepository.findByBooking(booking).ifPresent(payment -> {
                        try {
                            if ("SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
                                paymentService.refundToOriginalPayment(
                                        payment.getId(),
                                        payment.getAmount(),
                                        "TALKNOW_RING_EXPIRED"
                                );
                            }
                        } catch (Exception e) {
                            log.error("Failed to refund expired Talk Now payment {}: {}", payment.getId(), e.getMessage(), e);
                        }
                    });
                }

                p.setStatus(MentorPresenceStatus.LIVE);
                p.setActiveBookingId(null);
                p.setRingExpiresAt(null);
                log.info("⏱ Auto-expired Talk Now ringing for booking {}", bookingId);
            }
        }
        mentorPresenceRepository.saveAll(allPresence);

        /* ----------------------------------------------
         * 3) TALK_NOW PENDING_PAYMENT older than TTL → EXPIRED
         * ---------------------------------------------- */
        bookingRepository.findAll().stream()
                .filter(b -> "TALK_NOW".equalsIgnoreCase(b.getBookingType()))
                .filter(b -> "PENDING_PAYMENT".equalsIgnoreCase(b.getStatus()))
                .filter(b -> b.getCreatedAt() != null &&
                        Duration.between(b.getCreatedAt(), now).toMinutes() >= PENDING_PAYMENT_TTL_MINUTES)
                .forEach(b -> {
                    b.setStatus("EXPIRED");
                    b.setUpdatedAt(now);
                    bookingRepository.saveAndFlush(b);

                    bookingChatSyncService.syncChatPermissionForPair(
                            b.getLearner().getUserId(),
                            b.getMentor().getMentorId(),
                            "TALKNOW_PENDING_EXPIRED_SCHEDULER",
                            b.getId()
                    );

                    log.info("⏱ Auto-expired stale TALK_NOW booking #{}", b.getId());
                });
    }
}

