package com.Mentr_App.Mentr_V1.dto.booking;




import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Request DTO for creating a booking.
 *
 * - LearnerId is no longer included (resolved from JWT).
 * - Only mentorId, bookingType, and bookingTime are required.
 *
 * Example:
 * {
 *   "mentorId": 5,
 *   "bookingType": "BOOK_LATER",
 *   "bookingTime": "2025-09-20T14:00:00Z"
 * }
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull
    private Long mentorId;

    // Optional: if TALK_NOW, bookingTime is ignored
    /**
     * BACKWARD-COMPAT: original single start instant.
     * The service currently reads this field as the start.
     */

    private String bookingType; // TALK_NOW / BOOK_LATER

    private Instant bookingTime;

    @NotNull @Min(15)
    private Integer durationMinutes; // must be multiple of 15



    /**
     * NEW: explicit start of the requested slice (UTC).
     * If both startTime and bookingTime are provided, they should match.
     * (Service will continue using bookingTime until we switch over.)
     */
    private Instant startTime;

    /**
     * NEW: optional explicit end of the requested slice (UTC).
     * If provided, must equal startTime + durationMinutes.
     * If omitted, the server derives it from start + durationMinutes.
     */
    private Instant endTime;
}

