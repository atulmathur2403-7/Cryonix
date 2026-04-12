package com.Mentr_App.Mentr_V1.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "mentors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mentorId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 2000)
    private String expertise;

    @Lob
    private String calendarAvailability;

    @Column(nullable = false)
    private BigDecimal callPrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal meetingPrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal subscriptionPrice = BigDecimal.ZERO;

    @Column(length = 1000)
    private String socialLinks;

    private String profileVideo;

    @Column(name = "bookings_count", nullable = false)
    private Integer bookingsCount = 0;

    /**
     * Optional: if a call’s duration >= this threshold (minutes),
     * apply longCallDiscountPercent to the subtotal.
     * Default threshold = 60 minutes.
     */
    @Column(name = "long_call_threshold_minutes", nullable = false)
    private Integer longCallThresholdMinutes = 60;

    /**
     * Discount % applied when duration >= threshold.
     * Example: 10.00 means 10% off.
     */
    @Column(name = "long_call_discount_percent", precision = 5, scale = 2)
    private BigDecimal longCallDiscountPercent;

}
