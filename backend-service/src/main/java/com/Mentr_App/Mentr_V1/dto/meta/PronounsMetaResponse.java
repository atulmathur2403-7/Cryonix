package com.Mentr_App.Mentr_V1.dto.meta;


import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PronounsMetaResponse {
    private List<PronounsItemResponse> items;
}
