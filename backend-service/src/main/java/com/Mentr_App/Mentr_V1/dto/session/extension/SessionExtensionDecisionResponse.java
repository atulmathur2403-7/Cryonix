package com.Mentr_App.Mentr_V1.dto.session.extension;


import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SessionExtensionDecisionResponse {
    private Long extensionId;
    private Long sessionId;
    private String status;
    private Instant expiresAt;
}

