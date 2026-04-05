package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.dto.chat.ChatEligibilityResponse;

/**
 * CHAT ELIGIBILITY SERVICE
 * ------------------------
 * Single source of truth for whether a learner and mentor
 * are allowed to chat (based on bookings, blocks, etc.).
 */
public interface ChatEligibilityService {

    /**
     * Check whether learner ↔ mentor pair is allowed to chat.
     *
     * Rules:
     *  - Learner & Mentor must exist.
     *  - ChatConversation not hard-blocked.
     *  - At least one booking exists with status in [CONFIRMED, COMPLETED].
     */
    ChatEligibilityResponse checkEligibility(Long learnerUserId, Long mentorId);
}

