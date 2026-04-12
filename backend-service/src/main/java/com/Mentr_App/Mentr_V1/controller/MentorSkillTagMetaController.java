package com.Mentr_App.Mentr_V1.controller;


import com.Mentr_App.Mentr_V1.dto.meta.MentorSkillTagSearchResponse;
import com.Mentr_App.Mentr_V1.service.MentorSkillTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/meta", "/api/v1/meta"})
@RequiredArgsConstructor
public class MentorSkillTagMetaController {

    private final MentorSkillTagService tagService;

    /**
     * Search tags (search-as-you-type).
     *
     * Example: GET /api/meta/tags?q=spr&limit=10
     */
    @GetMapping("/tags")
    public ResponseEntity<MentorSkillTagSearchResponse> searchTags(
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        return ResponseEntity.ok(tagService.searchTags(q, limit));
    }
}

