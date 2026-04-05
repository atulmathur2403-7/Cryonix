package com.Mentr_App.Mentr_V1.mapper;


import com.Mentr_App.Mentr_V1.dto.meta.MentorSkillTagItemResponse;
import com.Mentr_App.Mentr_V1.model.MentorSkillsTag;

public final class MentorSkillTagMapper {

    private MentorSkillTagMapper() {}

    public static MentorSkillTagItemResponse toItem(MentorSkillsTag tag) {
        return MentorSkillTagItemResponse.builder()
                .name(tag.getName())
                .build();
    }
}
