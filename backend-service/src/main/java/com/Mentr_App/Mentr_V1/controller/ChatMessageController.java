package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.dto.chat.SendChatMessageRequest;
import com.Mentr_App.Mentr_V1.dto.chat.SendChatMessageResponse;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.ChatMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * CHAT MESSAGE CONTROLLER
 * -----------------------
 * Backend endpoint to send chat messages (prerequisite layer).
 *
 * POST /api/chat/messages
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @PostMapping("/messages")
    public ResponseEntity<SendChatMessageResponse> sendMessage(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody SendChatMessageRequest request
    ) {
        SendChatMessageResponse response =
                chatMessageService.sendMessage(currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }
}

