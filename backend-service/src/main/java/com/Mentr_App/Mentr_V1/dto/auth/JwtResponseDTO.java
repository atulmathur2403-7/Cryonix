package com.Mentr_App.Mentr_V1.dto.auth;



import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponseDTO {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
}
