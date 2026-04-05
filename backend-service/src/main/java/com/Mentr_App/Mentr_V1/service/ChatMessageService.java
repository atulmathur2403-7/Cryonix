package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.chat.SendChatMessageRequest;
import com.Mentr_App.Mentr_V1.dto.chat.SendChatMessageResponse;

/**
 * CHAT MESSAGE SERVICE
 * --------------------
 * Backend entrypoint for sending chat messages.
 * At this stage:
 *  - validates conversation + membership + phone policy
 *  - DOES NOT YET write to Firebase (prerequisite layer only)
 */
public interface ChatMessageService {

    SendChatMessageResponse sendMessage(Long senderUserId, SendChatMessageRequest request);
}

