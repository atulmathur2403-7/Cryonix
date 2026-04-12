package com.Mentr_App.Mentr_V1.service;


/**
 * BOOKING → CHAT SYNC SERVICE
 * ---------------------------
 * Keeps ChatConversation.isEnabled in sync when bookings change
 * (created, confirmed, cancelled, expired, etc.).
 *
 * Called from:
 *  - PaymentServiceImpl.handlePaymentSuccess(...)
 *  - BookingServiceImpl.updateBookingStatus(...)
 *  - BookingServiceImpl.cancelByLearner(...)
 *  - TalkNowServiceImpl.acceptTalkNow / declineTalkNow
 *  - TalkNowCleanupScheduler.cleanupTalkNowStates(...)
 */
public interface BookingChatSyncService {

    /**
     * Sync chat permission for a learner ↔ mentor pair based on latest booking state.
     *
     * @param learnerUserId learner's userId
     * @param mentorId      mentorId
     * @param trigger       optional string for logs (e.g. "PAYMENT_SUCCESS_CONFIRMED")
     * @param bookingId     booking that triggered this event (may be null)
     */
    void syncChatPermissionForPair(Long learnerUserId, Long mentorId, String trigger, Long bookingId);
}

