package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.config.DailyConfig;
import com.Mentr_App.Mentr_V1.dto.session.DailyJoinInfo;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.Booking;
import com.Mentr_App.Mentr_V1.model.Session;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * DAILY VIDEO SERVICE IMPLEMENTATION
 * ----------------------------------
 * Implements Daily.co REST API calls:
 *  - POST /rooms
 *  - POST /meeting-tokens
 *
 * Notes:
 *  - Uses lazy room creation (first user hitting /join).
 *  - Room name is deterministic: "session-{sessionId}".
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DailyVideoServiceImpl implements DailyVideoService {

    private static final String PROVIDER_DAILY = "DAILY";
    private static final String ROOM_PREFIX = "session-";

    private final DailyConfig dailyConfig;
    private final SessionRepository sessionRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public DailyJoinInfo ensureRoomAndToken(Session session, User user, boolean isMentor) {
        if (session.getId() == null) {
            throw new BookingException("Session must be persisted before creating a Daily room");
        }

        // Determine booking type, if available
        Booking booking = session.getBooking();
        String bookingType = booking != null ? booking.getBookingType() : null;
        boolean isTalkNow = bookingType != null && "TALK_NOW".equalsIgnoreCase(bookingType);

        // For BOOK_LATER, enforce "join only within 10 minutes before start"
        if (!isTalkNow && session.getStartTime() != null) {
            Instant now = Instant.now();
            Instant earliestJoin = session.getStartTime().minusSeconds(10 * 60L); // 10 minutes before start
            if (now.isBefore(earliestJoin)) {
                throw new BookingException("You can join this meeting only 10 minutes before the scheduled start time");
            }
        }

        String roomName = ROOM_PREFIX + session.getId();
        String existingLink = session.getMeetingLink();
        String roomUrl;

        if (existingLink != null && existingLink.contains(roomName)) {
            // Reuse existing URL, regardless of provider flag
            roomUrl = existingLink;
        } else {
            roomUrl = createDailyRoomForSession(session, roomName, isTalkNow);
        }

        String token = createDailyToken(roomName, user, isMentor);

        return DailyJoinInfo.builder()
                .roomUrl(roomUrl)
                .roomName(roomName)
                .token(token)
                .build();
    }

    /* =========================================================
     * Internal helpers
     * ========================================================= */

    /**
     * Create (or re-attach to) a Daily room for this session.
     *
     * BOOK_LATER behaviour:
     *  - nbf = session.startTime  (cannot join before this)
     *  - exp = session.endTime    (room expires exactly at end)
     *  - eject_at_room_exp = true (auto-kick at end, no extra grace)
     *
     * TALK_NOW behaviour:
     *  - exp = session.endTime + ejectGraceSeconds (if end known)
     *    else now + roomExpiryMinutes fallback
     *  - eject_at_room_exp = true (auto-kick after grace)
     *
     * room-expiry-minutes (e.g. 480) is **only** used as a fallback
     * when we don't have a valid end time.
     */
    private String createDailyRoomForSession(Session session, String roomName, boolean isTalkNow) {
        Map<String, Object> body = new HashMap<>();
        body.put("name", roomName);
        body.put("privacy", "private");

        Map<String, Object> properties = new HashMap<>();

        Instant now = Instant.now();
        Instant start = session.getStartTime();
        Instant end = session.getEndTime();

        // --------- exp (room expiry) ---------
        long expEpoch;

        if (isTalkNow) {
            // TALK_NOW: allow a grace period after scheduled end
            if (end != null) {
                expEpoch = end.plusSeconds(dailyConfig.getEjectGraceSeconds()).getEpochSecond();
            } else {
                // fallback if end is missing → uses room-expiry-minutes (e.g. 480)
                expEpoch = now.plusSeconds(dailyConfig.getRoomExpiryMinutes() * 60L).getEpochSecond();
            }
        } else {
            // BOOK_LATER: hard stop exactly at scheduled end (no grace)
            if (end != null) {
                expEpoch = end.getEpochSecond();
            } else {
                // safety fallback → uses room-expiry-minutes
                expEpoch = now.plusSeconds(dailyConfig.getRoomExpiryMinutes() * 60L).getEpochSecond();
            }
        }

        properties.put("exp", expEpoch);

        // --------- nbf (not-before) for BOOK_LATER ---------
        if (!isTalkNow && start != null) {
            // Users cannot join before scheduled start
            properties.put("nbf", start.getEpochSecond());
        }

        // ✅ limit participants to mentor + learner
        properties.put("max_participants", 2);

        // Auto-eject all participants when exp is reached
        properties.put("eject_at_room_exp", Boolean.TRUE);

        // Optional: enable built-in chat for in-call messages
        properties.put("enable_chat", Boolean.TRUE);

        body.put("properties", properties);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(dailyConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        String url = dailyConfig.getApiBaseUrl() + "/rooms";

        // Helper to construct URL even if API says "room already exists"
        String fallbackRoomUrl = buildRoomUrl(roomName);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Daily rooms API returned non-2xx: {}", response.getStatusCode());
                throw new BookingException("Failed to create Daily room");
            }

            Map<?, ?> res = response.getBody();
            Object urlObj = res.get("url");
            Object roomUrlObj = res.get("room_url");

            String roomUrl = urlObj != null ? urlObj.toString()
                    : (roomUrlObj != null ? roomUrlObj.toString() : null);

            if (roomUrl == null) {
                log.error("Daily rooms API did not return room URL for room {}", roomName);
                throw new BookingException("Failed to create Daily room URL");
            }

            session.setMeetingProvider(PROVIDER_DAILY);
            session.setMeetingLink(roomUrl);
            sessionRepository.save(session);

            log.info("Created Daily room {} for session {} (talkNow={}, exp={}, start={}, end={})",
                    roomName, session.getId(), isTalkNow, expEpoch, start, end);

            return roomUrl;

        } catch (org.springframework.web.client.HttpClientErrorException.BadRequest e) {
            String bodyStr = e.getResponseBodyAsString();
            // 🔑 if Daily says "a room named ... already exists", treat as success
            if (bodyStr != null && bodyStr.contains("a room named") && bodyStr.contains("already exists")) {
                String roomUrl = fallbackRoomUrl;

                session.setMeetingProvider(PROVIDER_DAILY);
                session.setMeetingLink(roomUrl);
                sessionRepository.save(session);

                log.warn("Daily room {} already exists; reusing URL {}", roomName, roomUrl);
                return roomUrl;
            }

            log.error("Error creating Daily room {}: {}", roomName, e.getMessage(), e);
            throw new BookingException("Error calling Daily rooms API");
        } catch (Exception ex) {
            log.error("Error creating Daily room {}: {}", roomName, ex.getMessage(), ex);
            throw new BookingException("Error calling Daily rooms API");
        }
    }

    private String buildRoomUrl(String roomName) {
        String domain = dailyConfig.getDomain(); // e.g. "https://mentr-live.daily.co/"
        if (domain.endsWith("/")) {
            return domain + roomName;
        }
        return domain + "/" + roomName;
    }

    private String createDailyToken(String roomName, User user, boolean isMentor) {
        Map<String, Object> body = new HashMap<>();
        Map<String, Object> properties = new HashMap<>();

        properties.put("room_name", roomName);
        properties.put("is_owner", isMentor);
        properties.put("user_name", user.getName() != null ? user.getName() : user.getEmail());
        properties.put("user_id", user.getUserId());

        body.put("properties", properties);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(dailyConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        String url = dailyConfig.getApiBaseUrl() + "/meeting-tokens";

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Daily tokens API returned non-2xx: {}", response.getStatusCode());
                throw new BookingException("Failed to create Daily access token");
            }

            Map<?, ?> res = response.getBody();
            Object tokenObj = res.get("token");
            Object accessTokenObj = res.get("access_token");

            String token = tokenObj != null ? tokenObj.toString()
                    : (accessTokenObj != null ? accessTokenObj.toString() : null);

            if (token == null) {
                log.error("Daily tokens API did not return token for room {}", roomName);
                throw new BookingException("Failed to create Daily access token");
            }

            return token;
        } catch (Exception ex) {
            log.error("Error creating Daily token for room {}: {}", roomName, ex.getMessage(), ex);
            throw new BookingException("Error calling Daily tokens API");
        }
    }

    @Override
    public void updateRoomExpiryIfExists(Session session) {
        if (session == null || session.getId() == null) return;

        String roomName = ROOM_PREFIX + session.getId();

        // room exists only if we already stored meetingLink
        if (session.getMeetingLink() == null || session.getMeetingLink().isBlank()) return;

        Instant end = session.getEndTime();
        if (end == null) return;

        // Keep same semantics you used in createDailyRoomForSession:
        // - TALK_NOW: end + ejectGraceSeconds
        // - BOOK_LATER: end exactly
        Booking booking = session.getBooking();
        String bookingType = booking != null ? booking.getBookingType() : null;
        boolean isTalkNow = bookingType != null && "TALK_NOW".equalsIgnoreCase(bookingType);

        long newExpEpoch = isTalkNow
                ? end.plusSeconds(dailyConfig.getEjectGraceSeconds()).getEpochSecond()
                : end.getEpochSecond();

        Map<String, Object> body = new HashMap<>();
        Map<String, Object> props = new HashMap<>();
        props.put("exp", newExpEpoch);
        body.put("properties", props);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(dailyConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        String url = dailyConfig.getApiBaseUrl() + "/rooms/" + roomName;

        try {
            restTemplate.postForEntity(url, entity, Map.class);
            log.info("✅ Daily room exp updated for {} -> exp={}", roomName, newExpEpoch);
        } catch (Exception ex) {
            log.error("❌ Failed to update Daily room exp for {}: {}", roomName, ex.getMessage(), ex);
            throw new BookingException("Failed to update Daily room expiry");
        }
    }

}
