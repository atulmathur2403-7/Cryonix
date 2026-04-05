package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.MentorProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {
    // ✅ Fetch both tags and languages for edit payload (avoids lazy surprises / N+1 later)
    @EntityGraph(attributePaths = {"tags", "languages"})
    Optional<MentorProfile> findWithTagsByUserId(Long userId);
}

