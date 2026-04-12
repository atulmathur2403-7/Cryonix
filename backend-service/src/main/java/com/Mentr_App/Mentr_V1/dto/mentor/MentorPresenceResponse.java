package com.Mentr_App.Mentr_V1.dto.mentor;


import com.Mentr_App.Mentr_V1.model.enums.MentorPresenceStatus;
import lombok.Data;

import java.time.Instant;

/**
 * MENTOR PRESENCE RESPONSE DTO
 * ----------------------------
 * Snapshot of a mentor's Talk Now presence.
 *
 * Used by:
 *  - MentorController presence endpoints (LIVE/OFFLINE/heartbeat).
 *  - Mentor dashboard to show exact state + timers if needed.
 */
@Data
public class MentorPresenceResponse {

    private Long mentorId;

    private MentorPresenceStatus status;

    private Long activeBookingId;

    private Instant ringExpiresAt;

    private Instant lastHeartbeatAt;
}

