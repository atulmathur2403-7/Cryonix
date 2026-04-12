package com.Mentr_App.Mentr_V1.dto.chat;



import lombok.Builder;
import lombok.Data;

/**
 * PHONE NUMBER POLICY RESULT DTO
 * ------------------------------
 * Internal DTO used by PhoneNumberPolicyService.
 */
@Data
@Builder
public class PhoneNumberPolicyResult {

    /**
     * Whether the message is allowed to proceed.
     */
    private boolean allowed;

    /**
     * Final text after masking (if any).
     * If action = BLOCKED, this is usually null.
     */
    private String transformedText;

    /**
     * Moderation action performed:
     *  - "NONE"
     *  - "MASKED"
     *  - "BLOCKED"
     */
    private String action;

    /**
     * Optional human-readable reason (e.g. "PHONE_NUMBER_DETECTED").
     */
    private String reason;
}

