package com.Mentr_App.Mentr_V1.dto.chat;


import com.Mentr_App.Mentr_V1.model.enums.EligibilityReason;
import com.Mentr_App.Mentr_V1.model.enums.PhoneNumberPolicyMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationAccessResponse {

    // -------------------------------------------------
    // Eligibility / state
    // -------------------------------------------------

    /**
     * True when learner↔mentor are allowed to chat
     * according to booking / block rules.
     */
    private boolean eligible;

    /**
     * Enum reason describing why the pair is (or is not) eligible.
     */
    private EligibilityReason reason;

    /**
     * True when conversation is currently enabled
     * (BookingChatSyncService + block rules).
     */
    private boolean conversationEnabled;

    /**
     * Hard block flag (admin / abuse).
     */
    private boolean blocked;

    /**
     * Human-readable reason why chat is disabled for this pair.
     * Mirrors ChatConversation.disabledReason and is also pushed
     * to Firestore as "disabledReason".
     *
     * Examples:
     *  - "NO_VALID_BOOKINGS"
     *  - "BLOCKED"
     *  - "CONVERSATION_DISABLED"
     */
    private String disabledReason;

    // -------------------------------------------------
    // Pair identity / booking context
    // -------------------------------------------------

    private Long learnerId;
    private Long mentorId;

    /**
     * Last booking id that influenced the eligibility decision,
     * if any.
     */
    private Long bookingId;

    // -------------------------------------------------
    // Conversation identity (Firestore)
    // -------------------------------------------------

    /**
     * Deterministic conversation id, e.g. "m{mentorId}_u{learnerUserId}".
     */
    private String conversationId;

    // -------------------------------------------------
    // Firebase identity
    // -------------------------------------------------

    /**
     * Role of the caller in this conversation:
     *  - "LEARNER"
     *  - "MENTOR"
     */
    private String currentUserRole;

    /**
     * Firebase uid of the caller.
     * Typically String.valueOf(userId).
     */
    private String currentUserFirebaseUid;

    /**
     * Firebase uid for learner side (String.valueOf(learnerUserId)).
     */
    private String learnerFirebaseUid;

    /**
     * Firebase uid for mentor side (String.valueOf(mentorUserId)).
     */
    private String mentorFirebaseUid;

    // -------------------------------------------------
    // Convenience info for UI
    // -------------------------------------------------

    private String learnerName;
    private String learnerAvatar;
    private String mentorName;
    private String mentorAvatar;

    // -------------------------------------------------
    // Firebase bootstrap
    // -------------------------------------------------

    /**
     * Short-lived Firebase custom token for the caller.
     */
    private String firebaseCustomToken;

    // -------------------------------------------------
    // Content policy
    // -------------------------------------------------

    /**
     * Phone number policy (MASK or BLOCK).
     */
    private PhoneNumberPolicyMode phoneNumberPolicyMode;
}
