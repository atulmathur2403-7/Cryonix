package com.Mentr_App.Mentr_V1.dto.chat;



import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * SEND CHAT MESSAGE REQUEST DTO
 * -----------------------------
 * Used by POST /api/chat/messages.
 */
@Data
public class SendChatMessageRequest {

    @NotBlank
    private String conversationId;

    /**
     * Message type for extensibility.
     * For now, expected value: "TEXT".
     */
    @NotBlank
    private String type;

    /**
     * Text content of the message (for TEXT type).
     */
    @NotBlank
    private String text;
}

