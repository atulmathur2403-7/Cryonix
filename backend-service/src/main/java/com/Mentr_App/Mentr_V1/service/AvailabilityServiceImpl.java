package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.dto.availability.AvailabilityRequest;
import com.Mentr_App.Mentr_V1.dto.availability.AvailabilityResponse;
import com.Mentr_App.Mentr_V1.dto.availability.PublicAvailabilityResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.AvailabilitySlot;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.repository.AvailabilityRepository;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.service.AvailabilityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final MentorRepository mentorRepository;

    public AvailabilityServiceImpl(AvailabilityRepository availabilityRepository,
                                   MentorRepository mentorRepository) {
        this.availabilityRepository = availabilityRepository;
        this.mentorRepository = mentorRepository;
    }

    @Override
    public AvailabilityResponse createAvailability(Long mentorId, AvailabilityRequest request) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new BookingException("Mentor not found"));

        Instant start = request.getStartTime();
        Instant end = request.getEndTime();

        if (start == null || end == null) throw new BookingException("startTime and endTime required");
        if (!end.isAfter(start)) throw new BookingException("endTime must be after startTime");

        // Optional: prevent overlapping available slots for the same mentor
        List<AvailabilitySlot> overlapping = availabilityRepository
                .findByMentor_MentorIdAndEndTimeAfterAndStartTimeBefore(mentorId, start, end);
        // If any existing slot fully or partially overlaps and is not blocked, we may either reject
        // or allow and let frontend merge. For MVP we reject overlapping creation to avoid confusion.
        boolean hasOverlap = overlapping.stream()
                .anyMatch(s -> !s.isBlocked() && (
                        s.getStartTime().isBefore(end) && s.getEndTime().isAfter(start)
                ));
        if (hasOverlap) {
            throw new BookingException("Requested slot overlaps existing availability. Consider merging or choose another range.");
        }

        AvailabilitySlot slot = AvailabilitySlot.builder()
                .mentor(mentor)
                .startTime(start)
                .endTime(end)
                .blocked(request.isBlocked())
                .recurringRule(request.getRecurringRule())
                .build();

        AvailabilitySlot saved = availabilityRepository.save(slot);
        return toResponse(saved);
    }

    @Override
    public List<AvailabilityResponse> listAvailabilityForMentor(Long mentorId) {
        return availabilityRepository.findByMentor_MentorIdOrderByStartTimeAsc(mentorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteAvailability(Long mentorId, Long slotId) {
        // optional: verify mentor owns the slot before delete
        AvailabilitySlot slot = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new BookingException("Availability slot not found"));
        if (!slot.getMentor().getMentorId().equals(mentorId)) {
            throw new BookingException("Slot does not belong to mentor");
        }
        availabilityRepository.deleteById(slotId);
    }

    @Override
    public List<PublicAvailabilityResponse> getPublicAvailability(Long mentorId) {
        // ✅ ensure mentor exists
        mentorRepository.findById(mentorId)
                .orElseThrow(() -> new BookingException("Mentor not found"));

        // ✅ filter out past slots
        List<AvailabilitySlot> slots = availabilityRepository
                .findByMentor_MentorIdOrderByStartTimeAsc(mentorId);

        return slots.stream()
                .filter(slot -> slot.getEndTime().isAfter(Instant.now()))
                .map(slot -> {
                    PublicAvailabilityResponse dto = new PublicAvailabilityResponse();
                    dto.setSlotId(slot.getId());
                    dto.setStartTime(slot.getStartTime());
                    dto.setEndTime(slot.getEndTime());
                    dto.setBlocked(slot.isBlocked());
                    return dto;
                })
                .toList();
    }

    private AvailabilityResponse toResponse(AvailabilitySlot s) {
        AvailabilityResponse r = new AvailabilityResponse();
        r.setId(s.getId());
        r.setStartTime(s.getStartTime());
        r.setEndTime(s.getEndTime());
        r.setBlocked(s.isBlocked());
        r.setRecurringRule(s.getRecurringRule());
        return r;
    }
}

