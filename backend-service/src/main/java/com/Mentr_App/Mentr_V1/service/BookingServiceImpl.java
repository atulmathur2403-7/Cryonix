package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.dto.booking.BookingRequest;
import com.Mentr_App.Mentr_V1.dto.booking.BookingResponse;
import com.Mentr_App.Mentr_V1.dto.booking.RefundDestination;
import com.Mentr_App.Mentr_V1.dto.booking.UpdateBookingStatusRequest;
import com.Mentr_App.Mentr_V1.dto.payment.CreatePaymentResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.*;
import com.Mentr_App.Mentr_V1.model.enums.SessionStatus;
import com.Mentr_App.Mentr_V1.repository.*;
import com.Mentr_App.Mentr_V1.util.PricingCalculator;
import com.stripe.exception.StripeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import static com.Mentr_App.Mentr_V1.dto.booking.RefundDestination.ORIGINAL_PAYMENT;

@Slf4j
@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final SessionRepository sessionRepository;
    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;
    private final AvailabilityRepository availabilityRepository;
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final WalletService walletService;
    private static final int UNIT_MINUTES = 15;
    private final BookingChatSyncService bookingChatSyncService;

    private static final int DEFAULT_DURATION_MINUTES = 30;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              SessionRepository sessionRepository,
                              MentorRepository mentorRepository,
                              UserRepository userRepository,
                              AvailabilityRepository availabilityRepository,
                              PaymentService paymentService,
                              PaymentRepository paymentRepository,WalletService walletService,
                              BookingChatSyncService bookingChatSyncService) {
        this.bookingRepository = bookingRepository;
        this.sessionRepository = sessionRepository;
        this.mentorRepository = mentorRepository;
        this.userRepository = userRepository;
        this.availabilityRepository = availabilityRepository;
        this.paymentService = paymentService;
        this.paymentRepository = paymentRepository;
        this.walletService = walletService;
        this.bookingChatSyncService = bookingChatSyncService;
    }

    /**
     * Create a new booking (Talk Now / Book Later).
     * - Learner is taken from JWT (in controller).
     * - MentorId comes from request.
     * - BOOK_LATER is validated against mentor availability.
     * - BOOK_LATER triggers payment creation via Stripe.
     */

    /**
     * Create a new booking (Talk Now / Book Later).
     * Both require payment before starting or scheduling a session.
     */
    @Override
    public BookingResponse createBooking(BookingRequest request, User learner) {
        Mentor mentor = mentorRepository.findById(request.getMentorId())
                .orElseThrow(() -> new BookingException("Mentor not found"));

        String bookingType = request.getBookingType() != null ? request.getBookingType() : "BOOK_LATER";

        Integer duration = request.getDurationMinutes();
        if (duration == null || duration < UNIT_MINUTES || duration % UNIT_MINUTES != 0) {
            throw new BookingException("Duration must be at least 15 minutes and in 15-minute multiples");
        }

        Instant start = bookingType.equalsIgnoreCase("TALK_NOW")
                ? Instant.now().plusSeconds(120)
                : request.getBookingTime();

        if (start == null) {
            throw new BookingException("Booking time required for BOOK_LATER");
        }

        Instant end = start.plusSeconds(duration * 60L);

        // Book Later: ensure selected window is inside a non-blocked availability
        if ("BOOK_LATER".equalsIgnoreCase(bookingType)) {
            boolean covered = availabilityRepository
                    .findByMentor_MentorIdAndEndTimeAfterAndStartTimeBefore(mentor.getMentorId(), start, end)
                    .stream().anyMatch(slot -> slot.covers(start, end));

            if (!covered) {
                throw new BookingException("Requested time does not fit the mentor’s availability");
            }
        }

        // 💡 Advisory: warn if window already has a confirmed overlap (rare but helpful UX)
        if (bookingRepository.existsConfirmedOverlap(mentor.getMentorId(), start, end)) {
            throw new BookingException("This time slice is already booked. Please choose another slot.");
        }

        // Pricing breakdown
        var breakdown = PricingCalculator.compute(
                mentor.getCallPrice(),
                UNIT_MINUTES,
                duration,
                mentor.getLongCallThresholdMinutes(),
                mentor.getLongCallDiscountPercent()
        );

        Booking booking = Booking.builder()
                .mentor(mentor)
                .learner(learner)
                .bookingTime(start)     // keep legacy field in sync
                .startTime(start)
                .endTime(end)
                .bookingType(bookingType.toUpperCase())
                .status("PENDING_PAYMENT")
                .durationMinutes(duration)
                .amount(breakdown.total())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        try {
            CreatePaymentResponse paymentResponse =
                    paymentService.createPaymentForBooking(savedBooking, learner);

            BookingResponse resp = toResponse(savedBooking);
            resp.setPaymentId(paymentResponse.getPaymentId());
            resp.setClientSecret(paymentResponse.getClientSecret());
            resp.setAmount(paymentResponse.getAmount());
            resp.setCurrency(paymentResponse.getCurrency());
            resp.setStatus("PENDING_PAYMENT");

            resp.setDurationMinutes(duration);
            resp.setUnitMinutes(UNIT_MINUTES);
            resp.setUnitPrice(breakdown.unitPrice());
            resp.setSubtotal(breakdown.subtotal());
            resp.setLongCallDiscountPercent(breakdown.discountPercent());
            resp.setDiscountAmount(breakdown.discountAmount());
            resp.setTotalAmount(breakdown.total());
            return resp;

        } catch (StripeException e) {
            throw new BookingException("Error initiating payment: " + e.getMessage());
        }
    }

    /**
     * Mentor updates a booking’s status (Confirm / Cancel).
     */
    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, UpdateBookingStatusRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        String newStatus = request.getNewStatus().toUpperCase();
        booking.setUpdatedAt(Instant.now());

        // handle mentor-level decisions: ACCEPT or DENY
        if ("ACCEPTED".equals(newStatus) || "CONFIRMED".equals(newStatus)) {
            // Mentor accepted the paid booking → confirm and create session
            booking.setStatus("CONFIRMED");
            Booking saved = bookingRepository.save(booking);

            // ensure session exists
            if (sessionRepository.findByBookingId(saved.getId()).isEmpty()) {
                createSessionForBooking(saved);
            }

            // finalize mentor payout — find payment and mark payout
            paymentRepository.findByBooking(saved).ifPresent(payment -> {
                try {
                    // PaymentService should provide finalization helper that credits mentor wallet & logs txn
                    paymentService.finalizeMentorPayout(payment.getId());
                } catch (Exception e) {
                    log.error("Failed to finalize mentor payout for payment {}: {}", payment.getId(), e.getMessage(), e);

                }
            });

            bookingChatSyncService.syncChatPermissionForPair(
                    saved.getLearner().getUserId(),
                    saved.getMentor().getMentorId(),
                    "MENTOR_UPDATE_STATUS_ACCEPT",
                    saved.getId()
            );


            return toResponse(saved);
        }

        if ("DENIED".equals(newStatus) || "REJECTED".equals(newStatus)) {
            // Mentor denied the paid booking → refund and cancel booking
            booking.setStatus("CANCELLED"); // or "DENIED" if you prefer a separate state
            Booking saved = bookingRepository.save(booking);

            // refund if payment exists and succeeded or pending (refund full amount)
            paymentRepository.findByBooking(saved).ifPresent(payment -> {
                try {
                    // If payment succeeded -> refund full amount. If still pending -> attempt cancel / refund
                    paymentService.processRefund(payment.getId(), payment.getAmount(), "MENTOR_DENIED");
                } catch (Exception e) {
                    log.error("Failed to refund payment {} after mentor denial: {}", payment.getId(), e.getMessage(), e);
                }
            });

            // cancel any existing session
            sessionRepository.findByBookingId(saved.getId()).ifPresent(session -> {
                if (session.getStatus() != SessionStatus.COMPLETED) {
                    session.setStatus(SessionStatus.CANCELLED);
                    session.setUpdatedAt(Instant.now());
                    sessionRepository.save(session);
                } else {
                    // cannot cancel completed session
                    throw new BookingException("Cannot deny a booking with a completed session");
                }
            });

            bookingChatSyncService.syncChatPermissionForPair(
                    saved.getLearner().getUserId(),
                    saved.getMentor().getMentorId(),
                    "MENTOR_UPDATE_STATUS_DENY",
                    saved.getId()
            );


            return toResponse(saved);
        }

        // default: set new status (legacy support)
        booking.setStatus(newStatus);
        Booking saved = bookingRepository.save(booking);

