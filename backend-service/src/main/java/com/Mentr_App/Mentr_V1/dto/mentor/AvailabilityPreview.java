package com.Mentr_App.Mentr_V1.dto.mentor;


import java.time.Instant;

/**
 * Simple DTO for exposing mentor availability preview
 * inside MentorProfileResponse.
 */
public class AvailabilityPreview {
    private Instant startTime;
    private Instant endTime;

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
}

