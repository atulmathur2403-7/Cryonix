package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.user.ProfileImageDeleteResponse;
import com.Mentr_App.Mentr_V1.dto.user.ProfileImageResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserProfileImageService {

    ProfileImageResponse uploadProfileImage(Long userId, MultipartFile image, String idempotencyKey);

    ProfileImageResponse getProfileImage(Long userId);

    ProfileImageDeleteResponse deleteProfileImage(Long userId);
}
