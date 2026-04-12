package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.auth.JwtResponseDTO;
import com.Mentr_App.Mentr_V1.dto.auth.LoginRequestDTO;
import com.Mentr_App.Mentr_V1.dto.auth.SignupRequestDTO;

import java.util.Map;

public interface AuthService {
    Map<String, String> signup(SignupRequestDTO request);
    JwtResponseDTO login(LoginRequestDTO request);
    JwtResponseDTO verifyOtp(String email, String otp);
    void resendOtp(String email);
}

