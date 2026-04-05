package com.Mentr_App.Mentr_V1.dto.user;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String role;
    private String profilePic;
    private String bio;
}
