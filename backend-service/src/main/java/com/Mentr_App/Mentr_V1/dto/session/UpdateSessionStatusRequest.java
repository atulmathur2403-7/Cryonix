package com.Mentr_App.Mentr_V1.dto.session;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for updating session status.
 * - ActorId removed, since mentor/learner identity is resolved via JWT.
 */
public class UpdateSessionStatusRequest {

    @NotBlank
    private String newStatus; // CONFIRMED / COMPLETED / CANCELLED

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
}
