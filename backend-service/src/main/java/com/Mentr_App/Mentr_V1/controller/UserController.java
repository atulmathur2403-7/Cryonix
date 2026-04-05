package com.Mentr_App.Mentr_V1.controller;



import com.Mentr_App.Mentr_V1.dto.user.ProfileImageDeleteResponse;
import com.Mentr_App.Mentr_V1.dto.user.ProfileImageResponse;
import com.Mentr_App.Mentr_V1.dto.user.UserProfileResponse;
import com.Mentr_App.Mentr_V1.dto.user.UserUpdateRequestDTO;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.UserProfileImageService;
import com.Mentr_App.Mentr_V1.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserProfileImageService userProfileImageService;

    // Get own profile (new response contract)
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserProfile(userDetails.getUsername()));
    }

    // Update own profile (keep minimal for now; photo still blocked)
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserUpdateRequestDTO request) {
        return ResponseEntity.ok(userService.updateUserProfile(userDetails.getUsername(), request));
    }

    @PostMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileImageResponse> uploadProfileImage(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestPart("image") MultipartFile image,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        ProfileImageResponse resp = userProfileImageService.uploadProfileImage(currentUser.getId(), image, idempotencyKey);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me/profile-image")
    public ResponseEntity<ProfileImageResponse> getProfileImage(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(userProfileImageService.getProfileImage(currentUser.getId()));
    }

    @DeleteMapping("/me/profile-image")
    public ResponseEntity<ProfileImageDeleteResponse> deleteProfileImage(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(userProfileImageService.deleteProfileImage(currentUser.getId()));
    }
}
