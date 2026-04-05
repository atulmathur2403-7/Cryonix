package com.Mentr_App.Mentr_V1.dto.session.extension;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CreateExtensionPaymentResponse {
    private Long extensionId;
    private String stripePaymentIntentId;
    private String clientSecret;
    private BigDecimal amount;
    private String currency;
    private Integer minutes;
}

