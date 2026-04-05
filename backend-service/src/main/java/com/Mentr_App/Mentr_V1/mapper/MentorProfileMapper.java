package com.Mentr_App.Mentr_V1.mapper;



import com.Mentr_App.Mentr_V1.dto.mentor.MentorEditProfileResponse;
import com.Mentr_App.Mentr_V1.dto.shorts.MentorShortVideoItemResponse;
import com.Mentr_App.Mentr_V1.model.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public final class MentorProfileMapper {

    private MentorProfileMapper() {}

    public static MentorEditProfileResponse toEditResponse(User user, Mentor mentor, MentorProfile mp,List<MentorShortVideoItemResponse> shorts) {

        String photo = (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isBlank())
                ? user.getProfileImageUrl()
                : user.getProfilePic();

        List<String> tagNames = (mp.getTags() == null)
                ? List.of()
                : mp.getTags().stream()
                .map(MentorSkillsTag::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();

        // ✅ Languages: prefer cache (canonical + stable), fallback to relation
        List<String> languageNames;
        if (mp.getLanguagesCache() != null) {
            languageNames = Arrays.stream(mp.getLanguagesCache()).toList();
        } else if (mp.getLanguages() != null) {
            languageNames = mp.getLanguages().stream()
                    .map(Language::getName)
                    .sorted(String.CASE_INSENSITIVE_ORDER)
                    .toList();
        } else {
            languageNames = List.of();
        }

        return MentorEditProfileResponse.builder()
                // display-only
                .profilePhotoUrl(photo)
                .email(user.getEmail())

                // identity
                .pronouns(user.getPronouns())
                .fullName(user.getName())
                .username(user.getUsername())
                .dateOfBirth(user.getDateOfBirth())

                // phone
                .phoneNumber(user.getPhoneE164())
                .phoneCountryIso(user.getPhoneCountryIso())
                .phoneVerified(user.isPhoneVerified())

                // mentor profile
                .locationCountry(mp.getLocationCountry())
                .languagesSpoken(new ArrayList<>(languageNames))
                .experienceYears(mp.getExperienceYears())
                .shortBio(mp.getShortBio())
                .fullBioStory(mp.getFullBioStory())
                .showCategory(mp.isShowCategory())
                .categoryId(mp.getCategoryId())
                .tags(tagNames)

                // pricing
                .callPrice(mentor.getCallPrice())
                .meetingPrice(mentor.getMeetingPrice())
                .subscriptionPrice(mentor.getSubscriptionPrice())
                .longCallThresholdMinutes(mentor.getLongCallThresholdMinutes())
                .longCallDiscountPercent(mentor.getLongCallDiscountPercent())

                // urls
                .youtubeUrl(mp.getYoutubeUrl())
                .instagramUrl(mp.getInstagramUrl())
                .linkedinUrl(mp.getLinkedinUrl())
                .shortVideos(shorts)
                .build();
    }
}
