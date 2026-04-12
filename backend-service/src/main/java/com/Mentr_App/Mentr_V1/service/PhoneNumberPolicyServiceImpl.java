package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.config.ChatProperties;
import com.Mentr_App.Mentr_V1.dto.chat.PhoneNumberPolicyResult;
import com.Mentr_App.Mentr_V1.model.enums.PhoneNumberPolicyMode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * PHONE NUMBER POLICY SERVICE IMPLEMENTATION
 * -----------------------------------------
 * Simple regex-based detector for phone numbers.
 *
 * - In BLOCK mode:
 *      • If phone detected → allowed=false, action="BLOCKED"
 * - In MASK mode:
 *      • If phone detected → digits masked, allowed=true, action="MASKED"
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PhoneNumberPolicyServiceImpl implements PhoneNumberPolicyService {

    private final ChatProperties chatProperties;

    // Basic patterns: generic 10+ digit sequences + Indian-style 10-digit starting 6-9.
    private static final Pattern GENERIC_LONG_DIGITS = Pattern.compile("\\d{10,}");
    private static final Pattern INDIAN_10_DIGITS = Pattern.compile("\\b[6-9]\\d{9}\\b");

    @Override
    public PhoneNumberPolicyResult applyPolicy(String rawText, Long senderUserId, String conversationId) {
        if (rawText == null || rawText.isBlank()) {
            return PhoneNumberPolicyResult.builder()
                    .allowed(true)
                    .transformedText(rawText)
                    .action("NONE")
                    .reason(null)
                    .build();
        }

        boolean hasPhone = containsPhoneNumber(rawText);
        if (!hasPhone) {
            return PhoneNumberPolicyResult.builder()
                    .allowed(true)
                    .transformedText(rawText)
                    .action("NONE")
                    .reason(null)
                    .build();
        }

        PhoneNumberPolicyMode mode = chatProperties.getPhoneNumberPolicyMode();
        log.info("PhoneNumberPolicy: detected phone number (mode={}, senderUserId={}, conversationId={})",
                mode, senderUserId, conversationId);

        if (mode == PhoneNumberPolicyMode.BLOCK) {
            return PhoneNumberPolicyResult.builder()
                    .allowed(false)
                    .transformedText(null)
                    .action("BLOCKED")
                    .reason("PHONE_NUMBER_DETECTED")
                    .build();
        }

        // MASK mode: replace digits with '*'
        String masked = rawText.replaceAll("\\d", "*");
        return PhoneNumberPolicyResult.builder()
                .allowed(true)
                .transformedText(masked)
                .action("MASKED")
                .reason("PHONE_NUMBER_DETECTED")
                .build();
    }

    private boolean containsPhoneNumber(String text) {
        Matcher m1 = GENERIC_LONG_DIGITS.matcher(text);
        if (m1.find()) return true;
        Matcher m2 = INDIAN_10_DIGITS.matcher(text);
        return m2.find();
    }
}

