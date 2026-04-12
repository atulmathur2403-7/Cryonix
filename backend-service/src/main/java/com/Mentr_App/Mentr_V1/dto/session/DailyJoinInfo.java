package com.Mentr_App.Mentr_V1.dto.session;



import lombok.Builder;
import lombok.Data;

/**
 * DAILY JOIN INFO
 * ---------------
 * Internal DTO used between DailyVideoService and controllers.
 */
@Data
@Builder
public class DailyJoinInfo {

    /**
     * Full Daily room URL (e.g. https://subdomain.daily.co/session-123).
     */
    private String roomUrl;

    /**
     * Daily room name (e.g. session-123).
     */
    private String roomName;

    /**
     * Ephemeral access token for the caller.
     */
    private String token;
}

