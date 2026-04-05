package com.Mentr_App.Mentr_V1.dto.session;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

/**
 * JOIN SESSION RESPONSE
 * ---------------------
 * Returned by POST /api/sessions/{sessionId}/join.
 *
 * Contains:
 *  - session + booking context
 *  - mentor / learner identity
 *  - Daily room URL + access token
 */
@Data
@Builder
public class JoinSessionResponse {

    private Long sessionId;
    private Long bookingId;

    private Long mentorId;
    private Long learnerId;

    /**
     * Role of the caller for this join:
     *  - "MENTOR"
     *  - "LEARNER"
     */
    private String role;

    private Instant startTime;
    private Instant endTime;

    /**
     * Meeting provider identifier.
     * For new sessions this should be "DAILY".
     */
    private String meetingProvider;

    /**
     * Full room URL (Daily).
     */
    private String meetingLink;

    /**
     * Daily room name (e.g. session-123).
     */
    private String roomName;

    /**
     * Ephemeral Daily access token for this caller.
     */
    private String dailyAccessToken;

    private String mentorName;
    private String learnerName;
}

