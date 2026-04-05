package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.dto.meta.MentorLanguageSearchResponse;
import com.Mentr_App.Mentr_V1.service.MentorLanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/meta", "/api/v1/meta"})
@RequiredArgsConstructor
public class MentorLanguageMetaController {

    private final MentorLanguageService languageService;

    /**
     * Search languages (search-as-you-type).
     *
     * Example: GET /api/meta/languages?q=hi&limit=10
     */
    @GetMapping("/languages")
    public ResponseEntity<MentorLanguageSearchResponse> searchLanguages(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        return ResponseEntity.ok(languageService.searchLanguages(q, limit));
    }
}

