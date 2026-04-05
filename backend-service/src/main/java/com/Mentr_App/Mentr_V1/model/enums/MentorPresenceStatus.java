package com.Mentr_App.Mentr_V1.model.enums;


/**
 * MENTOR PRESENCE STATUS ENUM (Talk Now)
 * --------------------------------------
 * Represents real-time Talk Now presence for a mentor.
 *
 * OFFLINE  - Mentor is not available for Talk Now.
 * LIVE     - Mentor is visible as "online" and can receive Talk Now requests.
 * RINGING  - One learner has paid; mentor is seeing a ringing popup.
 * IN_CALL  - Mentor is currently on an active Talk Now session.
 *
 * Product Flow alignment:
 *  - Exposed in MentorProfileResponse / MentorSearchResponse.
 *  - Controlled via MentorPresence + MentorPresenceService.
 */
public enum MentorPresenceStatus {
    OFFLINE,
    LIVE,
    RINGING,
    IN_CALL
}

