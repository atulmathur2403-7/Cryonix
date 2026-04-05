package com.Mentr_App.Mentr_V1.dto.session;


import java.time.Instant;

public class SessionRequest {
    private Long mentorId;
    private Long learnerId;
    private Instant scheduledAt; // ignored for talkNow=true
    private Integer durationMinutes = 30;
    private boolean talkNow = false;

    // getters / setters

    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public boolean isTalkNow() { return talkNow; }
    public void setTalkNow(boolean talkNow) { this.talkNow = talkNow; }
}

