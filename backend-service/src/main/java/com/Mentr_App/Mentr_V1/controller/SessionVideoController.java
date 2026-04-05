package com.Mentr_App.Mentr_V1.controller;


import com.Mentr_App.Mentr_V1.dto.session.DailyJoinInfo;
import com.Mentr_App.Mentr_V1.dto.session.JoinSessionResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.Session;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.model.enums.SessionStatus;
import com.Mentr_App.Mentr_V1.repository.SessionRepository;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.DailyVideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

/**
 * SESSION VIDEO CONTROLLER
 * ------------------------
 * Join endpoint for all video sessions (scheduled + Talk Now),
 * backed by Daily.co.
 *
 * HTTP:
 *  POST /api/sessions/{sessionId}/join
 */
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionVideoController {

    private static final long EARLY_JOIN_SECONDS = 15 * 60L;
    private static final long LATE_JOIN_GRACE_SECONDS = 15 * 60L;

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final DailyVideoService dailyVideoService;

    /**
     * Join a session as mentor or learner.
     * Caller must be one of the participants.
     */
    @PostMapping("/{sessionId}/join")
    public ResponseEntity<JoinSessionResponse> joinSession(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId
    ) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BookingException("Session not found"));

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BookingException("User not found"));

        boolean isMentorSide = session.getMentor() != null
                && session.getMentor().getUser() != null
                && session.getMentor().getUser().getUserId().equals(currentUser.getId());

        boolean isLearnerSide = session.getLearner() != null
                && session.getLearner().getUserId().equals(currentUser.getId());

        if (!isMentorSide && !isLearnerSide) {
            throw new BookingException("You are not allowed to join this session");
        }

        // Basic status and time guardrails
        if (session.getStatus() != SessionStatus.CONFIRMED) {
            throw new BookingException("Session is not active for joining");
        }

        Instant now = Instant.now();

        if (session.getStartTime() != null
                && now.isBefore(session.getStartTime().minusSeconds(EARLY_JOIN_SECONDS))) {
            throw new BookingException("You can join up to 15 minutes before the start time");
        }

        if (session.getEndTime() != null
                && now.isAfter(session.getEndTime().plusSeconds(LATE_JOIN_GRACE_SECONDS))) {
            throw new BookingException("Session has already ended");
        }

        DailyJoinInfo joinInfo = dailyVideoService.ensureRoomAndToken(session, user, isMentorSide);

        JoinSessionResponse resp = JoinSessionResponse.builder()
                .sessionId(session.getId())
                .bookingId(session.getBooking() != null ? session.getBooking().getId() : null)
                .mentorId(session.getMentor() != null ? session.getMentor().getMentorId() : null)
                .learnerId(session.getLearner() != null ? session.getLearner().getUserId() : null)
                .role(isMentorSide ? "MENTOR" : "LEARNER")
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .meetingProvider(session.getMeetingProvider())
                .meetingLink(joinInfo.getRoomUrl())
                .roomName(joinInfo.getRoomName())
                .dailyAccessToken(joinInfo.getToken())
                .mentorName(session.getMentor() != null && session.getMentor().getUser() != null
                        ? session.getMentor().getUser().getName()
                        : null)
                .learnerName(session.getLearner() != null
                        ? session.getLearner().getName()
                        : null)
                .build();

        return ResponseEntity.ok(resp);
    }
}

