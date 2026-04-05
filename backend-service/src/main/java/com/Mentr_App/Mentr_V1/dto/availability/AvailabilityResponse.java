package com.Mentr_App.Mentr_V1.dto.availability;


import java.time.Instant;

public class AvailabilityResponse {
    private Long id;
    private Instant startTime;
    private Instant endTime;
    private boolean blocked;
    private String recurringRule;

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public boolean isBlocked() { return blocked; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }
    public String getRecurringRule() { return recurringRule; }
    public void setRecurringRule(String recurringRule) { this.recurringRule = recurringRule; }
}
