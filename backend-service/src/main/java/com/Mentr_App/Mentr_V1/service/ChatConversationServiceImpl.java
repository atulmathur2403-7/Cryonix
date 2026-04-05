package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.chat.ChatEligibilityResponse;
import com.Mentr_App.Mentr_V1.dto.chat.ConversationAccessResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.ChatConversation;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.model.enums.EligibilityReason;
import com.Mentr_App.Mentr_V1.model.enums.PhoneNumberPolicyMode;
import com.Mentr_App.Mentr_V1.repository.ChatConversationRepository;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import com.Mentr_App.Mentr_V1.util.ChatConversationIdUtil;
import com.Mentr_App.Mentr_V1.util.FirebaseIdentityUtil;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.SetOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.cloud.FirestoreClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * CHAT CONVERSATION SERVICE IMPL
 * ------------------------------
 * Responsibilities:
 *  - Evaluate chat eligibility for a learner↔mentor pair.
 *  - Ensure ChatConversation row exists in SQL.
 *  - Synchronize minimal metadata to Firestore "conversations" collection.
 *  - Return ConversationAccessResponse with Firebase bootstrap info.
 *
 * Firebase IDs:
 *  - firebaseUid = String.valueOf(userId)
 *  - conversationId = "m{mentorId}_u{learnerUserId}"
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatConversationServiceImpl implements ChatConversationService {

    private final UserRepository userRepository;
    private final MentorRepository mentorRepository;
    private final ChatConversationRepository chatConversationRepository;
    private final ChatEligibilityService chatEligibilityService;

//    /**
//     * Learner entry: open or create conversation with a mentor.
//     *
//     * @param learnerUserId current learner's userId (from JWT).
//     * @param mentorId      mentorId of the mentor.
//     */
//    @Override
//    public ConversationAccessResponse openConversationAsLearner(Long learnerUserId, Long mentorId) {
//        User learner = userRepository.findById(learnerUserId)
//                .orElseThrow(() -> new BookingException("Learner user not found"));
//
//        Mentor mentor = mentorRepository.findById(mentorId)
//                .orElseThrow(() -> new BookingException("Mentor not found"));
//
//        ChatEligibilityResponse eligibility =
//                chatEligibilityService.checkEligibility(learner.getUserId(), mentor.getMentorId());
//
//        return ensureConversationAndBuildResponse(
//                learner,
//                mentor,
//                eligibility,
//                "LEARNER"
//        );
//    }

    /**
     * Mentor entry: open or create conversation with a learner.
     *
     * @param mentorUserId  current mentor's userId (from JWT).
     * @param learnerUserId learner's userId.
     */
    @Override
    public ConversationAccessResponse openConversationAsMentor(Long mentorUserId, Long learnerUserId) {
        Mentor mentor = mentorRepository.findByUser_UserId(mentorUserId)
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        User learner = userRepository.findById(learnerUserId)
                .orElseThrow(() -> new BookingException("Learner user not found"));

        ChatEligibilityResponse eligibility =
                chatEligibilityService.checkEligibility(learner.getUserId(), mentor.getMentorId());

        return ensureConversationAndBuildResponse(
                learner,
                mentor,
                eligibility,
                "MENTOR"
        );
    }

    /**
     * Shared core:
     *  - Given learner + mentor + eligibility + caller role:
     *      • Find or create ChatConversation.
     *      • Update enabled / blocked / lastEligibilityReason fields.
     *      • Upsert Firestore conversation document.
     *      • Build ConversationAccessResponse with Firebase custom token.
     */
    private ConversationAccessResponse ensureConversationAndBuildResponse(
            User learner,
            Mentor mentor,
            ChatEligibilityResponse eligibility,
            String callerRole
    ) {
        Long learnerId = learner.getUserId();
        Long mentorId = mentor.getMentorId();

        String conversationId = ChatConversationIdUtil.buildConversationId(learnerId, mentorId);

        Optional<ChatConversation> existingOpt =
                chatConversationRepository.findByLearner_UserIdAndMentor_MentorId(learnerId, mentorId);

        ChatConversation conversation = existingOpt.orElseGet(() -> {
            ChatConversation created = new ChatConversation();
            created.setLearner(learner);
            created.setMentor(mentor);
            created.setConversationId(conversationId);
            created.setCreatedAt(Instant.now());
            return created;
        });

        boolean isEligible = eligibility.isEligible();
        conversation.setEnabled(isEligible);

        // Block logic: if conversation is already blocked, keep it blocked
        // and override eligibility reason.
        if (conversation.isBlocked()) {
            conversation.setLastEligibilityReason(EligibilityReason.BLOCKED);
        } else {
            EligibilityReason reason =
                    eligibility.getReason() != null ? eligibility.getReason() : EligibilityReason.ELIGIBLE;
            conversation.setLastEligibilityReason(reason);
        }

        if (eligibility.getLatestBookingId() != null) {
            conversation.setLastBookingId(eligibility.getLatestBookingId());
        }

        conversation.setUpdatedAt(Instant.now());

        ChatConversation saved = chatConversationRepository.save(conversation);

        // Firestore sync (best-effort)
        syncConversationToFirestore(saved);

        // -------------------------------------------------
        // Build Firebase identity
        // -------------------------------------------------
        String learnerUid = FirebaseIdentityUtil.toFirebaseUid(learnerId);
        String mentorUid = FirebaseIdentityUtil.toFirebaseUid(mentor.getUser().getUserId());

        String currentUserUid;
        if ("MENTOR".equalsIgnoreCase(callerRole)) {
            currentUserUid = mentorUid;
        } else {
            currentUserUid = learnerUid;
        }




        // Phone number policy – default to MASK for now
        PhoneNumberPolicyMode phonePolicy = PhoneNumberPolicyMode.MASK;

        // Effective reason for response
        EligibilityReason responseReason;
        if (saved.isBlocked()) {
            responseReason = EligibilityReason.BLOCKED;
        } else if (eligibility.getReason() != null) {
            responseReason = eligibility.getReason();
        } else {
            responseReason = isEligible ? EligibilityReason.ELIGIBLE : EligibilityReason.NO_VALID_BOOKINGS;
        }

        boolean conversationEnabled = saved.isEnabled() && !saved.isBlocked();

        String firebaseCustomToken = null;
        if (conversationEnabled) {
            firebaseCustomToken = createFirebaseCustomToken(currentUserUid);
        }


        String disabledReason = null;
        if (saved.isBlocked()) {
            disabledReason = "BLOCKED";
        } else if (!conversationEnabled && responseReason != null) {
            disabledReason = responseReason.name();
        }

        // -------------------------------------------------
        // Build DTO
        // -------------------------------------------------
        return ConversationAccessResponse.builder()
                .eligible(isEligible)
                .reason(responseReason)
                .conversationEnabled(conversationEnabled)
                .blocked(saved.isBlocked())
                .disabledReason(disabledReason)
                .learnerId(learnerId)
                .mentorId(mentorId)
                .bookingId(eligibility.getLatestBookingId())
                .conversationId(saved.getConversationId())
                .currentUserRole(callerRole.toUpperCase())
                .currentUserFirebaseUid(currentUserUid)
                .learnerFirebaseUid(learnerUid)
                .mentorFirebaseUid(mentorUid)
                .learnerName(learner.getName())
                .learnerAvatar(learner.getProfilePic())
                .mentorName(mentor.getUser().getName())
                .mentorAvatar(mentor.getUser().getProfilePic())
                .firebaseCustomToken(firebaseCustomToken)
                .phoneNumberPolicyMode(phonePolicy)
                .build();
    }

    /**
     * Minimal Firestore upsert for "conversations" collection.
     *
     * Path: conversations/{conversationId}
     */
    private void syncConversationToFirestore(ChatConversation conversation) {
        try {
            if (conversation.getLearner() == null
                    || conversation.getMentor() == null
                    || conversation.getMentor().getUser() == null) {

                log.warn(
                        "Skipping Firestore sync for conversation {} because learner/mentor is null",
                        conversation.getConversationId()
                );
                return;
            }

            String conversationId = conversation.getConversationId();
            Long learnerUserId = conversation.getLearner().getUserId();
            Long mentorId = conversation.getMentor().getMentorId();

            String learnerUid = FirebaseIdentityUtil.toFirebaseUid(learnerUserId);
            String mentorUid = FirebaseIdentityUtil.toFirebaseUid(
                    conversation.getMentor().getUser().getUserId()
            );

            DocumentReference docRef = FirestoreClient.getFirestore()
                    .collection("conversations")
                    .document(conversationId);

            Map<String, Object> payload = new HashMap<>();
            payload.put("conversationId", conversationId);
            payload.put("learnerUserId", learnerUserId);
            payload.put("mentorId", mentorId);
            payload.put("learnerUid", learnerUid);
            payload.put("mentorUid", mentorUid);
            payload.put("chatEnabled", conversation.isEnabled() && !conversation.isBlocked());
            payload.put("blocked", conversation.isBlocked());
            payload.put(
                    "lastEligibilityReason",
                    conversation.getLastEligibilityReason() != null
                            ? conversation.getLastEligibilityReason().name()
                            : null
            );
            payload.put("lastBookingId", conversation.getLastBookingId());
            payload.put("updatedAt", FieldValue.serverTimestamp());

            if (conversation.getCreatedAt() != null) {
                payload.put("createdAt", conversation.getCreatedAt());
            }

            docRef.set(payload, SetOptions.merge());

            log.debug(
                    "Synced conversation {} to Firestore for learner {} and mentor {}",
                    conversationId,
                    learnerUserId,
                    mentorId
            );

        } catch (Exception ex) {
            log.error(
                    "Failed to sync conversation {} to Firestore: {}",
                    conversation.getConversationId(),
                    ex.getMessage(),
                    ex
            );
        }
    }

    /**
     * Helper to create Firebase custom token for a given uid.
     *
     * If Firebase Admin is not configured or an error occurs,
     * this returns null but does not break the API.
     */
    private String createFirebaseCustomToken(String uid) {
        try {
            return FirebaseAuth.getInstance().createCustomToken(uid);
        } catch (FirebaseAuthException e) {
            log.error("Failed to create Firebase custom token for uid {}: {}", uid, e.getMessage(), e);
            return null;
        } catch (IllegalStateException e) {
            // FirebaseApp not initialized, etc.
            log.error("FirebaseAuth not initialized when creating token for uid {}: {}", uid, e.getMessage(), e);
            return null;
        }
    }
}
