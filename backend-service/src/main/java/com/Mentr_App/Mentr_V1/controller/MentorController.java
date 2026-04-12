package com.Mentr_App.Mentr_V1.controller;


import com.Mentr_App.Mentr_V1.dto.availability.PublicAvailabilityResponse;
import com.Mentr_App.Mentr_V1.dto.common.PagedResponse;
import com.Mentr_App.Mentr_V1.dto.mentor.*;
import com.Mentr_App.Mentr_V1.dto.review.ReviewResponse;
import com.Mentr_App.Mentr_V1.exception.InvalidInputException;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.model.enums.Pronouns;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.AvailabilityService;
import com.Mentr_App.Mentr_V1.service.MentorPresenceService;
import com.Mentr_App.Mentr_V1.service.MentorService;
import com.Mentr_App.Mentr_V1.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Public Mentor discovery and profile APIs.
 *
 * - Search is public and supports q, skills, pagination, and trending sort.
 * - Profile is public and returns availability preview and pricing.
 */
@RestController
@RequestMapping("/api/mentors")
public class MentorController {

    private final MentorService mentorService;
    private final ReviewService reviewService;
    private final AvailabilityService availabilityService;
    private final MentorPresenceService mentorPresenceService;
    private final MentorRepository mentorRepository;

    public MentorController(MentorService mentorService, ReviewService reviewService, AvailabilityService availabilityService, MentorPresenceService mentorPresenceService, MentorRepository mentorRepository) {
        this.mentorService = mentorService;
        this.reviewService = reviewService;
        this.availabilityService = availabilityService;
        this.mentorPresenceService = mentorPresenceService;
        this.mentorRepository = mentorRepository;
    }

    /**
     * Search mentors.
     * Example:
     * GET /api/mentors?q=java&skills=backend,rest&sort=trending&page=0&size=10
     *
     * Returns 200 OK with paged MentorSearchResponse
     */
    @GetMapping
    public ResponseEntity<PagedResponse<MentorSearchResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) String languages,
            @RequestParam(required = false) String pronouns,
            @RequestParam(required = false, defaultValue = "relevance") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        List<String> skillList = (skills == null || skills.isBlank())
                ? Collections.emptyList()
                : Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        List<String> languageList = (languages == null || languages.isBlank())
                ? Collections.emptyList()
                : Arrays.stream(languages.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        Pronouns pronounsEnum = null;
        if (pronouns != null && !pronouns.isBlank()) {
            try {
                // ✅ uses enum @JsonCreator normalization logic too
                pronounsEnum = Pronouns.fromJson(pronouns);
            } catch (Exception e) {
                throw new InvalidInputException("PRONOUNS_INVALID", "Invalid pronouns value: " + pronouns);
            }
        }

        Page<MentorSearchResponse> results = mentorService.searchMentors(q, skillList, languageList, pronounsEnum, sort, page, size);

        PagedResponse<MentorSearchResponse> response = new PagedResponse<>(
                results.getContent(),
                results.getNumber(),
                results.getSize(),
                results.getTotalElements(),
                results.getTotalPages(),
                results.isLast()
        );

        return ResponseEntity.ok(response);
    }


    /**
     * Public mentor profile
     * GET /api/mentors/{mentorId}
     *
     * Returns:
     *  - 200 OK with MentorProfileResponse if found
     *  - 404 Not Found if mentor does not exist
     */
    @GetMapping("/{mentorId}")
    public ResponseEntity<MentorProfileResponse> getProfile(@PathVariable Long mentorId) {
        MentorProfileResponse profile = mentorService.getMentorProfile(mentorId);
        return ResponseEntity.ok(profile);
    }

