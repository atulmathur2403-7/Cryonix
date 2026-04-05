package com.Mentr_App.Mentr_V1.dto.chat;



import com.Mentr_App.Mentr_V1.model.enums.EligibilityReason;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatEligibilityResponse {

    private boolean eligible;
    private EligibilityReason reason;

    private Long learnerId;
    private Long mentorId;

    /**
     * Optional: last booking that made them eligible (or null).
     */
    private Long latestBookingId;

    /**
     * Whether the ChatConversation row is currently enabled.
     * This can be false even if eligible (e.g. admin temporarily disabled).
     */
    private boolean conversationEnabled;
}


