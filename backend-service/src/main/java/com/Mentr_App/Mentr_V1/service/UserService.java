package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.user.UserProfileResponse;
import com.Mentr_App.Mentr_V1.dto.user.UserResponseDTO;
import com.Mentr_App.Mentr_V1.dto.user.UserUpdateRequestDTO;

public interface UserService {
    UserProfileResponse getUserProfile(String email);
    UserProfileResponse updateUserProfile(String email, UserUpdateRequestDTO request);
}
