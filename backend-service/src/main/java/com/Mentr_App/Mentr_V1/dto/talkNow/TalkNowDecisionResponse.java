package com.Mentr_App.Mentr_V1.dto.talkNow;


import com.Mentr_App.Mentr_V1.dto.session.SessionResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * TALK NOW DECISION RESPONSE
 * --------------------------
 * Returned when mentor accepts or declines a ringing Talk Now.
 *
 * decision:
 *  - "ACCEPTED" : session created, presence = IN_CALL
 *  - "DECLINED" : payment refunded, presence = LIVE/OFFLINE
 *  - "EXPIRED"  : ringing timed out (auto-expired)
 */
@Data
@Builder
public class TalkNowDecisionResponse {

    private Long bookingId;
    private Long mentorId;
    private Long learnerId;

    private String decision;

    private Integer durationMinutes;
    private BigDecimal amount;
    private String currency;

    /**
     * Present only when decision = "ACCEPTED".
     */
    private SessionResponse session;
}

