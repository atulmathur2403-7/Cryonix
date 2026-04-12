package com.Mentr_App.Mentr_V1.dto.mentor;



import lombok.Data;

import java.math.BigDecimal;

/**
 * Lightweight DTO for mentor search/trending results.
 */
@Data
public class MentorSearchResponse {
    private Long mentorId;
    private String name;
    private String profilePic;
    private String expertiseSummary;
    private Integer bookingsCount;
    private BigDecimal callPrice;

    // ✅ New fields
    private Double averageRating;
    private Integer reviewCount;
}
