package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.dto.booking.BookingRequest;
import com.Mentr_App.Mentr_V1.dto.booking.BookingResponse;
import com.Mentr_App.Mentr_V1.dto.booking.CancelBookingRequest;
import com.Mentr_App.Mentr_V1.dto.booking.UpdateBookingStatusRequest;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.Booking;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.repository.BookingRepository;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import com.Mentr_App.Mentr_V1.security.CustomUserDetails;
import com.Mentr_App.Mentr_V1.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Booking Controller
 *
 * - Handles learner → mentor bookings (Talk Now / Book Later).
 * - Auto-creates session when booking is confirmed.
 * - Identity of learner/mentor is derived from JWT (CustomUserDetails).
 *
 * Product Flow alignment:
 *   Learner: Home → Search Mentors → Book a Call
 *   Mentor: Dashboard → Booking List (Confirm / Cancel)
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final MentorRepository mentorRepository;
    private final BookingRepository bookingRepository;

    public BookingController(BookingService bookingService,
                             UserRepository userRepository,
                             MentorRepository mentorRepository,
                             BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.mentorRepository = mentorRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Learner books a call with a mentor.
     *
     * - Learner identity comes from JWT.
     * - Mentor is specified in the request body.
     * - Booking type can be TALK_NOW or BOOK_LATER.
     *
     * Example request body:
     * {
     *   "mentorId": 5,
     *   "bookingType": "BOOK_LATER",
     *   "bookingTime": "2025-09-20T14:00:00Z"
     * }
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody BookingRequest request) {

        User learner = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BookingException("Learner not found"));

        return ResponseEntity.ok(bookingService.createBooking(request, learner));
    }


    /**
     * Mentor updates booking status (Confirm / Cancel).
     *
     * - Mentor identity comes from JWT.
     * - Validates mentor owns the booking before allowing update.
     *
     * Example:
     * PATCH /api/bookings/10
     * { "newStatus": "CONFIRMED" }
     */
    @PatchMapping("/{id}")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingStatusRequest request) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        // Ensure this booking belongs to this mentor
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingException("Booking not found"));
        if (!booking.getMentor().getMentorId().equals(mentor.getMentorId())) {
            throw new BookingException("You cannot update another mentor’s booking");
        }

        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request));
    }

    /**
     * Learner fetches their own bookings.
     * - LearnerId is resolved from JWT.
     */
    @GetMapping("/learner")
    public ResponseEntity<List<BookingResponse>> getBookingsForLearner(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        return ResponseEntity.ok(bookingService.getBookingsForLearner(currentUser.getId()));
    }

    /**
     * Mentor fetches their own bookings.
     * - MentorId is resolved from JWT.
     */
    @GetMapping("/mentor")
    public ResponseEntity<List<BookingResponse>> getBookingsForMentor(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        Mentor mentor = mentorRepository.findByUser_UserId(currentUser.getId())
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        return ResponseEntity.ok(bookingService.getBookingsForMentor(mentor.getMentorId()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelByLearner(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id,
            @Valid @RequestBody CancelBookingRequest request
    ) {
        User learner = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BookingException("Learner not found"));

        return ResponseEntity.ok(
                bookingService.cancelByLearner(id, learner, request.getRefundDestination(), request.getReason())
        );
    }

}
