package com.Mentr_App.Mentr_V1.dto.session.extension;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class SessionExtensionActiveResponse {
    private Long extensionId;
    private Long sessionId;
    private String type;
    private String status;

    private Integer minutes;
    private BigDecimal amount;
    private String currency;

    private Long initiatedByUserId;
    private Instant expiresAt;

    private Instant sessionEndTime;
    private Long remainingSeconds;
}

