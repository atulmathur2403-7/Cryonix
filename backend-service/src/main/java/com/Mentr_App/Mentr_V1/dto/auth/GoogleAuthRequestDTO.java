package com.Mentr_App.Mentr_V1.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleAuthRequestDTO {
    @NotBlank
    private String accessToken;

    private String role; // "LEARNER" or "MENTOR" — used only for first-time signup
}
