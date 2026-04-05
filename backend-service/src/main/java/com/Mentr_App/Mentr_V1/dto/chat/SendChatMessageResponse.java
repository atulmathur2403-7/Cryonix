package com.Mentr_App.Mentr_V1.dto.chat;



import lombok.Builder;
import lombok.Data;

/**
 * SEND CHAT MESSAGE RESPONSE DTO
 * ------------------------------
 * Backend acknowledgement for text messages.
 */
@Data
@Builder
public class SendChatMessageResponse {

    private String messageId;
    private String status;            // "ACCEPTED" or "REJECTED"
    private String finalText;         // text after masking
    private String moderationAction;  // "NONE" | "MASKED" | "BLOCKED"
}

