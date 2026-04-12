package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.dto.shorts.*;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.MentorShortsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({
        "/api/mentors/me/shorts",
        "/api/v1/mentors/me/shorts",

        // Backward compatible aliases (optional)
        "/api/mentors/shorts",
        "/api/v1/mentors/shorts"
})
@RequiredArgsConstructor
public class MentorShortsController {

    private final MentorShortsService mentorShortsService;

    /**
     * Reserve a Shorts upload slot and return a signed PUT URL.
     *
     * Flow:
     * 1) Client calls reserve
     * 2) Client PUTs MP4 to GCS signed URL
     * 3) Client calls finalize (fast gate)
     */
    @PreAuthorize("hasRole('MENTOR')")
    @PostMapping("/reserve")
    public ResponseEntity<ReserveMentorShortResponse> reserve(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody ReserveMentorShortRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        return ResponseEntity.ok(mentorShortsService.reserve(currentUser.getId(), request, idempotencyKey));
    }

    /**
     * Finalize: verifies staged object exists AND validates Shorts rules quickly.
     * If valid -> READY and queued for worker upload.
     */
    @PreAuthorize("hasRole('MENTOR')")
    @PostMapping("/{uploadId}/finalize")
    public ResponseEntity<FinalizeMentorShortResponse> finalizeUpload(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long uploadId
    ) {
        return ResponseEntity.ok(mentorShortsService.finalizeUpload(currentUser.getId(), uploadId));
    }

    /**
     * List mentor's shorts (for edit screen).
     */
    @PreAuthorize("hasRole('MENTOR')")
    @GetMapping
    public ResponseEntity<MentorShortVideoListResponse> listMyShorts(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(mentorShortsService.listMyShorts(currentUser.getId()));
    }

    /**
     * Delete a short (soft delete + best-effort staging delete).
     */
    @PreAuthorize("hasRole('MENTOR')")
    @DeleteMapping("/{uploadId}")
    public ResponseEntity<DeleteMentorShortResponse> delete(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long uploadId
    ) {
        return ResponseEntity.ok(mentorShortsService.deleteShort(currentUser.getId(), uploadId));
    }
}
