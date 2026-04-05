package com.Mentr_App.Mentr_V1.controller;


import com.Mentr_App.Mentr_V1.dto.chat.ConversationAccessResponse;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.ChatConversationService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * CHAT CONVERSATION CONTROLLER
 * ----------------------------
 * Exposes backend APIs for learner/mentor chat access.
 *
 * - Learner: open conversation with a mentor (by mentorId).
 * - Mentor:  open conversation with a learner (by learnerId).
 *
 * These APIs:
 *  - Validate the pair (learner ↔ mentor) using ChatEligibilityService.
 *  - Ensure a ChatConversation row exists in SQL.
 *  - Synchronize minimal metadata to Firestore (conversation doc).
 *
 * Actual chat messages are exchanged directly via Firestore.
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatConversationController {

    private final ChatConversationService chatConversationService;

//    /**
//     * Learner opens / accesses a conversation with a mentor.
//     *
//     * Example:
//     *  POST /api/chat/conversations?mentorId=5
//     *
//     * @param currentUser authenticated learner (from JWT).
//     * @param mentorId    mentorId (PK of mentors table).
//     * @return ConversationAccessResponse describing chat eligibility and IDs.
//     */
//    @PostMapping("/conversations")
//    public ResponseEntity<ConversationAccessResponse> openConversationAsLearner(
//            @AuthenticationPrincipal CustomUserDetails currentUser,
//            @RequestParam("mentorId") @NotNull Long mentorId
//    ) {
//        ConversationAccessResponse response =
//                chatConversationService.openConversationAsLearner(currentUser.getId(), mentorId);
//        return ResponseEntity.ok(response);
//    }

    /**
     * Mentor opens / accesses a conversation with a specific learner.
     *
     * HTTP:
     *  POST /api/chat/conversations/learner/{learnerId}
     *
     * Auth:
     *  - Any authenticated mentor (role is enforced in security config).
     *
     * Path variables:
     *  - learnerId → users.userId for the learner.
     *
     * Behavior:
     *  1) Resolve mentor from JWT (userId → Mentor).
     *  2) Validate learner exists.
     *  3) Delegate to ChatConversationService.openConversationAsMentor(...).
     *
     * @param currentUser authenticated mentor (from JWT).
     * @param learnerId   learner user's primary key.
     * @return ConversationAccessResponse describing chat eligibility and IDs.
     */
    @PostMapping("/conversations/learner/{learnerId}")
    public ResponseEntity<ConversationAccessResponse> openConversationAsMentor(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable("learnerId") @NotNull Long learnerId
    ) {
        ConversationAccessResponse response =
                chatConversationService.openConversationAsMentor(currentUser.getId(), learnerId);
        return ResponseEntity.ok(response);
    }
}
