package com.Mentr_App.Mentr_V1.dto.shorts;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeleteMentorShortResponse {
    private boolean deleted;
}
