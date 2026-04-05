package com.Mentr_App.Mentr_V1.controller;


import com.Mentr_App.Mentr_V1.model.Session;
import com.Mentr_App.Mentr_V1.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * DAILY WEBHOOK CONTROLLER
 * ------------------------
 * Receives events from Daily.co, currently:
 *  - recording.completed
 *
 * Contract:
 *  - Room name = "session-{sessionId}"
 *  - We extract sessionId from room_name and store recording link.
 *
 * Note:
 *  - Signature verification with X-Daily-Signature is not implemented here.
 *    In production, you should verify the signature before processing.
 */
@RestController
@RequestMapping("/api/daily")
@RequiredArgsConstructor
@Slf4j
public class DailyWebhookController {

    private static final String ROOM_PREFIX = "session-";

    private final SessionRepository sessionRepository;

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> payload) {

        // Daily may send "event" or "name" depending on version.
        String event = valueAsString(payload.get("event"));
        if (event == null) {
            event = valueAsString(payload.get("name"));
        }

        if (!"recording.completed".equalsIgnoreCase(event)) {
            return ResponseEntity.ok().build();
        }

        Object dataObj = payload.get("data");
        if (!(dataObj instanceof Map<?, ?> data)) {
            log.warn("Daily webhook: missing data payload");
            return ResponseEntity.ok().build();
        }

        String roomName = valueAsString(data.get("room_name"));
        if (roomName == null || !roomName.startsWith(ROOM_PREFIX)) {
            log.warn("Daily webhook: unexpected room_name {}", roomName);
            return ResponseEntity.ok().build();
        }

        String shareUrl = valueAsString(data.get("share_url"));
        if (shareUrl == null) {
            shareUrl = valueAsString(data.get("share_link"));
        }

        Long sessionId;
        try {
            String idPart = roomName.substring(ROOM_PREFIX.length());
            sessionId = Long.valueOf(idPart);
        } catch (Exception ex) {
            log.warn("Daily webhook: cannot parse sessionId from room_name {}", roomName);
            return ResponseEntity.ok().build();
        }

        if (shareUrl == null || shareUrl.isBlank()) {
            log.warn("Daily webhook: recording.completed without share url for session {}", sessionId);
        }

        // Make it effectively final for lambda
        final String recordingUrl = shareUrl;

        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setRecordingLink(recordingUrl);
            sessionRepository.save(session);
            log.info("Daily recording attached to session {} -> {}", sessionId, recordingUrl);
        });

        return ResponseEntity.ok().build();
    }


    private String valueAsString(Object value) {
        return value != null ? value.toString() : null;
    }
}

