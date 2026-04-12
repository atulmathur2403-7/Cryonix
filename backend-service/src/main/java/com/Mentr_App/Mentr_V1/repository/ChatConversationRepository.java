package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * CHAT CONVERSATION REPOSITORY
 * ----------------------------
 * JPA access for ChatConversation rows.
 */
@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {

    Optional<ChatConversation> findByLearner_UserIdAndMentor_MentorId(Long learnerUserId, Long mentorId);

    Optional<ChatConversation> findByConversationId(String conversationId);

}

