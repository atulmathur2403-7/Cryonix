package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.dto.auth.JwtResponseDTO;
import com.Mentr_App.Mentr_V1.dto.auth.LoginRequestDTO;
import com.Mentr_App.Mentr_V1.dto.auth.SignupRequestDTO;
import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.repository.*;
import com.Mentr_App.Mentr_V1.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
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
    private final WalletService walletService; // ✅ injected

    @Override
    public JwtResponseDTO signup(SignupRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        Role role = roleRepository.findByName("ROLE_" + request.getRole().toUpperCase())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .usernameEditCount(0)
                .pronouns(null)
                .dateOfBirth(null)
                .phoneE164(null)
                .phoneCountryIso(null)
                .phoneVerified(false)
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

        // ✅ Initialize wallet (for both mentors & learners)
        walletService.initializeWalletForUser(user);

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return new JwtResponseDTO(accessToken, refreshToken, "Bearer");
    }

    @Override
    public JwtResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return new JwtResponseDTO(accessToken, refreshToken, "Bearer");
    }
}
