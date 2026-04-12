package com.Mentr_App.Mentr_V1.mapper;

import com.Mentr_App.Mentr_V1.dto.meta.PronounsItemResponse;
import com.Mentr_App.Mentr_V1.model.enums.Pronouns;

public final class PronounsMetaMapper {

    private PronounsMetaMapper() {}

    public static PronounsItemResponse toItem(Pronouns p) {
        return PronounsItemResponse.builder()
                .code(p.name())
                .label(toLabel(p))
                .build();
    }

    private static String toLabel(Pronouns p) {
        return switch (p) {
            case HE_HIM -> "He/Him";
            case SHE_HER -> "She/Her";
            case THEY_THEM -> "They/Them";
            case OTHER -> "Other";
        };
    }
}

