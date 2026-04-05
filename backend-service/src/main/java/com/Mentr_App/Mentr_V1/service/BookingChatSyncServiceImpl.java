package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.chat.ChatEligibilityResponse;
import com.Mentr_App.Mentr_V1.model.ChatConversation;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.repository.ChatConversationRepository;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import com.Mentr_App.Mentr_V1.util.ChatConversationIdUtil;
import com.Mentr_App.Mentr_V1.util.FirebaseIdentityUtil;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingChatSyncServiceImpl implements BookingChatSyncService {

    private final UserRepository userRepository;
    private final MentorRepository mentorRepository;
    private final ChatConversationRepository chatConversationRepository;
    private final ChatEligibilityService chatEligibilityService;
    private final Firestore firestore;

    @Value("${mentr.chat.conversations-collection:conversations}")
    private String conversationsCollection;

    @Override
    @Transactional
    public void syncChatPermissionForPair(Long learnerUserId, Long mentorId, String trigger, Long bookingId) {
        try {
            User learner = userRepository.findById(learnerUserId).orElse(null);
            Mentor mentor = mentorRepository.findById(mentorId).orElse(null);

            if (learner == null || mentor == null) {
                log.warn("BookingChatSync: learner or mentor missing (learnerUserId={}, mentorId={}, trigger={})",
                        learnerUserId, mentorId, trigger);
                return;
            }

            String conversationId = ChatConversationIdUtil.buildConversationId(learnerUserId, mentorId);

            // Compute eligibility snapshot
            ChatEligibilityResponse eligibility =
                    chatEligibilityService.checkEligibility(learnerUserId, mentorId);

            boolean enabled = eligibility.isEligible();
            var reason = eligibility.getReason();

            ChatConversation conv = chatConversationRepository
                    .findByLearner_UserIdAndMentor_MentorId(learnerUserId, mentorId)
                    .orElseGet(() -> ChatConversation.builder()
                            .learner(learner)
                            .mentor(mentor)
                            .conversationId(conversationId)
                            .createdAt(Instant.now())
                            .build()
                    );

            // Don't override hard-block flag; just (re)compute enabled flag.
            conv.setEnabled(enabled && !conv.isBlocked());
            conv.setLastEligibilityReason(reason);
            conv.setLastBookingId(bookingId != null ? bookingId : conv.getLastBookingId());
            conv.setUpdatedAt(Instant.now());

            chatConversationRepository.save(conv);

            // Mirror to Firestore (for security rules)
            try {
                String learnerUid = FirebaseIdentityUtil.toFirebaseUid(learner.getUserId());
                String mentorUid = FirebaseIdentityUtil.toFirebaseUid(mentor.getUser().getUserId());

                Map<String, Object> doc = new HashMap<>();
                doc.put("conversationId", conversationId);
                doc.put("learnerUid", learnerUid);
                doc.put("mentorUid", mentorUid);
                doc.put("enabled", conv.isEnabled());
                doc.put("blocked", conv.isBlocked());
                doc.put("lastEligibilityReason",
                        conv.getLastEligibilityReason() != null ? conv.getLastEligibilityReason().name() : null);
                doc.put("lastBookingId", conv.getLastBookingId());
                doc.put("updatedAt", FieldValue.serverTimestamp());
                doc.put("trigger", trigger);

                firestore.collection(conversationsCollection)
                        .document(conversationId)
                        .set(doc);
            } catch (Exception e) {
                log.error("Failed to sync ChatConversation {} to Firestore: {}", conversationId, e.getMessage(), e);
            }

            log.info("BookingChatSync: learnerUserId={}, mentorId={}, trigger={}, enabled={}, reason={}",
                    learnerUserId, mentorId, trigger, conv.isEnabled(), reason);

        } catch (Exception ex) {
            // Never break booking/payment flows because chat sync failed
            log.error("BookingChatSync: error syncing chat permission (learnerUserId={}, mentorId={}, trigger={})",
                    learnerUserId, mentorId, trigger, ex);
        }
    }
}
