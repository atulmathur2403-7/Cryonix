package com.Mentr_App.Mentr_V1.dto.session;


import com.Mentr_App.Mentr_V1.model.enums.SessionStatus;
import java.time.Instant;

public class SessionResponse {
    private Long sessionId;
    private Long bookingId;

    // Mentor info
    private Long mentorId;
    private String mentorName;

    // Learner info
    private Long learnerId;
    private String learnerName;

    private Instant startTime;
    private Instant endTime;
    private SessionStatus status;
    private String meetingLink;
    private String recordingLink;

    // --- Getters & Setters ---
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public Long getLearnerId() { return learnerId; }
    public void setLearnerId(Long learnerId) { this.learnerId = learnerId; }

    public String getLearnerName() { return learnerName; }
    public void setLearnerName(String learnerName) { this.learnerName = learnerName; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getRecordingLink() { return recordingLink; }
    public void setRecordingLink(String recordingLink) { this.recordingLink = recordingLink; }
}
