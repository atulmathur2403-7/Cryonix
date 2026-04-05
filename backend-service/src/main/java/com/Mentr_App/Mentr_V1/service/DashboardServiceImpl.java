package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.dto.availability.AvailabilityResponse;
import com.Mentr_App.Mentr_V1.dto.booking.BookingResponse;
import com.Mentr_App.Mentr_V1.dto.common.PagedResponse;
import com.Mentr_App.Mentr_V1.dto.dashboard.*;
import com.Mentr_App.Mentr_V1.dto.session.SessionResponse;
import com.Mentr_App.Mentr_V1.model.AvailabilitySlot;
import com.Mentr_App.Mentr_V1.model.Booking;
import com.Mentr_App.Mentr_V1.model.Session;
import com.Mentr_App.Mentr_V1.repository.AvailabilityRepository;
import com.Mentr_App.Mentr_V1.repository.BookingRepository;
import com.Mentr_App.Mentr_V1.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AvailabilityRepository availabilityRepository;
    private final BookingRepository bookingRepository;
    private final SessionRepository sessionRepository;

    @Override
    public PagedResponse<MentorSessionsDashboardResponse> getMentorDashboardSessions(Long mentorId, int page, int size) {
        Page<Session> sessionsPage = sessionRepository.findByMentor_MentorIdOrderByStartTimeDesc(
                mentorId, PageRequest.of(page, size));

        MentorSessionsDashboardResponse resp = new MentorSessionsDashboardResponse();
        // Sessions (paginated)
        resp.setSessions(
                sessionsPage.stream()
                        .map(s -> {
                            SessionResponse dto = new SessionResponse();
                            dto.setSessionId(s.getId());
                            dto.setBookingId(s.getBooking() != null ? s.getBooking().getId() : null);
                            dto.setStartTime(s.getStartTime());
                            dto.setEndTime(s.getEndTime());
                            dto.setStatus(s.getStatus());
                            dto.setMeetingLink(s.getMeetingLink());
                            dto.setRecordingLink(s.getRecordingLink());

                            // Mentor info
                            if (s.getMentor() != null && s.getMentor().getUser() != null) {
                                dto.setMentorId(s.getMentor().getMentorId());
                                dto.setMentorName(s.getMentor().getUser().getName());
                            }

                            // Learner info
                            if (s.getLearner() != null) {
                                dto.setLearnerId(s.getLearner().getUserId());
                                dto.setLearnerName(s.getLearner().getName());
                            }
                            return dto;
                        })
                        .collect(Collectors.toList())
        );

        return new PagedResponse<>(
                java.util.List.of(resp),
                sessionsPage.getNumber(),
                sessionsPage.getSize(),
                sessionsPage.getTotalElements(),
                sessionsPage.getTotalPages(),
                sessionsPage.isLast()
        );
    }

    @Override
    public PagedResponse<MentorBookingsDashboardResponse> getMentorDashboardBookings(Long mentorId, int page, int size) {
        Page<Booking> bookingsPage = bookingRepository.findByMentor_MentorId(
                mentorId, PageRequest.of(page, size));

        MentorBookingsDashboardResponse resp = new MentorBookingsDashboardResponse();

        // Bookings (paginated)
        resp.setBookings(
                bookingsPage.stream()
                        .map(b -> {
                            BookingResponse dto = new BookingResponse();

                            // --- basics ---
                            dto.setBookingId(b.getId());
                            dto.setBookingTime(b.getBookingTime());
                            dto.setBookingType(b.getBookingType());
                            dto.setStatus(b.getStatus());
                            dto.setDurationMinutes(b.getDurationMinutes());

                            // --- mentor ---
                            if (b.getMentor() != null) {
                                dto.setMentorId(b.getMentor().getMentorId());
                                if (b.getMentor().getUser() != null) {
                                    dto.setMentorName(b.getMentor().getUser().getName());
                                }
                            }

                            // --- learner ---
                            if (b.getLearner() != null) {
                                dto.setLearnerId(b.getLearner().getUserId());
                                dto.setLearnerName(b.getLearner().getName());
                            }

                            // --- payment (null-safe) ---
                            dto.setPaymentId(b.getPayment() != null ? b.getPayment().getId() : null);
                            dto.setClientSecret(b.getClientSecret());
                            dto.setAmount(b.getAmount());
                            dto.setCurrency(b.getCurrency());

                            // --- pricing breakdown (fill from backend) ---
                            final int UNIT_MINUTES = 15;
                            dto.setUnitMinutes(UNIT_MINUTES);

                            BigDecimal unitPrice = (b.getMentor() != null) ? b.getMentor().getCallPrice() : null;
                            dto.setUnitPrice(unitPrice);

                            Integer duration = b.getDurationMinutes();
                            Integer threshold = (b.getMentor() != null) ? b.getMentor().getLongCallThresholdMinutes() : null;
                            BigDecimal configPercent = (b.getMentor() != null) ? b.getMentor().getLongCallDiscountPercent() : null;

                            BigDecimal subtotal = null;
                            BigDecimal discountPercentOut = null;
                            BigDecimal discountAmountOut = null;
                            BigDecimal totalOut = b.getAmount(); // prefer stored total if present

                            if (unitPrice != null && duration != null && duration >= UNIT_MINUTES && duration % UNIT_MINUTES == 0) {
                                int units = duration / UNIT_MINUTES;

                                subtotal = unitPrice.multiply(BigDecimal.valueOf(units))
                                        .setScale(2, RoundingMode.HALF_UP);

                                boolean thresholdMet = (threshold != null && duration >= threshold);
                                boolean hasConfigPercent = (configPercent != null && configPercent.compareTo(BigDecimal.ZERO) > 0);

                                if (subtotal.compareTo(BigDecimal.ZERO) > 0) {
                                    if (totalOut != null) {
                                        // derive discount from stored total (ensures consistency with what was charged)
                                        BigDecimal derivedDiscount = subtotal.subtract(totalOut).setScale(2, RoundingMode.HALF_UP);
                                        if (derivedDiscount.compareTo(BigDecimal.ZERO) < 0) {
                                            derivedDiscount = BigDecimal.ZERO;
                                        }
                                        discountAmountOut = derivedDiscount;

                                        discountPercentOut = derivedDiscount
                                                .multiply(BigDecimal.valueOf(100))
                                                .divide(subtotal, 2, RoundingMode.HALF_UP);

                                        if (!thresholdMet) {
                                            discountPercentOut = BigDecimal.ZERO;
                                        }
                                    } else {
                                        // compute now using current config
                                        if (thresholdMet && hasConfigPercent) {
                                            BigDecimal calcDiscount = subtotal.multiply(configPercent)
                                                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                                            BigDecimal calcTotal = subtotal.subtract(calcDiscount).setScale(2, RoundingMode.HALF_UP);

                                            discountPercentOut = configPercent.setScale(2, RoundingMode.HALF_UP);
                                            discountAmountOut = calcDiscount;
                                            totalOut = calcTotal;
                                        } else {
                                            discountPercentOut = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                                            discountAmountOut = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                                            totalOut = subtotal;
                                        }
                                    }
                                }
                            }

                            dto.setSubtotal(subtotal);
                            dto.setLongCallDiscountPercent(discountPercentOut);
                            dto.setDiscountAmount(discountAmountOut);
                            dto.setTotalAmount(totalOut);
                            dto.setStartTime(b.getStartTime());
                            dto.setEndTime(b.getEndTime());

                            if (dto.getAmount() == null && totalOut != null) {
                                dto.setAmount(totalOut);
                            }

                            return dto;
                        })
                        .collect(Collectors.toList())
        );

        return new PagedResponse<>(
                java.util.List.of(resp),
                bookingsPage.getNumber(),
                bookingsPage.getSize(),
                bookingsPage.getTotalElements(),
                bookingsPage.getTotalPages(),
                bookingsPage.isLast()
        );
    }


    @Override
    public PagedResponse<MentorAvailabilityDashboardResponse> getMentorDashboardAvailabilityTime(Long mentorId, int page, int size) {
        Page<AvailabilitySlot> slotsPage = availabilityRepository.findByMentor_MentorIdOrderByStartTimeAsc(
                mentorId, PageRequest.of(page, size));

        MentorAvailabilityDashboardResponse resp = new MentorAvailabilityDashboardResponse();
        // Availability (paginated)
        resp.setAvailabilitySlots(
                slotsPage.stream()
                        .map(slot -> {
                            AvailabilityResponse dto = new AvailabilityResponse();
                            dto.setId(slot.getId());
                            dto.setStartTime(slot.getStartTime());
                            dto.setEndTime(slot.getEndTime());
                            dto.setBlocked(slot.isBlocked());
                            return dto;
                        })
                        .collect(Collectors.toList())
        );

        return new PagedResponse<>(
                java.util.List.of(resp),
                slotsPage.getNumber(),
                slotsPage.getSize(),
                slotsPage.getTotalElements(),
                slotsPage.getTotalPages(),
                slotsPage.isLast()
        );
    }

    @Override
    public PagedResponse<LearnerBookingsDashboardResponse> getLearnerDashboardBookings(Long learnerId, int page, int size) {
        Page<Booking> bookingsPage = bookingRepository.findByLearner_UserId(
                learnerId, PageRequest.of(page, size));

        LearnerBookingsDashboardResponse resp = new LearnerBookingsDashboardResponse();

        resp.setBookings(
                bookingsPage.stream()
                        .map(b -> {
                            BookingResponse dto = new BookingResponse();

                            // --- basics ---
                            dto.setBookingId(b.getId());
                            dto.setBookingTime(b.getBookingTime());
                            dto.setBookingType(b.getBookingType());
                            dto.setStatus(b.getStatus());
                            dto.setDurationMinutes(b.getDurationMinutes());

                            // --- mentor ---
                            if (b.getMentor() != null) {
                                dto.setMentorId(b.getMentor().getMentorId());
                                if (b.getMentor().getUser() != null) {
                                    dto.setMentorName(b.getMentor().getUser().getName());
                                }
                            }

                            // --- learner ---
                            if (b.getLearner() != null) {
                                dto.setLearnerId(b.getLearner().getUserId());
                                dto.setLearnerName(b.getLearner().getName());
                            }

                            // --- payment (null-safe) ---
                            dto.setPaymentId(b.getPayment() != null ? b.getPayment().getId() : null);
                            dto.setClientSecret(b.getClientSecret());
                            dto.setAmount(b.getAmount());
                            dto.setCurrency(b.getCurrency());

                            /* ✅ NEW: expose refunded amount on dashboard if it exists.
                            Logic:
                            1) Prefer Payment.refundedAmount (if your Payment entity has it).
                            2) Else, if status indicates refunded, fall back to full amount. */
                            if (b.getPayment() != null) {
                                var p = b.getPayment();
                                BigDecimal refunded = null;

                                // If you have a refundedAmount field on Payment, prefer it:
                                try {
                                    // uncomment if Payment has getRefundedAmount():
                                    // refunded = p.getRefundedAmount();
                                } catch (Exception ignored) {
                                }

                                if (refunded == null) {
                                    String ps = p.getStatus() == null ? "" : p.getStatus().toUpperCase();
                                    if ("REFUNDED".equals(ps) || "REFUNDED_TO_WALLET".equals(ps)) {
                                        // Fallback assumption = full refund (use amount charged)
                                        refunded = p.getAmount();
                                    }
                                }
                                dto.setRefundedAmount(refunded);
                            }
                            // --- pricing breakdown (backend-filled) ---
                            final int UNIT_MINUTES = 15;
                            dto.setUnitMinutes(UNIT_MINUTES);

                            BigDecimal unitPrice = (b.getMentor() != null) ? b.getMentor().getCallPrice() : null;
                            dto.setUnitPrice(unitPrice);

                            Integer duration = b.getDurationMinutes();
                            Integer threshold = (b.getMentor() != null) ? b.getMentor().getLongCallThresholdMinutes() : null;
                            BigDecimal configPercent = (b.getMentor() != null) ? b.getMentor().getLongCallDiscountPercent() : null;

                            BigDecimal subtotal = null;
                            BigDecimal discountPercentOut = null;
                            BigDecimal discountAmountOut = null;
                            BigDecimal totalOut = b.getAmount(); // prefer stored amount if present

                            if (unitPrice != null && duration != null && duration >= UNIT_MINUTES && duration % UNIT_MINUTES == 0) {
                                int units = duration / UNIT_MINUTES;

                                subtotal = unitPrice.multiply(BigDecimal.valueOf(units))
                                        .setScale(2, RoundingMode.HALF_UP);

                                boolean thresholdMet = (threshold != null && duration >= threshold);
                                boolean hasConfigPercent = (configPercent != null && configPercent.compareTo(BigDecimal.ZERO) > 0);

                                if (subtotal.compareTo(BigDecimal.ZERO) > 0) {
                                    if (totalOut != null) {
                                        // derive discount from stored total to match what was charged
                                        BigDecimal derivedDiscount = subtotal.subtract(totalOut).setScale(2, RoundingMode.HALF_UP);
                                        if (derivedDiscount.compareTo(BigDecimal.ZERO) < 0) derivedDiscount = BigDecimal.ZERO;

                                        discountAmountOut = derivedDiscount;
                                        discountPercentOut = (subtotal.compareTo(BigDecimal.ZERO) > 0)
                                                ? derivedDiscount.multiply(BigDecimal.valueOf(100))
                                                .divide(subtotal, 2, RoundingMode.HALF_UP)
                                                : BigDecimal.ZERO;

                                        if (!thresholdMet) discountPercentOut = BigDecimal.ZERO;
                                    } else {
                                        // compute now using current mentor config
                                        if (thresholdMet && hasConfigPercent) {
                                            BigDecimal calcDiscount = subtotal.multiply(configPercent)
                                                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                                            BigDecimal calcTotal = subtotal.subtract(calcDiscount).setScale(2, RoundingMode.HALF_UP);

                                            discountPercentOut = configPercent.setScale(2, RoundingMode.HALF_UP);
                                            discountAmountOut = calcDiscount;
                                            totalOut = calcTotal;
                                        } else {
                                            discountPercentOut = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                                            discountAmountOut = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                                            totalOut = subtotal;
                                        }
                                    }
                                }
                            }

                            dto.setSubtotal(subtotal);
                            dto.setLongCallDiscountPercent(discountPercentOut);
                            dto.setDiscountAmount(discountAmountOut);
                            dto.setTotalAmount(totalOut);
                            dto.setStartTime(b.getStartTime());
                            dto.setEndTime(b.getEndTime());

                            if (dto.getAmount() == null && totalOut != null) {
                                dto.setAmount(totalOut);
                            }

                            return dto;
                        })
                        .collect(Collectors.toList())
        );

        return new PagedResponse<>(
                java.util.List.of(resp),
                bookingsPage.getNumber(),
                bookingsPage.getSize(),
                bookingsPage.getTotalElements(),
                bookingsPage.getTotalPages(),
                bookingsPage.isLast()
        );
    }


    @Override
    public PagedResponse<LearnerSessionDashBoardResponse> getLearnerDashboardSessions(Long learnerId, int page, int size) {
        Page<Session> sessionsPage = sessionRepository.findByLearner_UserIdOrderByStartTimeDesc(
                learnerId, PageRequest.of(page, size));

        LearnerSessionDashBoardResponse resp = new LearnerSessionDashBoardResponse();
        // Sessions (paginated)
        resp.setSessions(
                sessionsPage.stream()
                        .map(s -> {
                            SessionResponse dto = new SessionResponse();
                            dto.setSessionId(s.getId());
                            dto.setBookingId(s.getBooking() != null ? s.getBooking().getId() : null);
                            dto.setStartTime(s.getStartTime());
                            dto.setEndTime(s.getEndTime());
                            dto.setStatus(s.getStatus());
                            dto.setMeetingLink(s.getMeetingLink());
                            dto.setRecordingLink(s.getRecordingLink());

                            // Mentor info
                            if (s.getMentor() != null && s.getMentor().getUser() != null) {
                                dto.setMentorId(s.getMentor().getMentorId());
                                dto.setMentorName(s.getMentor().getUser().getName());
                            }

                            // Learner info
                            if (s.getLearner() != null) {
                                dto.setLearnerId(s.getLearner().getUserId());
                                dto.setLearnerName(s.getLearner().getName());
                            }
                            return dto;
                        })
                        .collect(Collectors.toList())
        );

        return new PagedResponse<>(
                java.util.List.of(resp),
                sessionsPage.getNumber(),
                sessionsPage.getSize(),
                sessionsPage.getTotalElements(),
                sessionsPage.getTotalPages(),
                sessionsPage.isLast()
        );
    }
}
