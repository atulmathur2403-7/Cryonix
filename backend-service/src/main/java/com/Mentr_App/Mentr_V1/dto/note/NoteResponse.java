package com.Mentr_App.Mentr_V1.dto.note;


import lombok.Data;
import java.time.Instant;

@Data
public class NoteResponse {
    private Long id;
    private String content;
    private String resourceLinks;
    private Instant createdAt;
}

