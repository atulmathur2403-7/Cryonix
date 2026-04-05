package com.Mentr_App.Mentr_V1.dto.chat;



import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * FIREBASE CUSTOM TOKEN RESPONSE DTO
 * ----------------------------------
 * Returned by /api/firebase/custom-token.
 */
@Data
@Builder
public class FirebaseCustomTokenResponse {

    private String firebaseUid;
    private String token;
    private Long expiresInSeconds;

    /**
     * Optional extra claims, e.g. user roles.
     */
    private Map<String, Object> claims;
}
