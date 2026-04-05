package com.Mentr_App.Mentr_V1.dto.user;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileImageDeleteResponse {
    private boolean deleted;
}

