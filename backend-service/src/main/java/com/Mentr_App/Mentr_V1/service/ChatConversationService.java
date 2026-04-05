package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.dto.chat.ConversationAccessResponse;

/**
 * CHAT CONVERSATION SERVICE
 * -------------------------
 * Encapsulates all server-side logic for creating and updating
 * learner↔mentor chat conversations and syncing with Firestore.
 */
public interface ChatConversationService {

//    /**
//     * Learner-initiated access to a conversation with a mentor.
//     *
//     * @param learnerUserId current learner userId (from JWT).
//     * @param mentorId      mentorId (PK of mentors table).
//     * @return ConversationAccessResponse DTO.
//     */
//    ConversationAccessResponse openConversationAsLearner(Long learnerUserId, Long mentorId);

    /**
     * Mentor-initiated access to a conversation with a learner.
     *
     * @param mentorUserId  current mentor's userId (from JWT).
     * @param learnerUserId learner's userId.
     * @return ConversationAccessResponse DTO.
     */
    ConversationAccessResponse openConversationAsMentor(Long mentorUserId, Long learnerUserId);
}
