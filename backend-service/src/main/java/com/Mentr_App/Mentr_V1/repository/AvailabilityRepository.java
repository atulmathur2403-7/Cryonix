package com.Mentr_App.Mentr_V1.repository;

import com.Mentr_App.Mentr_V1.model.AvailabilitySlot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<AvailabilitySlot, Long> {

    // List all slots for a mentor (used by mentor dashboard)
    List<AvailabilitySlot> findByMentor_MentorIdOrderByStartTimeAsc(Long mentorId);

    // Candidate slots that overlap the requested window (service will assert full coverage)
    List<AvailabilitySlot> findByMentor_MentorIdAndEndTimeAfterAndStartTimeBefore(
            Long mentorId, Instant start, Instant end);

    // Mentor slots (paginated)
    Page<AvailabilitySlot> findByMentor_MentorIdOrderByStartTimeAsc(Long mentorId, Pageable pageable);

}