//        // legacy: if mentor CONFIRMED manually (non-paid flow), ensure session
//        if ("CONFIRMED".equals(newStatus) && sessionRepository.findByBookingId(saved.getId()).isEmpty()) {
//            createSessionForBooking(saved);
//        }

        // handle cancellation
//        if ("CANCELLED".equals(newStatus)) {
//            sessionRepository.findByBookingId(saved.getId()).ifPresent(session -> {
//                if (session.getStatus() == SessionStatus.COMPLETED) {
//                    throw new BookingException("Cannot cancel a completed session");
//                }
//                session.setStatus(SessionStatus.CANCELLED);
//                session.setUpdatedAt(Instant.now());
//                sessionRepository.save(session);
//            });
//        }
        bookingChatSyncService.syncChatPermissionForPair(
                saved.getLearner().getUserId(),
                saved.getMentor().getMentorId(),
                "MENTOR_UPDATE_STATUS_GENERIC",
                saved.getId()
        );

        return toResponse(saved);
    }


    @Override
    public List<BookingResponse> getBookingsForLearner(Long learnerId) {
        return bookingRepository.findByLearner_UserId(learnerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getBookingsForMentor(Long mentorId) {
        return bookingRepository.findByMentor_MentorId(mentorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Create a Session row for a confirmed booking.
     * Daily.co integration:
     *  - We only mark provider = "DAILY" here.
     *  - Actual Daily room + token are created lazily when user hits /api/sessions/{id}/join.
     */
    private void createSessionForBooking(Booking booking) {
        if (sessionRepository.findByBookingId(booking.getId()).isPresent()) {
            return;
        }

        int duration = booking.getDurationMinutes() != null
                ? booking.getDurationMinutes()
                : DEFAULT_DURATION_MINUTES;

        Session session = Session.builder()
                .booking(booking)
                .mentor(booking.getMentor())
                .learner(booking.getLearner())
                .startTime(booking.getBookingTime())
                .endTime(booking.getBookingTime().plusSeconds(duration * 60L))
                .status(SessionStatus.CONFIRMED)
                .meetingProvider("DAILY")  // 🔁 switched from JITSI → DAILY
                .meetingLink(null)         // 🔁 Daily room URL will be set on first join
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        sessionRepository.save(session);
    }


    /**
     * Map Booking entity → enriched BookingResponse DTO
     */
    private BookingResponse toResponse(Booking booking) {
        BookingResponse resp = new BookingResponse();

        // --- Booking basics ---
        resp.setBookingId(booking.getId());
        resp.setStatus(booking.getStatus());
        resp.setBookingType(booking.getBookingType());
        resp.setBookingTime(booking.getBookingTime());
        resp.setDurationMinutes(booking.getDurationMinutes());

        // --- Mentor ---
        if (booking.getMentor() != null) {
            resp.setMentorId(booking.getMentor().getMentorId());
            if (booking.getMentor().getUser() != null) {
                resp.setMentorName(booking.getMentor().getUser().getName());
            }
        }

        // --- Learner ---
        if (booking.getLearner() != null) {
            resp.setLearnerId(booking.getLearner().getUserId());
            resp.setLearnerName(booking.getLearner().getName());
        }

        // --- Payment info (nullable if not created yet) ---
        resp.setPaymentId(booking.getPayment() != null ? booking.getPayment().getId() : null);
        resp.setClientSecret(booking.getClientSecret()); // may be null if not yet set
        resp.setAmount(booking.getAmount());             // total charged (if known)
        resp.setCurrency(booking.getCurrency());
        resp.setStartTime(booking.getStartTime());
        resp.setEndTime(booking.getEndTime());

        // --- Pricing breakdown (fill from backend) ---
        final int UNIT_MINUTES = 15;
        resp.setUnitMinutes(UNIT_MINUTES);

        BigDecimal unitPrice = (booking.getMentor() != null) ? booking.getMentor().getCallPrice() : null;
        resp.setUnitPrice(unitPrice);

        Integer duration = booking.getDurationMinutes();
        Integer threshold = (booking.getMentor() != null) ? booking.getMentor().getLongCallThresholdMinutes() : null;
        BigDecimal configPercent = (booking.getMentor() != null) ? booking.getMentor().getLongCallDiscountPercent() : null;

        BigDecimal subtotal = null;
        BigDecimal discountPercentOut = null;
        BigDecimal discountAmountOut = null;
        BigDecimal totalOut = booking.getAmount(); // prefer stored amount if present

        if (unitPrice != null && duration != null && duration >= UNIT_MINUTES && duration % UNIT_MINUTES == 0) {
            int units = duration / UNIT_MINUTES;

            subtotal = unitPrice.multiply(BigDecimal.valueOf(units))
                    .setScale(2, RoundingMode.HALF_UP);

            boolean thresholdMet = (threshold != null && duration >= threshold);
            boolean hasConfigPercent = (configPercent != null && configPercent.compareTo(BigDecimal.ZERO) > 0);

            if (subtotal.compareTo(BigDecimal.ZERO) > 0) {
                if (totalOut != null) {
                    // We already have a stored total (e.g., at create time) — derive discount from it
                    BigDecimal derivedDiscount = subtotal.subtract(totalOut).setScale(2, RoundingMode.HALF_UP);
                    if (derivedDiscount.compareTo(BigDecimal.ZERO) < 0) {
                        derivedDiscount = BigDecimal.ZERO; // no negative discounts
                    }
                    discountAmountOut = derivedDiscount;

                    // If subtotal > 0, compute an effective percent
                    discountPercentOut = derivedDiscount
                            .multiply(BigDecimal.valueOf(100))
                            .divide(subtotal, 2, RoundingMode.HALF_UP);

                    // If threshold not met, keep percent at 0
                    if (!thresholdMet) {
                        discountPercentOut = BigDecimal.ZERO;
                    }
                } else {
                    // No stored total — compute using current config
                    if (thresholdMet && hasConfigPercent) {
                        BigDecimal calcDiscount = subtotal.multiply(configPercent)
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                        BigDecimal calcTotal = subtotal.subtract(calcDiscount).setScale(2, RoundingMode.HALF_UP);

                        discountPercentOut = configPercent.setScale(2, RoundingMode.HALF_UP);
                        discountAmountOut = calcDiscount;
                        totalOut = calcTotal;
                    } else {
                        // No discount applies
                        discountPercentOut = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                        discountAmountOut = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                        totalOut = subtotal;
                    }
                }
            }
        }

        // set computed breakdown (null-safe)
        resp.setSubtotal(subtotal);
        resp.setLongCallDiscountPercent(discountPercentOut);
        resp.setDiscountAmount(discountAmountOut);
        resp.setTotalAmount(totalOut);

        // also mirror total back to top-level amount if it was missing
        if (resp.getAmount() == null && totalOut != null) {
            resp.setAmount(totalOut);
        }

        return resp;
    }

    @Override
    @Transactional
    public BookingResponse cancelByLearner(Long bookingId, User learner, RefundDestination dest, String userReason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        // ✅ ownership
        if (booking.getLearner() == null || !booking.getLearner().getUserId().equals(learner.getUserId())) {
            throw new BookingException("You can only cancel your own bookings");
        }

        // ✅ already cancelled?
        String status = booking.getStatus() == null ? "" : booking.getStatus();
        if ("CANCELLED".equalsIgnoreCase(status) || "CANCELLED_BY_LEARNER".equalsIgnoreCase(status)) {
            throw new BookingException("Booking is already cancelled");
        }

        // --- derive times (prefer new fields) ---
        Instant start = booking.getStartTime() != null ? booking.getStartTime() : booking.getBookingTime();
        Instant end   = booking.getEndTime()   != null ? booking.getEndTime()   : start.plusSeconds(
                (booking.getDurationMinutes() != null ? booking.getDurationMinutes() : 30) * 60L);

        // =========================================================
        // 1) Remove any existing session (hard delete if not COMPLETED)
        // =========================================================
        var sessionOpt = sessionRepository.findByBookingId(booking.getId());
        boolean sessionExisted = false;
        if (sessionOpt.isPresent()) {
            Session s = sessionOpt.get();
            sessionExisted = true;
            if (s.getStatus() == SessionStatus.COMPLETED) {
                throw new BookingException("Cannot cancel a booking with a completed session");
            }
            sessionRepository.delete(s); // 🗑️ hard delete as requested
        }

        // =========================================================
        // 2) Refund policy
        //    - If NO session existed -> NO refund (your rule).
        //    - If time has already started/passed (now >= start) -> NO refund.
        //    - Else apply tiered refunds.
        // =========================================================
        BigDecimal refundedOut = null;
        Instant now = Instant.now();

        boolean timePassedOrStarted = !now.isBefore(start); // now >= start
        if (!sessionExisted || timePassedOrStarted) {
            // No refund path (either no session existed OR session time already started/passed)
            // Do NOT touch Stripe or wallet.
            refundedOut = BigDecimal.ZERO;
        } else {
            // Session existed and future start => tiered refund requires successful payment & no mentor payout.
            var paymentOpt = paymentRepository.findByBooking(booking);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();

                if (!"SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
                    // Payment not successful => no refund / no money movement
                    refundedOut = null;
                } else {
                    if (Boolean.TRUE.equals(payment.isMentorPayoutProcessed())) {
                        throw new BookingException("Cancellation not allowed after mentor payout; please contact support");
                    }

                    long minutesToStart = Duration.between(now, start).toMinutes(); // positive (we're in future branch)
                    int refundPercent;
                    if (minutesToStart >= 360) {           // >= 6 hours
                        refundPercent = 100;
                    } else if (minutesToStart >= 60) {     // 1–5 hours
                        refundPercent = 90;
                    } else {                               // < 1 hour
                        refundPercent = 50;
                    }

                    BigDecimal base = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
                    BigDecimal refundAmount = base
                            .multiply(BigDecimal.valueOf(refundPercent))
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                    String reason = (userReason == null || userReason.isBlank())
                            ? ("LEARNER_CANCEL(" + refundPercent + "%)")
                            : ("LEARNER_CANCEL(" + refundPercent + "%): " + userReason);

                    if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                        // Execute refund path
                        try {
                            if (dest == RefundDestination.ORIGINAL_PAYMENT) {
                                paymentService.processRefund(payment.getId(), refundAmount, reason);
                            } else if (dest == RefundDestination.WALLET) {
                                walletService.creditWallet(booking.getLearner(), refundAmount, "REFUND_LEARNER_CANCELLATION");
                                payment.setStatus("REFUNDED");
                                payment.setRefundReason(reason);
                                payment.setUpdatedAt(Instant.now());
                                paymentRepository.save(payment);
                            } else {
                                throw new BookingException("Unsupported refund destination");
                            }
                            refundedOut = refundAmount;
                        } catch (Exception e) {
                            throw new BookingException("Refund failed: " + e.getMessage(), e);
                        }
                    } else {
                        // Tier computed to 0% (shouldn't happen in this branch, but safe-guard)
                        refundedOut = BigDecimal.ZERO;
                    }
                }
            } else {
                // No payment record -> no money movement
                refundedOut = null;
            }
        }

        // =========================================================
        // 3) Mark booking cancelled (by learner)
        // =========================================================
        booking.setStatus("CANCELLED_BY_LEARNER");
        booking.setUpdatedAt(Instant.now());
        bookingRepository.saveAndFlush(booking);
        bookingRepository.saveAndFlush(booking);

        bookingChatSyncService.syncChatPermissionForPair(
                learner.getUserId(),
                booking.getMentor().getMentorId(),
                "CANCEL_BY_LEARNER",
                booking.getId()
        );

        // =========================================================
        // 4) Respond
        // =========================================================
        BookingResponse response = toResponse(booking);
        response.setRefundedAmount(refundedOut);
        return response;
    }



}
