package com.mentr.backend.repository;

import com.mentr.backend.model.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MentorRepository extends JpaRepository<Mentor, String> {
    List<Mentor> findBySpecialtyContainingIgnoreCase(String specialty);
    List<Mentor> findByIsOnlineTrue();
    List<Mentor> findByIsLiveTrue();
    List<Mentor> findByNameContainingIgnoreCase(String name);
}
