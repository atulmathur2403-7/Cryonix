package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.auth.JwtResponseDTO;
import com.Mentr_App.Mentr_V1.dto.auth.RefreshTokenRequestDTO;

public interface RefreshTokenService {
    JwtResponseDTO refreshToken(RefreshTokenRequestDTO request);
}
