package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.mentor.MentorPresenceResponse;
import com.Mentr_App.Mentr_V1.model.Mentor;

/**
 * MENTOR PRESENCE SERVICE (Talk Now)
 * ----------------------------------
 * High-level operations for Talk Now presence:
 *  - goLive     : mentor marks themselves LIVE
 *  - goOffline  : mentor marks themselves OFFLINE
 *  - heartbeat  : periodic ping from dashboard while LIVE / IN_CALL
 *  - getPresence: read-only presence snapshot
 *
 * Product Flow:
 *  - Used by MentorController presence endpoints.
 */
public interface MentorPresenceService {

    MentorPresenceResponse goLive(Mentor mentor);

    MentorPresenceResponse goOffline(Mentor mentor);

    MentorPresenceResponse heartbeat(Mentor mentor);

    MentorPresenceResponse getPresence(Mentor mentor);
}

