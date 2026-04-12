package com.Mentr_App.Mentr_V1.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Mentor availability slot represents a time-window when the mentor accepts bookings.
 * - startTime/endTime are stored as UTC instants (timestamptz).
 * - blocked=true can be used to temporarily block a slot (e.g. holiday).
 * - recurringRule is optional for future recurring availability support (RFC RRULE string).
 */
@Entity
@Table(name = "availability_slots",
        indexes = {@Index(name = "idx_availability_mentor_start_end", columnList = "mentor_id, start_time, end_time")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many slots belong to a Mentor
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentor_id", referencedColumnName = "mentorId")
    private Mentor mentor;


    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Column(name = "is_blocked", nullable = false)
    private boolean blocked = false;

    @Column(name = "recurring_rule")
    private String recurringRule; // optional RFC RRULE / future support

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() { this.updatedAt = Instant.now(); }

    /** Convenience: does this slot fully cover [start, end)? */
    @Transient
    public boolean covers(Instant start, Instant end) {
        return !this.blocked && !this.startTime.isAfter(start) && !this.endTime.isBefore(end);
    }
}
