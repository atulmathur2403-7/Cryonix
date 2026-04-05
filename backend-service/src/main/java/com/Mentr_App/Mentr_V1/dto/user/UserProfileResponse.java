package com.Mentr_App.Mentr_V1.dto.user;


import com.Mentr_App.Mentr_V1.model.enums.Pronouns;
import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class UserProfileResponse {

    private String fullName;
    private String username;
    private String email;               // read-only
    private Pronouns pronouns;

    private String profilePhotoUrl;     // display only

    private String phoneNumber;         // E.164
    private String phoneCountryIso;
    private boolean phoneVerified;
}
