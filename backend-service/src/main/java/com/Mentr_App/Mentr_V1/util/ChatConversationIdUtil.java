package com.Mentr_App.Mentr_V1.util;


public final class ChatConversationIdUtil {

    private ChatConversationIdUtil() {}

    /**
     * Deterministic ID for learner ↔ mentor pair.
     * Example: "m5_u12" (mentor 5, learner 12).
     */
    public static String buildConversationId(Long learnerUserId, Long mentorId) {
        if (learnerUserId == null || mentorId == null) {
            throw new IllegalArgumentException("learnerUserId and mentorId cannot be null");
        }
        return "m" + mentorId + "_u" + learnerUserId;
    }
}

