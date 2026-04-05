package com.Mentr_App.Mentr_V1.controller;



import com.Mentr_App.Mentr_V1.dto.auth.JwtResponseDTO;
import com.Mentr_App.Mentr_V1.dto.auth.LoginRequestDTO;
import com.Mentr_App.Mentr_V1.dto.auth.RefreshTokenRequestDTO;
import com.Mentr_App.Mentr_V1.dto.auth.SignupRequestDTO;
import com.Mentr_App.Mentr_V1.service.AuthService;
import com.Mentr_App.Mentr_V1.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    // Sign Up
    @PostMapping("/signup")
    public ResponseEntity<JwtResponseDTO> signup(@Valid @RequestBody SignupRequestDTO signupRequest) {
        return ResponseEntity.ok(authService.signup(signupRequest));
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<JwtResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    // Refresh Token
    @PostMapping("/refresh-token")
    public ResponseEntity<JwtResponseDTO> refreshToken(@Valid @RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(refreshTokenService.refreshToken(request));
    }
}
