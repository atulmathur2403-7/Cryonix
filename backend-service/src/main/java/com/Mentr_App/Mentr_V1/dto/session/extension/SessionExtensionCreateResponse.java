package com.Mentr_App.Mentr_V1.dto.session.extension;


import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SessionExtensionCreateResponse {
    private Long extensionId;
    private Long sessionId;
    private String type;
    private String status;
    private Integer minutes;
    private Instant expiresAt;
}
