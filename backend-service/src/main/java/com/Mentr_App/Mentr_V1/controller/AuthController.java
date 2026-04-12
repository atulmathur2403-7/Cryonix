package com.Mentr_App.Mentr_V1.controller;



import com.Mentr_App.Mentr_V1.dto.auth.*;
import com.Mentr_App.Mentr_V1.service.AuthService;
import com.Mentr_App.Mentr_V1.service.GoogleOAuthService;
import com.Mentr_App.Mentr_V1.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final GoogleOAuthService googleOAuthService;

    // Sign Up (now returns message + sends OTP)
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@Valid @RequestBody SignupRequestDTO signupRequest) {
        return ResponseEntity.ok(authService.signup(signupRequest));
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<JwtResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    // Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<JwtResponseDTO> verifyOtp(@Valid @RequestBody OtpVerifyRequestDTO request) {
        return ResponseEntity.ok(authService.verifyOtp(request.getEmail(), request.getOtp()));
    }

    // Resend OTP
    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@Valid @RequestBody ResendOtpRequestDTO request) {
        authService.resendOtp(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "OTP resent successfully"));
    }

    // Google OAuth
    @PostMapping("/google")
    public ResponseEntity<JwtResponseDTO> googleAuth(@Valid @RequestBody GoogleAuthRequestDTO request) {
        return ResponseEntity.ok(googleOAuthService.authenticateWithGoogle(request.getAccessToken(), request.getRole()));
    }

    // Refresh Token
    @PostMapping("/refresh-token")
    public ResponseEntity<JwtResponseDTO> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(refreshTokenService.refreshToken(request));
    }
}
