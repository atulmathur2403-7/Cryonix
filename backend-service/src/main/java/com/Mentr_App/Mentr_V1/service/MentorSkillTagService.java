package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.meta.MentorSkillTagSearchResponse;

public interface MentorSkillTagService {
    MentorSkillTagSearchResponse searchTags(String q, Integer limit);
}
