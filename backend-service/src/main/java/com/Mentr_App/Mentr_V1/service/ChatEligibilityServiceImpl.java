package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.dto.chat.ChatEligibilityResponse;
import com.Mentr_App.Mentr_V1.model.Booking;
import com.Mentr_App.Mentr_V1.model.ChatConversation;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.model.enums.EligibilityReason;
import com.Mentr_App.Mentr_V1.repository.BookingRepository;
import com.Mentr_App.Mentr_V1.repository.ChatConversationRepository;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatEligibilityServiceImpl implements ChatEligibilityService {

    private final UserRepository userRepository;
    private final MentorRepository mentorRepository;
    private final BookingRepository bookingRepository;
    private final ChatConversationRepository chatConversationRepository;

    // Booking statuses that make a pair chat-eligible
    private static final List<String> VALID_BOOKING_STATUSES = List.of(
            "CONFIRMED",
            "COMPLETED"
    );

    @Override
    public ChatEligibilityResponse checkEligibility(Long learnerUserId, Long mentorId) {
        // 1) Ensure learner exists
        Optional<User> learnerOpt = userRepository.findById(learnerUserId);
        if (learnerOpt.isEmpty()) {
            return ChatEligibilityResponse.builder()
                    .learnerId(learnerUserId)
                    .mentorId(mentorId)
                    .eligible(false)
                    .conversationEnabled(false)
                    .reason(EligibilityReason.LEARNER_NOT_FOUND)
                    .build();
        }

        // 2) Ensure mentor exists
        Optional<Mentor> mentorOpt = mentorRepository.findById(mentorId);
        if (mentorOpt.isEmpty()) {
            return ChatEligibilityResponse.builder()
                    .learnerId(learnerUserId)
                    .mentorId(mentorId)
                    .eligible(false)
                    .conversationEnabled(false)
                    .reason(EligibilityReason.MENTOR_NOT_FOUND)
                    .build();
        }

        // 3) Look up conversation row if present
        Optional<ChatConversation> conversationOpt =
                chatConversationRepository.findByLearner_UserIdAndMentor_MentorId(learnerUserId, mentorId);




        if (conversationOpt.isPresent()) {
            ChatConversation conv = conversationOpt.get();
            if (conv.isBlocked()) {
                return ChatEligibilityResponse.builder()
                        .learnerId(learnerUserId)
                        .mentorId(mentorId)
                        .eligible(false)
                        .conversationEnabled(false)
                        .reason(EligibilityReason.BLOCKED)
                        .latestBookingId(conv.getLastBookingId())
                        .build();
            }
            if (!conv.isEnabled()) {
                return ChatEligibilityResponse.builder()
                        .learnerId(learnerUserId)
                        .mentorId(mentorId)
                        .eligible(false)
                        .conversationEnabled(false)
                        .reason(EligibilityReason.CONVERSATION_DISABLED)
                        .latestBookingId(conv.getLastBookingId())
                        .build();
            }
        }

        // 4) Check bookings (FCFS rules already handled in BookingService/PaymentService)
        boolean hasValidBooking = bookingRepository.existsValidBookingBetween(
                learnerUserId,
                mentorId,
                VALID_BOOKING_STATUSES.stream().map(String::toUpperCase).toList()
        );

        var latestBookingOpt = bookingRepository.findLatestValidBookingBetween(
                learnerUserId,
                mentorId,
                VALID_BOOKING_STATUSES.stream().map(String::toUpperCase).toList()
        );

        // inside the eligible branch:
        Long latestBookingId = latestBookingOpt.map(Booking::getId).orElse(null);

        if (!hasValidBooking) {
            return ChatEligibilityResponse.builder()
                    .learnerId(learnerUserId)
                    .mentorId(mentorId)
                    .eligible(false)
                    .conversationEnabled(false)
                    .reason(EligibilityReason.NO_VALID_BOOKINGS)
                    .latestBookingId(latestBookingId)
                    .build();
        }

        // 5) Eligible 🎉
        return ChatEligibilityResponse.builder()
                .learnerId(learnerUserId)
                .mentorId(mentorId)
                .eligible(true)
                .conversationEnabled(true)
                .reason(EligibilityReason.ELIGIBLE)
                .latestBookingId(latestBookingId)
                .build();
    }
}
