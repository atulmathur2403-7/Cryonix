package com.Mentr_App.Mentr_V1.service;




import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowActiveRequestResponse;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowDecisionResponse;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowStartRequest;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowStartResponse;
import com.Mentr_App.Mentr_V1.model.User;

/**
 * TALK NOW SERVICE
 * ----------------
 * Orchestrates full Talk Now lifecycle:
 *  - startTalkNow(...)           : learner initiates payment flow
 *  - getActiveRingingForMentor() : mentor polls for RINGING popup
 *  - acceptTalkNow(...)          : mentor accepts ringing request
 *  - declineTalkNow(...)         : mentor declines ringing request
 *
 * Implementation uses:
 *  - Booking as the Talk Now request record (bookingType = TALK_NOW)
 *  - PaymentService + Stripe webhooks as source-of-truth for payments
 *  - MentorPresence as "lock" for choosing the winner.
 */
public interface TalkNowService {

    TalkNowStartResponse startTalkNow(User learner, TalkNowStartRequest request);

    TalkNowActiveRequestResponse getActiveRingingForMentor(Long mentorUserId);

    TalkNowDecisionResponse acceptTalkNow(Long mentorUserId, Long bookingId);

    TalkNowDecisionResponse declineTalkNow(Long mentorUserId, Long bookingId);
}

