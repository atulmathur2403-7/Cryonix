package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.booking.BookingRequest;
import com.Mentr_App.Mentr_V1.dto.booking.BookingResponse;
import com.Mentr_App.Mentr_V1.dto.session.SessionResponse;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowActiveRequestResponse;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowDecisionResponse;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowStartRequest;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowStartResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.model.enums.MentorPresenceStatus;
import com.Mentr_App.Mentr_V1.model.enums.SessionStatus;
import com.Mentr_App.Mentr_V1.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * TALK NOW SERVICE IMPLEMENTATION
 * -------------------------------
 * Implements Talk Now flows on top of existing:
 *  - Booking / Payment / Session entities
 *  - Stripe webhooks (winner selection happens in PaymentServiceImpl)
 *
 * Design:
 *  - We reuse Booking as "TalkNowRequest" (bookingType = TALK_NOW).
 *  - Learner side only creates booking + PaymentIntent (status PENDING_PAYMENT).
 *  - When Stripe webhook marks payment SUCCEEDED:
 *      • handlePaymentSuccess(...) uses MentorPresence to pick winner
 *      • winner booking → RINGING, losers → REJECTED_CONFLICT + refund
 *
 *  - Mentor side:
 *      • polls /active to see RINGING requests
 *      • accepts/declines using bookingId
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TalkNowServiceImpl implements TalkNowService {

    private static final int RING_TIMEOUT_SECONDS = 30;

    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;
    private final MentorPresenceRepository mentorPresenceRepository;
    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final SessionRepository sessionRepository;
    private final PaymentService paymentService;
    private final BookingChatSyncService bookingChatSyncService;

    @Value("${daily.eject-grace-seconds}")
    private int graceSeconds;


    /* --------------------------------------------------
     * 1) Learner starts Talk Now
     * -------------------------------------------------- */

    /**
     * Learner initiates Talk Now by creating a TALK_NOW booking + PaymentIntent.
     *
     * Rules:
     *  - Mentor must currently be LIVE (presence check).
     *  - DurationMinutes is mandatory and validated in BookingServiceImpl.
     *  - Booking status after this is PENDING_PAYMENT; actual "winner" is
     *    decided later in Stripe webhook.
     */
    @Override
    public TalkNowStartResponse startTalkNow(User learner, TalkNowStartRequest request) {
        // 1️⃣ Validate mentor exists
        Mentor mentor = mentorRepository.findById(request.getMentorId())
                .orElseThrow(() -> new BookingException("Mentor not found"));

        // 2️⃣ Check mentor is LIVE right now
        MentorPresence presence = mentorPresenceRepository.findByMentor_MentorId(mentor.getMentorId())
                .orElse(null);
        if (presence == null || presence.getStatus() != MentorPresenceStatus.LIVE) {
            throw new BookingException("Mentor is not LIVE for Talk Now right now");
        }

        // 3️⃣ Build BookingRequest using TALK_NOW bookingType
        BookingRequest bookingRequest = new BookingRequest();
        bookingRequest.setMentorId(request.getMentorId());
        bookingRequest.setBookingType("TALK_NOW");
        bookingRequest.setDurationMinutes(request.getDurationMinutes());
        // bookingTime is ignored for TALK_NOW in BookingServiceImpl

        // 4️⃣ Delegate all pricing + PaymentIntent creation to BookingService
        BookingResponse bookingResponse = bookingService.createBooking(bookingRequest, learner);

        // 5️⃣ Map to TalkNowStartResponse (frontend gets clientSecret)
        return TalkNowStartResponse.builder()
                .requestId(bookingResponse.getBookingId())
                .bookingId(bookingResponse.getBookingId())
                .mentorId(bookingResponse.getMentorId())
                .learnerId(bookingResponse.getLearnerId())
                .durationMinutes(bookingResponse.getDurationMinutes())
                .amount(bookingResponse.getTotalAmount())
                .currency(bookingResponse.getCurrency())
                .paymentId(bookingResponse.getPaymentId())
                .paymentClientSecret(bookingResponse.getClientSecret())
                .build();
    }

    /* --------------------------------------------------
     * 2) Mentor polls for RINGING Talk Now request
     * -------------------------------------------------- */

    /**
     * Mentor dashboard polls to see if there is an active RINGING Talk Now.
     *
     * Behavior:
     *  - If presence not RINGING → return null → controller sends 204.
     *  - If ringExpired → auto-expire + refund and return null.
     *  - Else → return TalkNowActiveRequestResponse with learner & amount.
     */
    @Override
    public TalkNowActiveRequestResponse getActiveRingingForMentor(Long mentorUserId) {
        // 1️⃣ Resolve mentor from userId (JWT)
        Mentor mentor = mentorRepository.findByUser_UserId(mentorUserId)
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        // 2️⃣ Load presence row
        MentorPresence presence = mentorPresenceRepository.findByMentor_MentorId(mentor.getMentorId())
                .orElse(null);

        if (presence == null ||
                presence.getStatus() != MentorPresenceStatus.RINGING ||
                presence.getActiveBookingId() == null) {
            return null; // no ringing right now
        }

        Instant now = Instant.now();

        // 3️⃣ If ringing already expired → auto-expire + refund + clear presence
        if (presence.getRingExpiresAt() != null && now.isAfter(presence.getRingExpiresAt())) {
            expireAndRefundIfNeeded(presence);
            return null;
        }

        // 4️⃣ Load booking + learner details
        Booking booking = bookingRepository.findById(presence.getActiveBookingId())
                .orElseThrow(() -> new BookingException("Talk Now booking not found"));
        User learner = booking.getLearner();

        // 5️⃣ Build mentor popup payload
        return TalkNowActiveRequestResponse.builder()
                .requestId(booking.getId())
                .bookingId(booking.getId())
                .mentorId(mentor.getMentorId())
                .learnerId(learner.getUserId())
                .learnerName(learner.getName())
                .durationMinutes(booking.getDurationMinutes())
                .amount(booking.getAmount())
                .currency(booking.getCurrency())
                .ringExpiresAt(presence.getRingExpiresAt())
                .build();
    }

    /* --------------------------------------------------
     * 3) Mentor ACCEPTS a ringing Talk Now
     * -------------------------------------------------- */

    /**
     * Mentor accepts a ringing Talk Now request.
     *
     * Steps:
     *  1. Validate booking exists, belongs to mentor, and is TALK_NOW.
     *  2. Validate presence is RINGING and activeBookingId matches.
     *  3. Check ringExpiresAt (if expired → auto-expire + refund).
     *  4. Atomic status change: RINGING → IN_CALL for this booking.
     *  5. Create Session starting now for durationMinutes.
     *  6. Mark booking CONFIRMED.
     */
    @Override
    public TalkNowDecisionResponse acceptTalkNow(Long mentorUserId, Long bookingId) {
        // 1️⃣ Resolve mentor and booking
        Mentor mentor = mentorRepository.findByUser_UserId(mentorUserId)
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        // 2️⃣ Validate this is Talk Now & belongs to this mentor
        if (!"TALK_NOW".equalsIgnoreCase(booking.getBookingType())) {
            throw new BookingException("This booking is not a Talk Now request");
        }
        if (!booking.getMentor().getMentorId().equals(mentor.getMentorId())) {
            throw new BookingException("You cannot accept a Talk Now request for another mentor");
        }

        MentorPresence presence = mentorPresenceRepository.findByMentor_MentorId(mentor.getMentorId())
                .orElseThrow(() -> new BookingException("Presence not initialized for mentor"));

        Instant now = Instant.now();

        // 3️⃣ Validate we are RINGING for this booking
        if (presence.getStatus() != MentorPresenceStatus.RINGING ||
                presence.getActiveBookingId() == null ||
                !presence.getActiveBookingId().equals(bookingId)) {
            throw new BookingException("No active Talk Now ringing for this booking");
        }

        // 4️⃣ If ring has expired → auto-expire & refund
        if (presence.getRingExpiresAt() != null && now.isAfter(presence.getRingExpiresAt())) {
            expireAndRefundIfNeeded(presence);

            return TalkNowDecisionResponse.builder()
                    .bookingId(booking.getId())
                    .mentorId(mentor.getMentorId())
                    .learnerId(booking.getLearner().getUserId())
                    .decision("EXPIRED")
                    .durationMinutes(booking.getDurationMinutes())
                    .amount(booking.getAmount())
                    .currency(booking.getCurrency())
                    .session(null)
                    .build();
        }

        // 5️⃣ Atomic RINGING → IN_CALL transition
        int updated = mentorPresenceRepository.updateStatusIfMatches(
                mentor.getMentorId(),
                MentorPresenceStatus.RINGING,
                MentorPresenceStatus.IN_CALL,
                booking.getId(),
                null // clear ringExpiresAt
        );
        if (updated == 0) {
            throw new BookingException("Talk Now request has already been handled");
        }

        // 6️⃣ Create session starting now with requested duration
        int duration = booking.getDurationMinutes() != null ? booking.getDurationMinutes() : 30;
        Instant start = now;
        Instant end = now.plusSeconds(duration * 60L).plusSeconds(graceSeconds);

        Session session = Session.builder()
                .booking(booking)
                .mentor(mentor)
                .learner(booking.getLearner())
                .startTime(start)
                .endTime(end)
                .status(SessionStatus.CONFIRMED)
                .meetingProvider("DAILY")
                .meetingLink(null) // Daily room will be created lazily on first /join
                .createdAt(now)
                .updatedAt(now)
                .build();


        Session savedSession = sessionRepository.save(session);

        // 7️⃣ Mark booking CONFIRMED (was RINGING)
        booking.setStatus("CONFIRMED");
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setBookingTime(start);
        booking.setUpdatedAt(now);
        bookingRepository.saveAndFlush(booking);

        bookingChatSyncService.syncChatPermissionForPair(
                booking.getLearner().getUserId(),
                booking.getMentor().getMentorId(),
                "TALKNOW_ACCEPT",
                booking.getId()
        );


        // 8️⃣ Map session → SessionResponse for frontend
        SessionResponse sessionDto = new SessionResponse();
        sessionDto.setSessionId(savedSession.getId());
        sessionDto.setBookingId(savedSession.getBooking().getId());
        sessionDto.setMentorId(mentor.getMentorId());
        sessionDto.setMentorName(mentor.getUser().getName());
        sessionDto.setLearnerId(booking.getLearner().getUserId());
        sessionDto.setLearnerName(booking.getLearner().getName());
        sessionDto.setStartTime(start);
        sessionDto.setEndTime(end);
        sessionDto.setStatus(savedSession.getStatus());
        sessionDto.setMeetingLink(savedSession.getMeetingLink());
        sessionDto.setRecordingLink(savedSession.getRecordingLink());

        return TalkNowDecisionResponse.builder()
                .bookingId(booking.getId())
                .mentorId(mentor.getMentorId())
                .learnerId(booking.getLearner().getUserId())
                .decision("ACCEPTED")
                .durationMinutes(duration)
                .amount(booking.getAmount())
                .currency(booking.getCurrency())
                .session(sessionDto)
                .build();
    }

    /* --------------------------------------------------
     * 4) Mentor DECLINES a ringing Talk Now
     * -------------------------------------------------- */

    /**
     * Mentor declines a ringing Talk Now request.
     *
     * Behavior:
     *  - Presence: RINGING → LIVE (scheduler may turn LIVE → OFFLINE later).
     *  - Booking:  status → CANCELLED_BY_MENTOR.
     *  - Payment:  auto-refund full amount back to original method.
     */
    @Override
    public TalkNowDecisionResponse declineTalkNow(Long mentorUserId, Long bookingId) {
        // 1️⃣ Resolve mentor and booking
        Mentor mentor = mentorRepository.findByUser_UserId(mentorUserId)
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        // 2️⃣ Validate Talk Now + ownership
        if (!"TALK_NOW".equalsIgnoreCase(booking.getBookingType())) {
            throw new BookingException("This booking is not a Talk Now request");
        }
        if (!booking.getMentor().getMentorId().equals(mentor.getMentorId())) {
            throw new BookingException("You cannot decline a Talk Now request for another mentor");
        }

        MentorPresence presence = mentorPresenceRepository.findByMentor_MentorId(mentor.getMentorId())
                .orElseThrow(() -> new BookingException("Presence not initialized for mentor"));

        Instant now = Instant.now();

        // 3️⃣ Validate we are RINGING for this booking
        if (presence.getStatus() != MentorPresenceStatus.RINGING ||
                presence.getActiveBookingId() == null ||
                !presence.getActiveBookingId().equals(bookingId)) {
            throw new BookingException("No active Talk Now ringing for this booking");
        }

        // 4️⃣ Presence: RINGING → LIVE (clear booking/expiry)
        mentorPresenceRepository.clearActiveBookingAndUpdateStatus(
                mentor.getMentorId(),
                MentorPresenceStatus.RINGING,
                MentorPresenceStatus.LIVE,
                bookingId
        );

        // 5️⃣ Booking: mark cancelled by mentor
        booking.setStatus("CANCELLED_BY_MENTOR");
        booking.setUpdatedAt(now);
        bookingRepository.saveAndFlush(booking);

        bookingChatSyncService.syncChatPermissionForPair(
                booking.getLearner().getUserId(),
                booking.getMentor().getMentorId(),
                "TALKNOW_DECLINE",
                booking.getId()
        );


        // 6️⃣ Payment: full refund to original payment method (if succeeded)
        paymentRepository.findByBooking(booking).ifPresent(payment -> {
            try {
                if ("SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
                    paymentService.refundToOriginalPayment(
                            payment.getId(),
                            payment.getAmount(),
                            "TALKNOW_DECLINED_BY_MENTOR"
                    );
                }
            } catch (Exception e) {
                log.error("Failed to refund Talk Now payment {}: {}", payment.getId(), e.getMessage(), e);
            }
        });

        return TalkNowDecisionResponse.builder()
                .bookingId(booking.getId())
                .mentorId(mentor.getMentorId())
                .learnerId(booking.getLearner().getUserId())
                .decision("DECLINED")
                .durationMinutes(booking.getDurationMinutes())
                .amount(booking.getAmount())
                .currency(booking.getCurrency())
                .session(null)
                .build();
    }

    /* --------------------------------------------------
     * 5) Internal helper: expire RINGING + refund
     * -------------------------------------------------- */

    /**
     * Helper to mark a ringing Talk Now as EXPIRED and refund learner.
     *
     * Used by:
     *  - TalkNowServiceImpl when accept is too late.
     *  - Cleanup scheduler when RINGING timed out.
     */
    private void expireAndRefundIfNeeded(MentorPresence presence) {
        Long mentorId = presence.getMentor().getMentorId();
        Long bookingId = presence.getActiveBookingId();
        if (bookingId == null) return;

        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking != null && !"CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
            booking.setStatus("EXPIRED");
            booking.setUpdatedAt(Instant.now());
            bookingRepository.saveAndFlush(booking);


            bookingChatSyncService.syncChatPermissionForPair(
                    booking.getLearner().getUserId(),
                    booking.getMentor().getMentorId(),
                    "TALKNOW_EXPIRE_HELPER",
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

        // Reset presence back to LIVE for this mentor
        mentorPresenceRepository.clearActiveBookingAndUpdateStatus(
                mentorId,
                MentorPresenceStatus.RINGING,
                MentorPresenceStatus.LIVE,
                bookingId
        );
    }
}

