package com.Mentr_App.Mentr_V1.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled job that auto-ends sessions whose endTime has already passed.
 *
 * Product flow alignment:
 *  - Prevents "zombie" calls where:
 *      • Session.status stays CONFIRMED forever
 *      • Mentor presence remains IN_CALL
 *  - Every 30 seconds:
 *      • Delegates to SessionService.autoEndOverdueSessions()
 *      • That method:
 *          - Finds CONFIRMED sessions with endTime <= now
 *          - Marks them COMPLETED
 *          - Updates mentor presence from IN_CALL → LIVE/OFFLINE
 *
 * Requirements:
 *  - @EnableScheduling must be enabled in your Spring Boot app configuration.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionAutoEndScheduler {

    private final SessionService sessionService;

    /**
     * Runs every 30 seconds.
     * Adjust fixedDelay if you want finer control over when calls auto-end.
     */
    @Scheduled(fixedDelay = 30_000L)
    public void autoEndSessions() {
        try {
            sessionService.autoEndOverdueSessions();
        } catch (Exception ex) {
            log.error("Failed to auto-end overdue sessions", ex);
        }
    }
}

