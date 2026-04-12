package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.dto.meta.PronounsMetaResponse;
import com.Mentr_App.Mentr_V1.service.PronounsMetaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/meta", "/api/v1/meta"})
@RequiredArgsConstructor
public class PronounsMetaController {

    private final PronounsMetaService pronounsMetaService;

    /**
     * Pronouns meta endpoint.
     *
     * Example: GET /api/meta/pronouns
     */
    @GetMapping("/pronouns")
    public ResponseEntity<PronounsMetaResponse> getPronouns() {
        return ResponseEntity.ok(pronounsMetaService.getPronouns());
    }
}

