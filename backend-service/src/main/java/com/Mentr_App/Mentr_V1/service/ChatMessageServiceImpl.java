package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.chat.PhoneNumberPolicyResult;
import com.Mentr_App.Mentr_V1.dto.chat.SendChatMessageRequest;
import com.Mentr_App.Mentr_V1.dto.chat.SendChatMessageResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.ChatConversation;
import com.Mentr_App.Mentr_V1.repository.ChatConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.UUID;

/**
 * CHAT MESSAGE SERVICE IMPLEMENTATION
 * -----------------------------------
 * Validates message send against:
 *  - Conversation existence & enabled state
 *  - Sender membership in the conversation
 *  - Phone-number policy
 *
 * NOTE: Firestore write will be added in a later step.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageServiceImpl implements ChatMessageService {

    private final ChatConversationRepository chatConversationRepository;
    private final PhoneNumberPolicyService phoneNumberPolicyService;

    @Override
    public SendChatMessageResponse sendMessage(Long senderUserId, SendChatMessageRequest request) {
        if (request == null || request.getConversationId() == null || request.getConversationId().isBlank()) {
            throw new BookingException("Conversation id is required");
        }

        ChatConversation conversation = chatConversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new BookingException("Conversation not found"));

        if (!conversation.isEnabled()) {
            throw new BookingException("Conversation is not enabled for chat");
        }

        Long learnerUserId = conversation.getLearner() != null ? conversation.getLearner().getUserId() : null;
        Long mentorUserId = (conversation.getMentor() != null && conversation.getMentor().getUser() != null)
                ? conversation.getMentor().getUser().getUserId()
                : null;

        // Sender must be either learner or mentor
        if (!Objects.equals(senderUserId, learnerUserId) && !Objects.equals(senderUserId, mentorUserId)) {
            throw new BookingException("You are not allowed to send messages in this conversation");
        }

        // Apply phone number policy
        PhoneNumberPolicyResult policyResult = phoneNumberPolicyService.applyPolicy(
                request.getText(),
                senderUserId,
                request.getConversationId()
        );

        if (!policyResult.isAllowed()) {
            log.warn("Chat message blocked by phone number policy (senderUserId={}, conversationId={})",
                    senderUserId, request.getConversationId());
            throw new BookingException("Message blocked due to phone number policy");
        }

        String finalText = policyResult.getTransformedText() != null
                ? policyResult.getTransformedText()
                : request.getText();

        // At this stage we only acknowledge; Firestore write will be added later.
        String messageId = UUID.randomUUID().toString();

        return SendChatMessageResponse.builder()
                .messageId(messageId)
                .status("ACCEPTED")
                .finalText(finalText)
                .moderationAction(policyResult.getAction())
                .build();
    }
}

