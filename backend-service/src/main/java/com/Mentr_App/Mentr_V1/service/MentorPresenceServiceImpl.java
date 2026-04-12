package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.dto.mentor.MentorPresenceResponse;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.model.MentorPresence;
import com.Mentr_App.Mentr_V1.model.enums.MentorPresenceStatus;
import com.Mentr_App.Mentr_V1.repository.MentorPresenceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * MENTOR PRESENCE SERVICE IMPLEMENTATION
 * --------------------------------------
 * Implements Talk Now presence operations.
 *
 * Notes:
 *  - Always ensures a MentorPresence row exists ("getOrCreate").
 *  - Heartbeat is cheap: just updates lastHeartbeatAt.
 *  - Business logic (LIVE vs OFFLINE vs RINGING) is centralized here.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MentorPresenceServiceImpl implements MentorPresenceService {

    private final MentorPresenceRepository mentorPresenceRepository;

    /* ----------------- Internal helpers ----------------- */

    /**
     * Find or create a MentorPresence row for this mentor.
     */
    private MentorPresence getOrCreate(Mentor mentor) {
        return mentorPresenceRepository.findByMentor_MentorId(mentor.getMentorId())
                .orElseGet(() -> mentorPresenceRepository.save(
                        MentorPresence.builder()
                                .mentor(mentor)
                                .status(MentorPresenceStatus.OFFLINE)
                                .lastHeartbeatAt(Instant.now())
                                .build()
                ));
    }

    /* ----------------- Public API methods ----------------- */

    /**
     * Mentor taps "Enable Live" → mark as LIVE and clear any stale ringing.
     */
    @Override
    public MentorPresenceResponse goLive(Mentor mentor) {
        MentorPresence presence = getOrCreate(mentor);

        presence.setStatus(MentorPresenceStatus.LIVE);
        presence.setLastHeartbeatAt(Instant.now());
        presence.setRingExpiresAt(null);
        presence.setActiveBookingId(null);

        MentorPresence saved = mentorPresenceRepository.save(presence);

        log.info("👤 Mentor {} is now LIVE for Talk Now", mentor.getMentorId());
        return toResponse(saved);
    }

    /**
     * Mentor taps "Go Offline" → mark as OFFLINE and clear Talk Now state.
     */
    @Override
    public MentorPresenceResponse goOffline(Mentor mentor) {
        MentorPresence presence = getOrCreate(mentor);

        presence.setStatus(MentorPresenceStatus.OFFLINE);
        presence.setRingExpiresAt(null);
        presence.setActiveBookingId(null);

        MentorPresence saved = mentorPresenceRepository.save(presence);

        log.info("👤 Mentor {} is now OFFLINE for Talk Now", mentor.getMentorId());
        return toResponse(saved);
    }

    /**
     * Heartbeat from mentor dashboard while LIVE or IN_CALL.
     *
     * Frontend:
     *  - Call this every ~25–30s while presence badge is visible.
     */
    @Override
    public MentorPresenceResponse heartbeat(Mentor mentor) {
        MentorPresence presence = getOrCreate(mentor);
        presence.setLastHeartbeatAt(Instant.now());

        MentorPresence saved = mentorPresenceRepository.save(presence);
        return toResponse(saved);
    }

    /**
     * Read-only presence snapshot for a mentor.
     */
    @Override
    public MentorPresenceResponse getPresence(Mentor mentor) {
        MentorPresence presence = getOrCreate(mentor);
        return toResponse(presence);
    }

    /* ----------------- DTO mapping ----------------- */

    private MentorPresenceResponse toResponse(MentorPresence p) {
        MentorPresenceResponse dto = new MentorPresenceResponse();
        dto.setMentorId(p.getMentor().getMentorId());
        dto.setStatus(p.getStatus());
        dto.setActiveBookingId(p.getActiveBookingId());
        dto.setRingExpiresAt(p.getRingExpiresAt());
        dto.setLastHeartbeatAt(p.getLastHeartbeatAt());
        return dto;
    }
}

