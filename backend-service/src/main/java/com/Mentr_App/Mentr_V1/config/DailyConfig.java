package com.Mentr_App.Mentr_V1.config;


import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * DAILY CONFIGURATION
 * -------------------
 * Central configuration holder for Daily.co integration.
 *
 * Properties (application.yml):
 *
 *   daily:
 *     api-key: YOUR_DAILY_API_KEY
 *     api-base-url: https://api.daily.co/v1
 *     domain: https://your-subdomain.daily.co
 *     room-expiry-minutes: 480
 *     eject-grace-seconds: 300
 */
@Configuration
@Slf4j
@Getter
public class DailyConfig {

    /**
     * Secret key for Daily REST API.
     * Used only on backend server for room and token creation.
     */
    @Value("${daily.api-key}")
    private String apiKey;

    /**
     * Base REST API URL.
     * Default: https://api.daily.co/v1
     */
    @Value("${daily.api-base-url:https://api.daily.co/v1}")
    private String apiBaseUrl;

    /**
     * Frontend room domain.
     * Example: https://mentr.daily.co
     */
    @Value("${daily.domain}")
    private String domain;

    /**
     * Room expiry (relative to now) in minutes.
     * Acts as a safety TTL if session start/end times are missing.
     */
    @Value("${daily.room-expiry-minutes:480}")
    private long roomExpiryMinutes;

    /**
     * How many seconds after scheduled end time users may stay
     * in the call before Daily forcibly ejects them.
     */
    @Value("${daily.eject-grace-seconds:300}")
    private long ejectGraceSeconds;
}

