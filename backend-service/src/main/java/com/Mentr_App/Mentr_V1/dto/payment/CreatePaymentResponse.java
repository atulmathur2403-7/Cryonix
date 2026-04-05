package com.Mentr_App.Mentr_V1.dto.payment;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO returned by PaymentService.createPaymentForBooking(...)
 * Contains the minimal data the frontend needs to complete a Stripe payment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * Local DB Payment id (payments.id)
     */
    private Long paymentId;

    /**
     * Stripe PaymentIntent client_secret — used by Stripe.js on frontend
     */
    private String clientSecret;

    /**
     * Amount in main currency units (e.g., 500.00)
     */
    private BigDecimal amount;

    /**
     * Currency code (e.g., "inr", "usd")
     */
    private String currency;
}

