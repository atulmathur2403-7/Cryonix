package com.Mentr_App.Mentr_V1.dto.booking;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CancelBookingRequest {
    @NotNull
    private RefundDestination refundDestination; // WALLET or ORIGINAL_PAYMENT

    private String reason; // optional user message
}
