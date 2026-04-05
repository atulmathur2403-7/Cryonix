package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.dto.common.PagedResponse;
import com.Mentr_App.Mentr_V1.dto.dashboard.*;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.DashboardService;
import com.Mentr_App.Mentr_V1.service.MentorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Dashboard APIs for mentor and learner.
 * Includes:
 *  - Classic dashboard (availability/bookings/sessions)
 *  - Mentor KPI dashboard (summary + timeseries for graphs)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;           // classic dashboard
    private final MentorDashboardService mentorDashboardService; // KPI dashboard
    private final MentorRepository mentorRepository;

    /**
     * Classic Mentor dashboard (sessions).
     * GET /api/mentor/dashboard/sessions
     */
    @GetMapping("/mentor/dashboard/sessions")
    public ResponseEntity<PagedResponse<MentorSessionsDashboardResponse>> getMentorDashboardSessions(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        return ResponseEntity.ok(dashboardService.getMentorDashboardSessions(mentor.getMentorId(), page, size));
    }

    /**
     * Classic Mentor dashboard (bookings).
     * GET /api/mentor/dashboard
     */
    @GetMapping("/mentor/dashboard/bookings")
    public ResponseEntity<PagedResponse<MentorBookingsDashboardResponse>> getMentorDashboardBookings(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        return ResponseEntity.ok(dashboardService.getMentorDashboardBookings(mentor.getMentorId(), page, size));
    }


    /**
     * Classic Mentor dashboard (availability).
     * GET /api/mentor/dashboard/availability
     */
    @GetMapping("/mentor/dashboard/availability")
    public ResponseEntity<PagedResponse<MentorAvailabilityDashboardResponse>> getMentorDashboardAvailability(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        return ResponseEntity.ok(dashboardService.getMentorDashboardAvailabilityTime(mentor.getMentorId(), page, size));
    }

    /**
     * Classic Learner dashboard (bookings + sessions).
     * GET /api/learner/dashboard/sessions
     */
    @GetMapping("/learner/dashboard/sessions")
    public ResponseEntity<PagedResponse<LearnerSessionDashBoardResponse>> getLearnerDashboardSessions(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(dashboardService.getLearnerDashboardSessions(currentUser.getId(), page, size));
    }


    /**
     * Classic Learner dashboard (bookings).
     * GET /api/learner/dashboard/bookings
     */
    @GetMapping("/learner/dashboard/bookings")
    public ResponseEntity<PagedResponse<LearnerBookingsDashboardResponse>> getLearnerDashboardBookings(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(dashboardService.getLearnerDashboardBookings(currentUser.getId(), page, size));
    }

    /**
     * Mentor KPI summary dashboard.
     * Shows totals (sessions completed, reviews, minutes).
     * GET /api/mentor/dashboard/summary?range=30d
     */
    @GetMapping("/mentor/dashboard/summary")
    public ResponseEntity<SummaryResponse> getSummary(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "30d") String range) {

        SummaryResponse resp = mentorDashboardService.getMentorSummaryByUserId(currentUser.getId(), range);
        return ResponseEntity.ok(resp);
    }

    /**
     * Mentor KPI timeseries dashboard.
     * Returns daily buckets for sessions | reviews | minutes.
     * GET /api/mentor/dashboard/timeseries?metric=sessions&range=30d&interval=day
     */
    @GetMapping("/mentor/dashboard/timeseries")
    public ResponseEntity<TimeseriesResponse> getTimeseries(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam String metric,
            @RequestParam(defaultValue = "30d") String range,
            @RequestParam(defaultValue = "day") String interval) {

        TimeseriesResponse resp = mentorDashboardService.getMentorTimeseriesByUserId(
                currentUser.getId(), metric, range, interval);
        return ResponseEntity.ok(resp);
    }
}
