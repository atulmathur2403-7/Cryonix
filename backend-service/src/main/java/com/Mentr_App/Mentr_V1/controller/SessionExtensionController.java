package com.Mentr_App.Mentr_V1.controller;


import com.Mentr_App.Mentr_V1.dto.session.extension.*;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.SessionExtensionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sessions/{sessionId}/extensions")
public class SessionExtensionController {

    private final SessionExtensionService sessionExtensionService;

    // Learner: request extension
    @PostMapping("/request")
    public ResponseEntity<SessionExtensionCreateResponse> request(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId
    ) {
        return ResponseEntity.ok(sessionExtensionService.requestByLearner(sessionId, currentUser.getId()));
    }

    // Mentor: offer extension
    @PostMapping("/offer")
    public ResponseEntity<SessionExtensionCreateResponse> offer(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId
    ) {
        return ResponseEntity.ok(sessionExtensionService.offerByMentor(sessionId, currentUser.getId()));
    }

    // Mentor approves learner request
    @PostMapping("/{extensionId}/approve")
    public ResponseEntity<SessionExtensionDecisionResponse> approve(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId,
            @PathVariable Long extensionId
    ) {
        return ResponseEntity.ok(sessionExtensionService.approve(sessionId, extensionId, currentUser.getId()));
    }

    // Learner accepts mentor offer
    @PostMapping("/{extensionId}/accept")
    public ResponseEntity<SessionExtensionDecisionResponse> acceptOffer(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId,
            @PathVariable Long extensionId
    ) {
        return ResponseEntity.ok(sessionExtensionService.acceptOffer(sessionId, extensionId, currentUser.getId()));
    }

    // Either side declines (based on type)
    @PostMapping("/{extensionId}/decline")
    public ResponseEntity<SessionExtensionDecisionResponse> decline(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId,
            @PathVariable Long extensionId
    ) {
        return ResponseEntity.ok(sessionExtensionService.decline(sessionId, extensionId, currentUser.getId()));
    }

    // Initiator cancels
    @PostMapping("/{extensionId}/cancel")
    public ResponseEntity<SessionExtensionDecisionResponse> cancel(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId,
            @PathVariable Long extensionId
    ) {
        return ResponseEntity.ok(sessionExtensionService.cancel(sessionId, extensionId, currentUser.getId()));
    }

    // Learner creates PaymentIntent (after approved/accepted)
    @PostMapping("/{extensionId}/payment-intent")
    public ResponseEntity<CreateExtensionPaymentResponse> createPayment(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId,
            @PathVariable Long extensionId
    ) {
        return ResponseEntity.ok(sessionExtensionService.createPaymentIntent(sessionId, extensionId, currentUser.getId()));
    }

    // Polling endpoint to drive “auto prompt near end”
    @GetMapping("/active")
    public ResponseEntity<SessionExtensionActiveResponse> active(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long sessionId
    ) {
        return ResponseEntity.ok(sessionExtensionService.getActive(sessionId, currentUser.getId()));
    }
}

