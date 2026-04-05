package com.Mentr_App.Mentr_V1.repository;




import com.Mentr_App.Mentr_V1.model.Learner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearnerRepository extends JpaRepository<Learner, Long> {
    Optional<Learner> findByUser_UserId(Long userId);
}
