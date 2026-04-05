package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.auth.JwtResponseDTO;
import com.Mentr_App.Mentr_V1.dto.auth.LoginRequestDTO;
import com.Mentr_App.Mentr_V1.dto.auth.SignupRequestDTO;

public interface AuthService {
    JwtResponseDTO signup(SignupRequestDTO request);
    JwtResponseDTO login(LoginRequestDTO request);
}

