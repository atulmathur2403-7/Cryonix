package com.Mentr_App.Mentr_V1.controller;


import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowActiveRequestResponse;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowDecisionResponse;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowStartRequest;
import com.Mentr_App.Mentr_V1.dto.talkNow.TalkNowStartResponse;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.TalkNowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * TALK NOW CONTROLLER
 * -------------------
 * API surface for Talk Now feature.
 *
 * Learner:
 *  - POST /api/talk-now/start           → create TALK_NOW booking + PaymentIntent
 *
 * Mentor:
 *  - GET  /api/talk-now/active          → poll for RINGING request
 *  - POST /api/talk-now/{bookingId}/accept   → accept ringing
 *  - POST /api/talk-now/{bookingId}/decline  → decline ringing
 */
@RestController
@RequestMapping("/api/talk-now")
@RequiredArgsConstructor
public class TalkNowController {

    private final TalkNowService talkNowService;
    private final UserRepository userRepository;

    /**
     * Learner starts a Talk Now attempt.
     *
     * HTTP:
     *  POST /api/talk-now/start
     *
     * Auth:
     *  - Any authenticated learner (role checked elsewhere).
     *
     * Steps:
     *  1. Resolve learner from JWT.
     *  2. Delegate to TalkNowService.startTalkNow(...)
     *  3. Return payment client_secret + requestId (bookingId).
     */
    @PostMapping("/start")
    public ResponseEntity<TalkNowStartResponse> startTalkNow(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody TalkNowStartRequest request
    ) {
        User learner = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Learner not found"));

        TalkNowStartResponse resp = talkNowService.startTalkNow(learner, request);
        return ResponseEntity.ok(resp);
    }

    /**
     * Mentor polls for an active RINGING Talk Now request.
     *
     * HTTP:
     *  GET /api/talk-now/active
     *
     * Response:
     *  - 200 + TalkNowActiveRequestResponse if RINGING exists.
     *  - 204 No Content if nothing is ringing.
     */
    @GetMapping("/active")
    public ResponseEntity<TalkNowActiveRequestResponse> getActiveForMentor(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        TalkNowActiveRequestResponse resp = talkNowService.getActiveRingingForMentor(currentUser.getId());
        if (resp == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resp);
    }

    /**
     * Mentor accepts a ringing Talk Now booking.
     *
     * HTTP:
     *  POST /api/talk-now/{bookingId}/accept
     */
    @PostMapping("/{bookingId}/accept")
    public ResponseEntity<TalkNowDecisionResponse> acceptTalkNow(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long bookingId
    ) {
        TalkNowDecisionResponse resp = talkNowService.acceptTalkNow(currentUser.getId(), bookingId);
        return ResponseEntity.ok(resp);
    }

    /**
     * Mentor declines a ringing Talk Now booking.
     *
     * HTTP:
     *  POST /api/talk-now/{bookingId}/decline
     */
    @PostMapping("/{bookingId}/decline")
    public ResponseEntity<TalkNowDecisionResponse> declineTalkNow(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long bookingId
    ) {
        TalkNowDecisionResponse resp = talkNowService.declineTalkNow(currentUser.getId(), bookingId);
        return ResponseEntity.ok(resp);
    }
}

