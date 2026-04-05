package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.auth.JwtResponseDTO;
import com.Mentr_App.Mentr_V1.dto.auth.RefreshTokenRequestDTO;
import com.Mentr_App.Mentr_V1.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public JwtResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        String email = jwtTokenProvider.validateRefreshTokenAndGetEmail(request.getRefreshToken());
        String accessToken = jwtTokenProvider.generateToken(email);
        String refreshToken = jwtTokenProvider.generateRefreshToken(email);

        return new JwtResponseDTO(accessToken, refreshToken, "Bearer");
    }
}
