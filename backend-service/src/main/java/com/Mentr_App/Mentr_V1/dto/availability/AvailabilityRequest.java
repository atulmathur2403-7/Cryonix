package com.Mentr_App.Mentr_V1.dto.availability;


import jakarta.validation.constraints.NotNull;
import java.time.Instant;

/**
 * Request to create an availability slot.
 * All instants should be in ISO-8601 format (UTC recommended) e.g. 2025-09-20T14:00:00Z
 */
public class AvailabilityRequest {
    @NotNull
    private Instant startTime;

    @NotNull
    private Instant endTime;

    private boolean blocked = false;

    private String recurringRule; // optional

    // getters / setters
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public boolean isBlocked() { return blocked; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }
    public String getRecurringRule() { return recurringRule; }
    public void setRecurringRule(String recurringRule) { this.recurringRule = recurringRule; }
}

