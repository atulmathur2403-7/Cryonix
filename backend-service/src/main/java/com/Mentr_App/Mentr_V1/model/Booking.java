package com.Mentr_App.Mentr_V1.model;




import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "learner_id")
    private User learner;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private Mentor mentor;

    /**
     * Legacy single-point time. Kept for backward-compat, equals startTime for BOOK_LATER.
     * NOTE: New logic relies on [startTime, endTime).
     */
    @Column(name = "booking_time", nullable = false)
    private Instant bookingTime;

    /** Start of the booked slice (UTC). */
    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    /** End of the booked slice (UTC). */
    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Column(name = "status", nullable = false)
    private String status; // PENDING_PAYMENT, CONFIRMED, CANCELLED, ...

    @Column(name = "booking_type", nullable = false)
    private String bookingType; // TALK_NOW, BOOK_LATER

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;  // e.g. 15, 30, 45, 60, ...

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // ✅ Bidirectional One-to-One: Booking ↔ Payment
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;

    // ✅ Optional denormalized metadata (for quick reads / UI convenience)
    @Column(name = "client_secret")
    private String clientSecret;

    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 10)
    private String currency;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
