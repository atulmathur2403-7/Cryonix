package com.Mentr_App.Mentr_V1.model;


import com.Mentr_App.Mentr_V1.model.enums.Pronouns;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Version
    private Long version;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    // ✅ username edit limit support
    @Column(name = "username_edit_count", nullable = false)
    private int usernameEditCount;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name; // (maps to "fullName" in new DTOs)

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Pronouns pronouns;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /**
     * Backward compatibility field used across DTOs today.
     * We will store the Firebase download URL here too.
     */
    @Column(columnDefinition = "text")
    private String profilePic;

    @Column(length = 2000)
    private String bio;

    // ✅ New profile image fields (Firebase Storage)
    @Column(name = "profile_image_path", columnDefinition = "text")
    private String profileImagePath;

    @Column(name = "profile_image_url", columnDefinition = "text")
    private String profileImageUrl;

    @Column(name = "profile_image_token", columnDefinition = "text")
    private String profileImageToken;

    @Column(name = "profile_image_updated_at")
    private Instant profileImageUpdatedAt;

    // ✅ Phone fields (E.164 + ISO + verification)
    @Column(name = "phone_e164", unique = true, length = 32)
    private String phoneE164;

    @Column(name = "phone_country_iso", length = 2)
    private String phoneCountryIso;

    @Column(name = "phone_verified", nullable = false)
    private boolean phoneVerified;

    @Column(name = "email_verified", nullable = false, columnDefinition = "boolean default false")
    private boolean emailVerified;

    @Column(name = "auth_provider", length = 20, columnDefinition = "varchar(20) default 'LOCAL'")
    private String authProvider; // LOCAL, GOOGLE

    // Optional OTP mode A staging fields (kept nullable)
    @Column(name = "pending_phone_e164", length = 32)
    private String pendingPhoneE164;

    @Column(name = "pending_phone_country_iso", length = 2)
    private String pendingPhoneCountryIso;

    @Column(name = "otp_code_hash", length = 200)
    private String otpCodeHash;

    @Column(name = "otp_expires_at")
    private Instant otpExpiresAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
        // defaults
        // (builder might not set these)
        if (usernameEditCount < 0) usernameEditCount = 0;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
