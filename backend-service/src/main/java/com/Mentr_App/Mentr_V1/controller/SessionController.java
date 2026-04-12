package com.Mentr_App.Mentr_V1.controller;



import com.Mentr_App.Mentr_V1.dto.session.UpdateSessionStatusRequest;
import com.Mentr_App.Mentr_V1.dto.session.SessionResponse;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;
    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SessionResponse> updateStatus(
            @AuthenticationPrincipal CustomUserDetails currentUser, // JWT user
            @PathVariable Long id,
            @Valid @RequestBody UpdateSessionStatusRequest request) {

        // You can check if this user is authorized (mentor/learner linked to session)
        return ResponseEntity.ok(sessionService.updateSessionStatus(id, request));
    }


    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<SessionResponse>> getSessionsForMentor(@PathVariable Long mentorId) {
        return ResponseEntity.ok(sessionService.getSessionsForMentor(mentorId));
    }

    @GetMapping("/learner/{learnerId}")
    public ResponseEntity<List<SessionResponse>> getSessionsForLearner(@PathVariable Long learnerId) {
        return ResponseEntity.ok(sessionService.getSessionsForLearner(learnerId));
    }

    /**
     * Explicitly end a running session (Talk Now or Book Later).
     *
     * - Allowed actors:
     *   • The mentor linked to this session
     *   • The learner linked to this session
     *
     * - Typical usage:
     *   • UI "End Call" button when either side hangs up early.
     *   • Backend will:
     *      - Mark session as COMPLETED (if not already)
     *      - Optionally adjust endTime to now
     *      - Update mentor presence (IN_CALL → LIVE/OFFLINE)
     */
    @PostMapping("/{id}/end")
    public ResponseEntity<SessionResponse> endSession(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                sessionService.endSession(id, currentUser.getId())
        );
    }

}

