package com.Mentr_App.Mentr_V1.dto.mentor;



import com.Mentr_App.Mentr_V1.dto.review.ReviewResponse;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class MentorProfileResponse {
    private Long mentorId;
    private String name;
    private String profilePic;
    private String bio;
    private String expertise;
    private BigDecimal callPrice;
    private BigDecimal meetingPrice;
    private BigDecimal subscriptionPrice;
    private String socialLinks;
    private String profileVideo;
    private Integer bookingsCount;

    // Reviews
    private Double averageRating;
    private Integer reviewCount;
    private List<ReviewResponse> reviews; // ✅ include reviews in profile

    // Availability
    private List<AvailabilityPreview> availabilityPreview;

    // NEW: to render discount info on profile/booking UI
    private Integer longCallThresholdMinutes;
    private BigDecimal longCallDiscountPercent;
}

