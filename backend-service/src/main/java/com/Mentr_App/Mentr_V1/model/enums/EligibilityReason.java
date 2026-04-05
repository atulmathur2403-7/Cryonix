package com.Mentr_App.Mentr_V1.model.enums;


/**
 * CHAT ELIGIBILITY REASON
 * -----------------------
 * Describes why a learner↔mentor pair is (or is not) allowed to chat.
 */
public enum EligibilityReason {

    /**
     * At least one valid booking exists (e.g. CONFIRMED or COMPLETED).
     */
    ELIGIBLE,

    /**
     * No booking in a valid state exists between the learner and mentor.
     */
    NO_VALID_BOOKINGS,

    /**
     * Learner user record not found (should not normally happen).
     */
    LEARNER_NOT_FOUND,

    /**
     * Mentor record not found or not linked.
     */
    MENTOR_NOT_FOUND,

    /**
     * Conversation disabled due to blocked relationship or admin action.
     */
    BLOCKED,

    /**
     * Conversation record exists, but explicitly disabled.
     */
    CONVERSATION_DISABLED
}

