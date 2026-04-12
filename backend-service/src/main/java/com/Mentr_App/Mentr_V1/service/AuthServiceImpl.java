package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.dto.auth.JwtResponseDTO;
import com.Mentr_App.Mentr_V1.dto.auth.LoginRequestDTO;
import com.Mentr_App.Mentr_V1.dto.auth.SignupRequestDTO;
import com.Mentr_App.Mentr_V1.exception.ApiException;
import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.repository.*;
import com.Mentr_App.Mentr_V1.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final MentorRepository mentorRepository;
    private final LearnerRepository learnerRepository;
    private final WalletService walletService;
    private final OtpService otpService;

    @Override
    public Map<String, String> signup(SignupRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_EXISTS", "Email already exists");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException(HttpStatus.CONFLICT, "USERNAME_TAKEN", "Username already taken");
        }

        Role role = roleRepository.findByName("ROLE_" + request.getRole().toUpperCase())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "ROLE_NOT_FOUND", "Role not found"));

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .usernameEditCount(0)
                .pronouns(null)
                .dateOfBirth(null)
                .phoneE164(null)
                .phoneCountryIso(null)
                .phoneVerified(false)
                .emailVerified(false)
                .authProvider("LOCAL")
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(role))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        userRepository.save(user);

        if ("LEARNER".equalsIgnoreCase(request.getRole())) {
            Learner learner = Learner.builder()
                    .user(user)
                    .signupDate(Instant.now())
                    .preferences(null)
                    .build();
            learnerRepository.save(learner);
        } else if ("MENTOR".equalsIgnoreCase(request.getRole())) {
            Mentor mentor = Mentor.builder()
                    .user(user)
                    .expertise(null)
                    .calendarAvailability(null)
                    .callPrice(BigDecimal.ZERO)
                    .meetingPrice(BigDecimal.ZERO)
                    .subscriptionPrice(BigDecimal.ZERO)
                    .socialLinks(null)
                    .profileVideo(null)
                    .bookingsCount(0)
                    .longCallDiscountPercent(null)
                    .longCallThresholdMinutes(60)
                    .build();
            mentorRepository.save(mentor);
        }

        walletService.initializeWalletForUser(user);

        // Send OTP for email verification
        otpService.generateAndSendOtp(user);

        return Map.of(
                "message", "Account created. Please verify your email.",
                "email", user.getEmail()
        );
    }

    @Override
    public JwtResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password"));

        if ("GOOGLE".equals(user.getAuthProvider())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "GOOGLE_AUTH_REQUIRED", "This account uses Google Sign-In. Please use the Google button to log in.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            // Resend OTP and tell the frontend to show OTP screen
            otpService.generateAndSendOtp(user);
            throw new ApiException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED", "EMAIL_NOT_VERIFIED");
        }

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return new JwtResponseDTO(accessToken, refreshToken, "Bearer");
    }

    @Override
    public JwtResponseDTO verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        if (!otpService.verifyOtp(user, otp)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_OTP", "Invalid or expired OTP");
        }

        user.setEmailVerified(true);
        otpService.clearOtp(user);

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return new JwtResponseDTO(accessToken, refreshToken, "Bearer");
    }

    @Override
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        if (user.isEmailVerified()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMAIL_ALREADY_VERIFIED", "Email is already verified");
        }

        otpService.generateAndSendOtp(user);
    }
}
