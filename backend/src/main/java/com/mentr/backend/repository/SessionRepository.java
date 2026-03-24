package com.mentr.backend.repository;

import com.mentr.backend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, String> {
    List<Session> findByLearnerId(String learnerId);
    List<Session> findByMentorId(String mentorId);
    List<Session> findByLearnerIdAndStatus(String learnerId, String status);
}
