package com.Mentr_App.Mentr_V1.service;




import com.Mentr_App.Mentr_V1.dto.user.UserProfileResponse;
import com.Mentr_App.Mentr_V1.dto.user.UserUpdateRequestDTO;
import com.Mentr_App.Mentr_V1.exception.ApiException;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        return toMeResponse(user);
    }

    @Override
    public UserProfileResponse updateUserProfile(String email, UserUpdateRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setName(request.getFullName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        userRepository.save(user);
        return toMeResponse(user);
    }

    private UserProfileResponse toMeResponse(User user) {
        String photo = (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isBlank())
                ? user.getProfileImageUrl()
                : user.getProfilePic();

        return UserProfileResponse.builder()
                .fullName(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .pronouns(user.getPronouns())
                .profilePhotoUrl(photo)
                .phoneNumber(user.getPhoneE164())
                .phoneCountryIso(user.getPhoneCountryIso())
                .phoneVerified(user.isPhoneVerified())
                .build();
    }
}
