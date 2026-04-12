package com.Mentr_App.Mentr_V1.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResendOtpRequestDTO {
    @Email
    @NotBlank
    private String email;
}
