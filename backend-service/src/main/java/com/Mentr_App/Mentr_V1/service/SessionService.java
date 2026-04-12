package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.dto.session.UpdateSessionStatusRequest;
import com.Mentr_App.Mentr_V1.dto.session.SessionResponse;

import java.util.List;

public interface SessionService {
    SessionResponse getSessionById(Long id);
    SessionResponse updateSessionStatus(Long id, UpdateSessionStatusRequest request);
    List<SessionResponse> getSessionsForMentor(Long mentorId);
    List<SessionResponse> getSessionsForLearner(Long learnerId);
    /**
     * Explicit "End Call" API.
     *
     * - Validates that the caller is either the mentor or learner linked to the session.
     * - Marks the session as COMPLETED if not already.
     * - Updates mentor presence:
     *      IN_CALL + same bookingId → LIVE or OFFLINE based on heartbeat.
     */
    SessionResponse endSession(Long sessionId, Long callerUserId);

    /**
     * Auto-end job entry point, invoked by a @Scheduled component.
     *
     * - Finds all CONFIRMED sessions where endTime <= now.
     * - Marks them as COMPLETED.
     * - Updates mentor presence accordingly.
     *
     *  This method is intentionally coarse-grained so the scheduler
     *  does not need repository-level knowledge.
     */
    void autoEndOverdueSessions();
}

