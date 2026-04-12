package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.dto.note.NoteRequest;
import com.Mentr_App.Mentr_V1.dto.note.NoteResponse;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions/{sessionId}/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping
    public ResponseEntity<NoteResponse> addNote(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId,
            @Valid @RequestBody NoteRequest request) {

        NoteResponse resp = noteService.addNote(sessionId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getNotesForSession(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId) {

        List<NoteResponse> notes = noteService.getNotesForSession(sessionId, currentUser.getId());
        return ResponseEntity.ok(notes);
    }

}
