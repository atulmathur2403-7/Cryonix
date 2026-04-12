package com.Mentr_App.Mentr_V1.dto.shorts;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ReserveMentorShortRequest {

    @NotBlank(message = "title is required")
    @Size(max = 100, message = "title max 100 characters")
    private String title;

    /**
     * YouTube limit is 5000 bytes (UTF-8) — enforced in service (bytes not chars).
     */
    private String description;

    /**
     * Optional. We validate: trim, drop blanks, dedupe case-insensitive,
     * total <= 500 chars (joined by commas).
     */
    private List<String> tags;
}
