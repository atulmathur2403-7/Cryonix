package com.Mentr_App.Mentr_V1.dto.booking;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * BOOKING RESPONSE DTO
 * ----------------------------------------------------------
 * Represents data returned to frontend after creating or fetching a booking.
 *
 * Product Flow alignment:
 *  - After booking creation → includes Stripe PaymentIntent details.
 *  - Used in learner & mentor dashboards.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    // ids & participants...
    private Long bookingId;
    private Long mentorId;
    private String mentorName;
    private Long learnerId;
    private String learnerName;

    // booking details
    private String status;
    private String bookingType;
    private Instant bookingTime;
    private Integer durationMinutes;   // NEW

    // payment
    private Long paymentId;
    private String clientSecret;
    private BigDecimal amount;
    private String currency;

    // pricing breakdown (NEW, optional but very helpful for UI)
    private Integer unitMinutes;                 // 15
    private BigDecimal unitPrice;                // mentor.callPrice
    private BigDecimal subtotal;                 // unitPrice * (duration/15)
    private BigDecimal longCallDiscountPercent;  // if applied
    private BigDecimal discountAmount;           // computed
    private BigDecimal totalAmount;              // = subtotal - discountAmount
    // NEW: amount refunded to the learner for this booking (if any)
    private BigDecimal refundedAmount;

    /** NEW: explicit start/end of the booked slice (UTC) */
    private Instant startTime;
    private Instant endTime;
}
