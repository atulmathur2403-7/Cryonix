package com.Mentr_App.Mentr_V1.dto.talkNow;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * TALK NOW ACTIVE REQUEST RESPONSE
 * --------------------------------
 * Returned to mentor while polling for active RINGING request.
 *
 * Product Flow:
 *  - GET /api/talk-now/active
 *  - Mentor dashboard polls every ~2s to show Uber-like popup.
 */
@Data
@Builder
public class TalkNowActiveRequestResponse {

    private Long requestId;    // = bookingId
    private Long bookingId;

    private Long mentorId;
    private Long learnerId;
    private String learnerName;

    private Integer durationMinutes;
    private BigDecimal amount;
    private String currency;

    private Instant ringExpiresAt;
}

