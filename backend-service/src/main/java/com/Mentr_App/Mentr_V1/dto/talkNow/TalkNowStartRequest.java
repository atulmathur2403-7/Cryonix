package com.Mentr_App.Mentr_V1.dto.talkNow;



import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * TALK NOW START REQUEST
 * ----------------------
 * Learner starts a Talk Now attempt for a LIVE mentor.
 *
 * Fields:
 *  - mentorId         : target mentor
 *  - durationMinutes  : 15 / 30 / 60... (must be ≥ 15)
 *
 * Product Flow:
 *  - POST /api/talk-now/start
 *  - Delegates to TalkNowService.startTalkNow(...)
 */
@Data
public class TalkNowStartRequest {

    @NotNull
    private Long mentorId;

    @NotNull
    @Min(15)
    private Integer durationMinutes;
}

