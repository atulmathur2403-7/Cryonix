package com.Mentr_App.Mentr_V1.dto.user;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class UserUpdateRequestDTO {
    @Size(max = 100)
    private String fullName;

    @Size(max = 2000)
    private String bio;
}

