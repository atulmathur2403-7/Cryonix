package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.dto.auth.JwtResponseDTO;
import com.Mentr_App.Mentr_V1.exception.ApiException;
import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.repository.*;
import com.Mentr_App.Mentr_V1.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MentorRepository mentorRepository;
    private final LearnerRepository learnerRepository;
    private final WalletService walletService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    public JwtResponseDTO authenticateWithGoogle(String accessToken, String role) {
        JsonNode userInfo = fetchGoogleUserInfo(accessToken);

        String email = userInfo.get("email").asText();
        String name = userInfo.has("name") ? userInfo.get("name").asText() : null;
        String picture = userInfo.has("picture") ? userInfo.get("picture").asText() : null;
        boolean emailVerified = userInfo.has("email_verified") && userInfo.get("email_verified").asBoolean();

        if (!emailVerified) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "GOOGLE_EMAIL_NOT_VERIFIED", "Google account email is not verified");
        }

        var existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (user.getProfilePic() == null && picture != null) {
                user.setProfilePic(picture);
                userRepository.save(user);
            }
            return generateTokens(user);
        }

        String effectiveRole = (role != null && !role.isBlank()) ? role : "LEARNER";
        Role userRole = roleRepository.findByName("ROLE_" + effectiveRole.toUpperCase())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "ROLE_NOT_FOUND", "Role not found"));

        String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter++;
        }

        User user = User.builder()
                .name(name != null ? name : username)
                .username(username)
                .usernameEditCount(0)
                .email(email)
                .passwordHash("")
                .profilePic(picture)
                .phoneVerified(false)
                .emailVerified(true)
                .authProvider("GOOGLE")
                .roles(Set.of(userRole))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        userRepository.save(user);

        if ("LEARNER".equalsIgnoreCase(effectiveRole)) {
            Learner learner = Learner.builder()
                    .user(user)
                    .signupDate(Instant.now())
                    .build();
            learnerRepository.save(learner);
        } else if ("MENTOR".equalsIgnoreCase(effectiveRole)) {
            Mentor mentor = Mentor.builder()
                    .user(user)
                    .expertise(null)
                    .callPrice(BigDecimal.ZERO)
                    .meetingPrice(BigDecimal.ZERO)
                    .subscriptionPrice(BigDecimal.ZERO)
                    .bookingsCount(0)
                    .longCallThresholdMinutes(60)
                    .build();
            mentorRepository.save(mentor);
        }

        walletService.initializeWalletForUser(user);

        return generateTokens(user);
    }

    private JsonNode fetchGoogleUserInfo(String accessToken) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Google userinfo API returned status {}: {}", response.statusCode(), response.body());
                throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_GOOGLE_TOKEN", "Invalid Google access token");
            }

            return objectMapper.readTree(response.body());
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch Google user info", e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "GOOGLE_AUTH_FAILED", "Google authentication failed");
        }
    }

    private JwtResponseDTO generateTokens(User user) {
        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        return new JwtResponseDTO(accessToken, refreshToken, "Bearer");
    }
}
