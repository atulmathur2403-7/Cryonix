package com.Mentr_App.Mentr_V1.config;


import com.Mentr_App.Mentr_V1.model.enums.PhoneNumberPolicyMode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * CHAT PROPERTIES
 * ---------------
 * External configuration for chat-related behaviour.
 *
 * app.chat.phone-number-policy-mode:
 *   - BLOCK (default) → message rejected if phone detected
 *   - MASK           → phone numbers are masked in text
 */
@Component
@ConfigurationProperties(prefix = "app.chat")
@Getter
@Setter
public class ChatProperties {

    /**
     * How to treat phone numbers in chat.
     * Default: BLOCK.
     */
    private PhoneNumberPolicyMode phoneNumberPolicyMode = PhoneNumberPolicyMode.BLOCK;
}

