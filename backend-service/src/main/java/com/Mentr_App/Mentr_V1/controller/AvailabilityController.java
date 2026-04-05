package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.dto.availability.AvailabilityRequest;
import com.Mentr_App.Mentr_V1.dto.availability.AvailabilityResponse;
import com.Mentr_App.Mentr_V1.dto.availability.PublicAvailabilityResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.service.AvailabilityService;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails; // <-- your JWT user principal
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Mentor Availability Controller
 *
 * - Endpoints for mentors to manage their availability calendar.
 * - Mentor identity is derived from the authenticated JWT principal,
 *   so mentors cannot spoof IDs or manage other mentor calendars.
 * - This replaces the old approach where mentorId was passed in the path.
 *
 * Product Flow alignment:
 *   Mentor Dashboard → Calendar Scheduling (set, list, delete slots)
 */
@RestController
@RequestMapping("/api/mentor/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;
    private final MentorRepository mentorRepository;

    public AvailabilityController(AvailabilityService availabilityService,
                                  MentorRepository mentorRepository) {
        this.availabilityService = availabilityService;
        this.mentorRepository = mentorRepository;
    }

    /**
     * Create a new availability slot for the authenticated mentor.
     *
     * Example request body:
     * {
     *   "startTime": "2025-09-20T14:00:00Z",
     *   "endTime": "2025-09-20T15:00:00Z",
     *   "blocked": false
     * }
     */
    @PostMapping
    public ResponseEntity<AvailabilityResponse> createSlot(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody AvailabilityRequest request) {

        // Resolve the mentor linked to the authenticated user
        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        // Delegate to service layer
        return ResponseEntity.ok(
                availabilityService.createAvailability(mentor.getMentorId(), request)
        );
    }

    /**
     * List all availability slots for the authenticated mentor.
     */
    @GetMapping
    public ResponseEntity<List<AvailabilityResponse>> listSlots(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        return ResponseEntity.ok(
                availabilityService.listAvailabilityForMentor(mentor.getMentorId())
        );
    }

    /**
     * Delete a specific availability slot by ID,
     * but only if it belongs to the authenticated mentor.
     */
    @DeleteMapping("/{slotId}")
    public ResponseEntity<Void> deleteSlot(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long slotId) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        availabilityService.deleteAvailability(mentor.getMentorId(), slotId);
        return ResponseEntity.noContent().build();
    }
}
