package com.Mentr_App.Mentr_V1.dto.meta;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PronounsItemResponse {
    private String code;
    private String label;
}

