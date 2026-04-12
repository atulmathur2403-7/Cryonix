package com.Mentr_App.Mentr_V1.config;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "mentr.youtube.shorts")
public class MentorShortsProperties {

    /**
     * Total slots per mentor (1..maxVideosPerMentor).
     * Your workflow uses 3.
     */
    private int maxVideosPerMentor = 3;

    private String stagingBucket;
    private String objectPrefix = "mentor_shorts";

    /**
     * Signed URL TTL: how long PUT URL is valid
     */
    private long signedUrlTtlSeconds = 900;

    /**
     * Reservation TTL: how long RESERVED row remains valid
     */
    private long reservationTtlSeconds = 900;

    /**
     * Enforced by signed URL (x-goog-content-length-range) + verified in finalize.
     */
    private long maxFileBytes = 200_000_000L;

    /**
     * Configurable max duration, but we ALSO hard-cap at 180 to stay Shorts-eligible.
     */
    private int maxDurationSeconds = 180;

    /**
     * New requirement: reject if duration < 5 seconds.
     */
    private int minDurationSeconds = 5;

    /**
     * Shorts aspect rules.
     * Your workflow: height >= width (square allowed).
     */
    private boolean allowSquare = true;
    private boolean requireVerticalOrSquare = true;

    private Worker worker = new Worker();
    private YouTube youtube = new YouTube();

    @Data
    public static class Worker {
        private long pollDelayMs = 15_000L;
        private int batchSize = 3;
        private int maxAttempts = 8;
        private long baseBackoffSeconds = 15L;
    }

    @Data
    public static class YouTube {
        private String applicationName;
        private String clientId;
        private String clientSecret;
        private String refreshToken;

        private String privacyStatus = "unlisted";
        private String categoryId = "22";
    }
}
