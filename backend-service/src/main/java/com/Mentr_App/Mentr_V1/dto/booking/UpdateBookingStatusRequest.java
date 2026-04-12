package com.Mentr_App.Mentr_V1.dto.booking;


import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating booking status.
 *
 * - ActorId is no longer included (resolved from JWT).
 * - Mentor must be authenticated and is resolved via JWT.
 *
 * Example:
 * {
 *   "newStatus": "CONFIRMED"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingStatusRequest {

    @NotBlank
    private String newStatus; // PENDING / CONFIRMED / CANCELLED / ACCEPTED / DENIED / WAITING_FOR_MENTOR_APPROVAL

}
