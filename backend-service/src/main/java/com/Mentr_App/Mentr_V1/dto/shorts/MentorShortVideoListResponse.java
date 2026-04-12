package com.Mentr_App.Mentr_V1.dto.shorts;


import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MentorShortVideoListResponse {
    private List<MentorShortVideoItemResponse> items;
}

