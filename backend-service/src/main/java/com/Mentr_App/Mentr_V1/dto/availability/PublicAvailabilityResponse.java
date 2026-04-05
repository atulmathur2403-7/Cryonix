package com.Mentr_App.Mentr_V1.dto.availability;


import lombok.Data;
import java.time.Instant;

/**
 * DTO for exposing mentor availability slots to learners/public.
 */
@Data
public class PublicAvailabilityResponse {
    private Long slotId;
    private Instant startTime;
    private Instant endTime;
    private boolean blocked;
}
