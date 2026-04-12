package com.Mentr_App.Mentr_V1.dto.review;


import jakarta.validation.constraints.*;

import lombok.Data;

@Data
public class ReviewRequest {
    @Min(1) @Max(5)
    private int rating;

    @Size(max = 2000)
    private String comment;
}