//    @PutMapping("/profile")
//    public ResponseEntity<MentorProfileResponse> updateProfile(
//            @AuthenticationPrincipal CustomUserDetails currentUser,
//            @Valid @RequestBody UpdateMentorProfileRequest request) {
//
//        MentorProfileResponse updated = mentorService.updateMentorProfile(currentUser.getId(), request);
//        return ResponseEntity.ok(updated);
//    }

    @GetMapping("/trending")
    public ResponseEntity<List<MentorSearchResponse>> getTrendingMentors(
            @RequestParam(defaultValue = "5") int limit) {

        if (limit <= 0) limit = 5; // default safeguard

        List<MentorSearchResponse> trending = mentorService.getTrendingMentors(limit);
        return ResponseEntity.ok(trending); // 200 OK
    }

    @GetMapping("/{mentorId}/reviews")
    public ResponseEntity<PagedResponse<ReviewResponse>> getAllReviewsForMentor(
            @PathVariable Long mentorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<ReviewResponse> results = reviewService.getAllReviewsForMentor(mentorId, page, size);

        PagedResponse<ReviewResponse> response = new PagedResponse<>(
                results.getContent(),
                results.getNumber(),
                results.getSize(),
                results.getTotalElements(),
                results.getTotalPages(),
                results.isLast()
        );

        return ResponseEntity.ok(response); // 200 OK
    }

    @GetMapping("/{mentorId}/ratings-summary")
    public ResponseEntity<RatingsSummaryResponse> getRatingsSummary(@PathVariable Long mentorId) {
        RatingsSummaryResponse resp = mentorService.getRatingsSummary(mentorId);
        return ResponseEntity.ok(resp); // 200 OK
    }

    /**
     * ✅ Public endpoint for learners/guests to view mentor availability.
     *
     * Example:
     *   GET /api/mentors/{mentorId}/availability
     *
     * Returns upcoming slots (not blocked, not past).
     */
    @GetMapping("/{mentorId}/availability")
    public ResponseEntity<List<PublicAvailabilityResponse>> getPublicAvailability(
            @PathVariable Long mentorId) {
        List<PublicAvailabilityResponse> slots = availabilityService.getPublicAvailability(mentorId);
        return ResponseEntity.ok(slots); // 200 OK
    }
    /**
     * Mentor toggles Talk Now presence → LIVE.
     *
     * HTTP:
     *  POST /api/mentors/presence/live
     *
     * Frontend:
     *  - Called when mentor clicks "Enable Talk Now".
     */
    @PostMapping("/presence/live")
    public ResponseEntity<MentorPresenceResponse> goLive(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Mentor profile not found"));

        return ResponseEntity.ok(mentorPresenceService.goLive(mentor));
    }

    /**
     * Mentor toggles Talk Now presence → OFFLINE.
     *
     * HTTP:
     *  POST /api/mentors/presence/offline
     */
    @PostMapping("/presence/offline")
    public ResponseEntity<MentorPresenceResponse> goOffline(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Mentor profile not found"));

        return ResponseEntity.ok(mentorPresenceService.goOffline(mentor));
    }

    /**
     * Heartbeat from mentor dashboard while LIVE / IN_CALL.
     *
     * HTTP:
     *  POST /api/mentors/presence/heartbeat
     *
     * Frontend:
     *  - Call every ~25–30 seconds to avoid auto OFFLINE.
     */
    @PostMapping("/presence/heartbeat")
    public ResponseEntity<MentorPresenceResponse> heartbeat(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Mentor profile not found"));

        return ResponseEntity.ok(mentorPresenceService.heartbeat(mentor));
    }

    /**
     * Simple endpoint to get current mentor presence snapshot.
     *
     * HTTP:
     *  GET /api/mentors/presence
     */
    @GetMapping("/presence")
    public ResponseEntity<MentorPresenceResponse> getPresence(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Mentor profile not found"));

        return ResponseEntity.ok(mentorPresenceService.getPresence(mentor));
    }

    @PreAuthorize("hasRole('MENTOR')")
    @GetMapping("/profile")
    public ResponseEntity<MentorEditProfileResponse> getMyMentorProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(mentorService.getMyMentorProfile(currentUser.getId()));
    }


    @PreAuthorize("hasRole('MENTOR')")
    @PutMapping("/profile")
    public ResponseEntity<MentorEditProfileResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody UpdateMentorProfileRequest request) {

        MentorEditProfileResponse updated = mentorService.updateMentorProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }


}

