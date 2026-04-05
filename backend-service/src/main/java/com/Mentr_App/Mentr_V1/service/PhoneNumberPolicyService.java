package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.chat.PhoneNumberPolicyResult;

/**
 * PHONE NUMBER POLICY SERVICE
 * ---------------------------
 * Applies phone-number related moderation to chat messages.
 */
public interface PhoneNumberPolicyService {

    /**
     * Apply phone number policy to the given text.
     *
     * @param rawText        original message text
     * @param senderUserId   user who sent the message
     * @param conversationId conversation id
     */
    PhoneNumberPolicyResult applyPolicy(String rawText, Long senderUserId, String conversationId);
}

