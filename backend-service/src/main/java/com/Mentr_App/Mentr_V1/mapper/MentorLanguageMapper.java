package com.Mentr_App.Mentr_V1.mapper;


import com.Mentr_App.Mentr_V1.dto.meta.MentorLanguageItemResponse;
import com.Mentr_App.Mentr_V1.model.Language;

public final class MentorLanguageMapper {

    private MentorLanguageMapper() {}

    public static MentorLanguageItemResponse toItem(Language language) {
        return MentorLanguageItemResponse.builder()
                .name(language.getName())
                .build();
    }
}
