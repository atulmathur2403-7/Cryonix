package com.Mentr_App.Mentr_V1.dto.note;


import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NoteRequest {
    @Size(max = 5000)
    private String content;

    @Size(max = 2000)
    private String resourceLinks;
}
