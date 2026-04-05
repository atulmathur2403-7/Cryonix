package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.dto.mentor.*;
import com.Mentr_App.Mentr_V1.model.enums.Pronouns;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MentorService {
    Page<MentorSearchResponse> searchMentors(String q, List<String> skills, List<String> languages, Pronouns pronouns, String sort, int page, int size);
    MentorProfileResponse getMentorProfile(Long mentorId);
    List<MentorSearchResponse> getTrendingMentors(int limit);
    RatingsSummaryResponse getRatingsSummary(Long mentorId);

    // ✅ new edit-screen endpoint
    MentorEditProfileResponse getMyMentorProfile(Long userId);

    // ✅ replace update contract (now full payload)
    MentorEditProfileResponse updateMentorProfile(Long userId, UpdateMentorProfileRequest request);
}
