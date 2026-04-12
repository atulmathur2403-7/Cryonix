package com.Mentr_App.Mentr_V1.dto.auth;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequestDTO {
    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String username;   // NEW: public handle

    @NotBlank
    private String password;

    private String role; // "LEARNER" or "MENTOR"
}
