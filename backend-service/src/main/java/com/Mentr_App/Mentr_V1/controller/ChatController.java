package com.Mentr_App.Mentr_V1.controller;



import com.Mentr_App.Mentr_V1.dto.chat.ChatEligibilityResponse;
import com.Mentr_App.Mentr_V1.dto.chat.ConversationAccessResponse;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.model.enums.PhoneNumberPolicyMode;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.ChatEligibilityService;
import com.Mentr_App.Mentr_V1.service.FirebaseTokenService;
import com.Mentr_App.Mentr_V1.util.ChatConversationIdUtil;
import com.Mentr_App.Mentr_V1.util.FirebaseIdentityUtil;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final UserRepository userRepository;
    private final MentorRepository mentorRepository;
    private final ChatEligibilityService chatEligibilityService;
    private final FirebaseTokenService firebaseTokenService;

    @Value("${mentr.chat.phone-number-policy-mode:MASK}")
    private String phoneNumberPolicyRaw;

    private PhoneNumberPolicyMode phonePolicy() {
        try {
            return PhoneNumberPolicyMode.valueOf(phoneNumberPolicyRaw.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return PhoneNumberPolicyMode.MASK;
        }
    }

    /**
     * Simple eligibility check for learner → mentor chat.
     *
     * GET /api/chat/mentor/{mentorId}/eligibility
     */
    @GetMapping("/mentor/{mentorId}/eligibility")
    public ResponseEntity<ChatEligibilityResponse> getEligibilityForMentor(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long mentorId
    ) {
        Long learnerUserId = currentUser.getId();
        ChatEligibilityResponse resp = chatEligibilityService.checkEligibility(learnerUserId, mentorId);
        return ResponseEntity.ok(resp);
    }

    /**
     * Returns everything frontend needs to open a chat:
     *  - conversationId
     *  - Firebase custom token for current user
     *  - learner/mentor UIDs & names
     *  - phone number policy (MASK/BLOCK)
     *
     * GET /api/chat/mentor/{mentorId}/access
     *
     * This endpoint is learner-centric:
     *  - current user must be the learner.
     */
    @GetMapping("/mentor/{mentorId}/access")
    public ResponseEntity<ConversationAccessResponse> getConversationAccessForMentor(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable @NotNull Long mentorId
    ) {
        Long learnerUserId = currentUser.getId();

        User learner = userRepository.findById(learnerUserId)
                .orElseThrow(() -> new IllegalStateException("Learner user not found"));

        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new IllegalStateException("Mentor not found"));

        ChatEligibilityResponse eligibility = chatEligibilityService.checkEligibility(learnerUserId, mentorId);

        String conversationId = ChatConversationIdUtil.buildConversationId(learnerUserId, mentorId);

        String learnerUid = FirebaseIdentityUtil.toFirebaseUid(learner.getUserId());
        String mentorUid = FirebaseIdentityUtil.toFirebaseUid(mentor.getUser().getUserId());

        // Create Firebase custom token for the current (learner) user
        String customToken=null;
        if(eligibility.isEligible()) {
            customToken = firebaseTokenService.createCustomToken(learner);
        }


        ConversationAccessResponse resp = ConversationAccessResponse.builder()
                .eligible(eligibility.isEligible())
                .reason(eligibility.getReason())
                .conversationEnabled(eligibility.isConversationEnabled())
                .learnerId(learner.getUserId())
                .mentorId(mentor.getMentorId())
                .bookingId(eligibility.getLatestBookingId())
                .conversationId(conversationId)
                .currentUserRole("LEARNER")
                .currentUserFirebaseUid(learnerUid)
                .learnerFirebaseUid(learnerUid)
                .mentorFirebaseUid(mentorUid)
                .learnerName(learner.getName())
                .learnerAvatar(learner.getProfilePic())
                .mentorName(mentor.getUser().getName())
                .mentorAvatar(mentor.getUser().getProfilePic())
                .firebaseCustomToken(customToken)
                .phoneNumberPolicyMode(phonePolicy())
                .build();

        return ResponseEntity.ok(resp);
    }
}
