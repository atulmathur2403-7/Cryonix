package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.dto.session.UpdateSessionStatusRequest;
import com.Mentr_App.Mentr_V1.dto.session.SessionResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.model.enums.MentorPresenceStatus;
import com.Mentr_App.Mentr_V1.model.enums.SessionStatus;
import com.Mentr_App.Mentr_V1.repository.MentorPresenceRepository;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.repository.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class SessionServiceImpl implements SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionServiceImpl.class);
    private final SessionRepository sessionRepository;
    private final MentorRepository mentorRepository; // ✅ needed to update booking count
    private final MentorPresenceRepository mentorPresenceRepository;

    public SessionServiceImpl(SessionRepository sessionRepository, MentorRepository mentorRepository,MentorPresenceRepository mentorPresenceRepository) {
        this.sessionRepository = sessionRepository;
        this.mentorRepository = mentorRepository;
        this.mentorPresenceRepository = mentorPresenceRepository;
    }

    @Override
    public SessionResponse getSessionById(Long id) {
        Session s = sessionRepository.findById(id)
                .orElseThrow(() -> new BookingException("Session not found"));

        SessionResponse resp = new SessionResponse();
        resp.setSessionId(s.getId());
        resp.setBookingId(s.getBooking() != null ? s.getBooking().getId() : null);

        // Force-load mentor & learner if needed
        Mentor mentor = s.getMentor();
        if (mentor != null && mentor.getUser() != null) {
            resp.setMentorId(mentor.getMentorId());
            resp.setMentorName(mentor.getUser().getName());
        }

        User learner = s.getLearner();
        if (learner != null) {
            resp.setLearnerId(learner.getUserId());
            resp.setLearnerName(learner.getName());
        }

        resp.setStartTime(s.getStartTime());
        resp.setEndTime(s.getEndTime());
        resp.setStatus(s.getStatus());
        resp.setMeetingLink(s.getMeetingLink());
        resp.setRecordingLink(s.getRecordingLink());

        return resp;
    }

    @Override
    public SessionResponse updateSessionStatus(Long id, UpdateSessionStatusRequest request) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new BookingException("Session not found"));

        SessionStatus newStatus = SessionStatus.valueOf(request.getNewStatus().toUpperCase());
        SessionStatus oldStatus = session.getStatus();

        session.setStatus(newStatus);

        // ✅ Generate meeting link when confirming
        if (newStatus == SessionStatus.CONFIRMED && session.getMeetingLink() == null) {
            session.setMeetingProvider("DAILY");
            session.setMeetingLink(null);
        }


        // ✅ Increment bookingsCount only when transitioning to COMPLETED
        if (newStatus == SessionStatus.COMPLETED && oldStatus != SessionStatus.COMPLETED) {
            Mentor mentor = session.getMentor();
            if (mentor != null) {
                int currentCount = mentor.getBookingsCount() == null ? 0 : mentor.getBookingsCount();
                mentor.setBookingsCount(currentCount + 1);
                mentorRepository.save(mentor); // persist increment
            }
        }

        Session updated = sessionRepository.save(session);
        return toResponse(updated);
    }

    @Override
    public List<SessionResponse> getSessionsForMentor(Long mentorId) {
        return sessionRepository.findByMentor_MentorIdOrderByStartTimeDesc(mentorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<SessionResponse> getSessionsForLearner(Long learnerId) {
        return sessionRepository.findByLearner_UserIdOrderByStartTimeDesc(learnerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * ✅ NEW HELPER METHOD
     * Called when payment succeeds to auto-create session if not already present.
     * This keeps booking-service and payment-service cleaner.
     */
    public Session createSessionAfterPayment(Booking booking) {
        return sessionRepository.findByBookingId(booking.getId())
                .orElseGet(() -> {
                    int duration = booking.getDurationMinutes() != null ? booking.getDurationMinutes() : 30;
                    Session session = Session.builder()
                            .booking(booking)
                            .mentor(booking.getMentor())
                            .learner(booking.getLearner())
                            .startTime(booking.getStartTime())
                            .endTime(booking.getEndTime())
                            .status(SessionStatus.CONFIRMED)
                            .meetingProvider("DAILY")   // was "JITSI"
                            .meetingLink(null)          // was MeetingLinkGenerator.generateJitsiLink()
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();
                    return sessionRepository.save(session);
                });
    }

    /**
     * Explicit "End Call" API:
     *
     *  - Ensures caller is either the mentor or the learner for this session.
     *  - If session is already COMPLETED or CANCELLED → returns current state (idempotent).
     *  - Otherwise:
     *      • Sets endTime to now (captures actual end)
     *      • Marks status = COMPLETED
     *      • Updates mentor.bookingsCount
     *      • Updates Talk Now presence (IN_CALL → LIVE/OFFLINE) if applicable
     */
    @Override
    public SessionResponse endSession(Long sessionId, Long callerUserId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BookingException("Session not found"));

        // --- Authorization: only the mentor or learner linked to the session may end it ---
        Long mentorUserId = (session.getMentor() != null && session.getMentor().getUser() != null)
                ? session.getMentor().getUser().getUserId()
                : null;
        Long learnerUserId = (session.getLearner() != null)
                ? session.getLearner().getUserId()
                : null;

        if (!Objects.equals(mentorUserId, callerUserId) && !Objects.equals(learnerUserId, callerUserId)) {
            throw new BookingException("You are not allowed to end this session");
        }

        // If already completed or cancelled, do nothing (idempotent endpoint)
        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.CANCELLED) {
            return toResponseWithNames(session);
        }

        // Capture actual end time as now (optional, but good for analytics & future prorated billing)
        Instant now = Instant.now();
        if (session.getEndTime() == null || session.getEndTime().isAfter(now)) {
            session.setEndTime(now);
        }

        // Mark as COMPLETED and update counters + presence
        session.setStatus(SessionStatus.COMPLETED);
        completeSessionAndUpdatePresence(session);

        Session saved = sessionRepository.save(session);
        return toResponseWithNames(saved);
    }

    /**
     * Auto-end job entry point.
     *
     * - Finds all CONFIRMED sessions whose endTime is already in the past.
     * - Marks them COMPLETED (if not already).
     * - Ensures mentor presence is moved from IN_CALL → LIVE/OFFLINE where applicable.
     *
     * This is safe to run multiple times; completion logic is idempotent per session.
     */
    @Override
    public void autoEndOverdueSessions() {
        Instant now = Instant.now();

        List<Session> overdue = sessionRepository.findByStatusAndEndTimeBefore(SessionStatus.CONFIRMED, now);
        if (overdue.isEmpty()) {
            return;
        }

        log.info("⏰ Auto-ending {} overdue sessions (endTime <= now)", overdue.size());

        for (Session session : overdue) {
            // If the session was changed concurrently to COMPLETED/CANCELLED, we skip
            if (session.getStatus() != SessionStatus.CONFIRMED) {
                continue;
            }
            session.setStatus(SessionStatus.COMPLETED);
            completeSessionAndUpdatePresence(session);
            sessionRepository.save(session);
        }
    }

    /**
     * Centralized "session completed" logic:
     *
     * - Increments mentor.bookingsCount once per session.
     * - Updates Talk Now presence record:
     *      IN_CALL + activeBookingId == this booking → LIVE or OFFLINE
     *        (based on lastHeartbeatAt freshness).
     *
     * This helper is called from:
     *  - updateSessionStatus(... newStatus=COMPLETED ...)
     *  - endSession(...)
     *  - autoEndOverdueSessions()
     */
    private void completeSessionAndUpdatePresence(Session session) {
        // --- Guard: ensure we only increment bookingsCount once ---
        if (session.getStatus() != SessionStatus.COMPLETED) {
            return;
        }

        // 1) Increment mentor bookingsCount (if not already counted)
        Mentor mentor = session.getMentor();
        if (mentor != null) {
            // We load from repository to avoid stale state if needed
            Mentor managedMentor = mentorRepository.findById(mentor.getMentorId())
                    .orElse(null);
            if (managedMentor != null) {
                Integer currentCount = managedMentor.getBookingsCount() == null ? 0 : managedMentor.getBookingsCount();
                managedMentor.setBookingsCount(currentCount + 1);
                mentorRepository.save(managedMentor);
            }
        }

        // 2) Update Talk Now presence if this session was the active IN_CALL one
        if (mentor == null || session.getBooking() == null) {
            return;
        }

        mentorPresenceRepository.findByMentor_MentorId(mentor.getMentorId())
                .ifPresent(presence -> {
                    // Only update if we are in IN_CALL and this booking is the one in call
                    if (presence.getStatus() != MentorPresenceStatus.IN_CALL) {
                        return;
                    }
                    if (!Objects.equals(presence.getActiveBookingId(), session.getBooking().getId())) {
                        return;
                    }

                    Instant now = Instant.now();
                    boolean heartbeatFresh = presence.getLastHeartbeatAt() != null
                            && presence.getLastHeartbeatAt().isAfter(now.minusSeconds(90));

                    // If heartbeat is still fresh, mentor goes back to LIVE; otherwise OFFLINE
                    presence.setStatus(heartbeatFresh ? MentorPresenceStatus.LIVE : MentorPresenceStatus.OFFLINE);
                    presence.setActiveBookingId(null);
                    presence.setRingExpiresAt(null);

                    mentorPresenceRepository.save(presence);
                });
    }

    /**
     * Map Session entity → SessionResponse, including mentor & learner names.
     */
    private SessionResponse toResponseWithNames(Session s) {
        SessionResponse resp = new SessionResponse();
        resp.setSessionId(s.getId());
        resp.setBookingId(s.getBooking() != null ? s.getBooking().getId() : null);

        Mentor mentor = s.getMentor();
        if (mentor != null && mentor.getUser() != null) {
            resp.setMentorId(mentor.getMentorId());
            resp.setMentorName(mentor.getUser().getName());
        }

        User learner = s.getLearner();
        if (learner != null) {
            resp.setLearnerId(learner.getUserId());
            resp.setLearnerName(learner.getName());
        }

        resp.setStartTime(s.getStartTime());
        resp.setEndTime(s.getEndTime());
        resp.setStatus(s.getStatus());
        resp.setMeetingLink(s.getMeetingLink());
        resp.setRecordingLink(s.getRecordingLink());

        return resp;
    }

    private SessionResponse toResponse(Session s) {
        SessionResponse resp = new SessionResponse();
        resp.setSessionId(s.getId());
        resp.setBookingId(s.getBooking() != null ? s.getBooking().getId() : null);
        resp.setMentorId(s.getMentor().getMentorId());
        resp.setLearnerId(s.getLearner().getUserId());
        resp.setStartTime(s.getStartTime());
        resp.setEndTime(s.getEndTime());
        resp.setStatus(s.getStatus());
        resp.setMeetingLink(s.getMeetingLink());
        resp.setRecordingLink(s.getRecordingLink());
        return resp;
    }
}
