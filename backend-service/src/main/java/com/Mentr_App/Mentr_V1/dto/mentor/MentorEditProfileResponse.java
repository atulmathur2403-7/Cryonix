package com.Mentr_App.Mentr_V1.dto.mentor;


import com.Mentr_App.Mentr_V1.dto.shorts.MentorShortVideoItemResponse;
import com.Mentr_App.Mentr_V1.model.enums.Pronouns;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class MentorEditProfileResponse {

    // display-only
    private String profilePhotoUrl;
    private String email;

    // identity
    private Pronouns pronouns;
    private String fullName;
    private String username;
    private LocalDate dateOfBirth;

    // phone
    private String phoneNumber;       // E.164
    private String phoneCountryIso;
    private boolean phoneVerified;

    // mentor profile
    private String locationCountry;
    private List<String> languagesSpoken;
    private Integer experienceYears;

    private String shortBio;
    private String fullBioStory;

    private Boolean showCategory;
    private String categoryId;
    private List<String> tags;

    // pricing
    private BigDecimal callPrice;
    private BigDecimal meetingPrice;
    private BigDecimal subscriptionPrice;
    private Integer longCallThresholdMinutes;
    private BigDecimal longCallDiscountPercent;

    // optional urls
    private String youtubeUrl;
    private String instagramUrl;
    private String linkedinUrl;

    private List<MentorShortVideoItemResponse> shortVideos;
}

