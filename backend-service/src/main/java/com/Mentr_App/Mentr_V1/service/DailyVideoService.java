package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.session.DailyJoinInfo;
import com.Mentr_App.Mentr_V1.model.Session;
import com.Mentr_App.Mentr_V1.model.User;

/**
 * DAILY VIDEO SERVICE
 * -------------------
 * Encapsulates all interactions with Daily.co:
 *  - create rooms (lazy per session)
 *  - create access tokens for mentor / learner
 */
public interface DailyVideoService {

    /**
     * Ensure a Daily room exists for the given session, and
     * create an access token for the given user.
     *
     * Contract:
     *  - Room name = "session-{sessionId}"
     *  - Session.meetingProvider will be set to "DAILY"
     *  - Session.meetingLink will be set to the room URL
     *
     * @param session   session entity
     * @param user      current caller
     * @param isMentor  true if caller is mentor side
     * @return DailyJoinInfo with room URL + token
     */
    DailyJoinInfo ensureRoomAndToken(Session session, User user, boolean isMentor);


    // NEW: update exp if room already created
    void updateRoomExpiryIfExists(Session session);
}

