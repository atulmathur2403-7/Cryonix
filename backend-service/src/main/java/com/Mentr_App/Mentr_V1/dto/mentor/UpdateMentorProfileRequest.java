package com.Mentr_App.Mentr_V1.dto.mentor;

import com.Mentr_App.Mentr_V1.model.enums.Pronouns;
import com.Mentr_App.Mentr_V1.validation.ValidPhoneNumber;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;



@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ValidPhoneNumber(countryField = "phoneCountryIso", numberField = "phoneRaw")
public class UpdateMentorProfileRequest {

    @NotNull
    private Pronouns pronouns;

    @NotBlank
    private String fullName;

    @NotBlank
    private String username;

    @NotNull
    private LocalDate dateOfBirth;

    // phone input accepted from UI
    @NotBlank
    private String phoneRaw;

    @NotBlank
    private String phoneCountryIso;

    @NotBlank
    private String locationCountry;

    @NotEmpty
    private List<@NotBlank String> languagesSpoken;

    @NotNull
    @Min(0)
    private Integer experienceYears;

    @NotBlank
    @Size(max = 300)
    private String shortBio;

    @NotBlank
    private String fullBioStory;

    @NotNull
    private Boolean showCategory;

    private String categoryId;

    @NotEmpty
    private List<@NotBlank String> tags;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal callPrice;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal meetingPrice;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal subscriptionPrice;

    // 🔽 NEW: Long-call discount configuration (both optional)
    @Min(value = 15, message = "Long-call threshold must be at least 15 minutes")
    private Integer longCallThresholdMinutes;     // e.g., 60

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount must be ≥ 0%")
    @DecimalMax(value = "100.0", inclusive = true, message = "Discount must be ≤ 100%")
    private BigDecimal longCallDiscountPercent;   // e.g., 10.00


    // Optional URLs: "" -> null in service
    private String youtubeUrl;
    private String instagramUrl;
    private String linkedinUrl;
}
