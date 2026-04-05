package com.Mentr_App.Mentr_V1.dto.talkNow;



import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * TALK NOW START RESPONSE
 * -----------------------
 * Returned after backend creates a Talk Now booking + PaymentIntent.
 *
 * Fields:
 *  - requestId             : alias for bookingId (Talk Now request id)
 *  - bookingId             : Booking.id with bookingType = TALK_NOW
 *  - mentorId / learnerId  : participants
 *  - durationMinutes       : chosen duration
 *  - amount / currency     : Stripe amount to charge
 *  - paymentId             : internal Payment.id
 *  - paymentClientSecret   : Stripe PaymentIntent client_secret
 *
 * Frontend:
 *  - Use paymentClientSecret in Stripe.js
 */
@Data
@Builder
public class TalkNowStartResponse {

    private Long requestId;

    private Long bookingId;
    private Long mentorId;
    private Long learnerId;

    private Integer durationMinutes;

    private BigDecimal amount;
    private String currency;

    private Long paymentId;
    private String paymentClientSecret;
}

