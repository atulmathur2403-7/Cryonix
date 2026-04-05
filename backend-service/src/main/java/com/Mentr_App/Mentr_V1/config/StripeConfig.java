package com.Mentr_App.Mentr_V1.config;


import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Stripe Configuration
 *
 * Reads API keys & global payment settings from application.yml
 * and initializes the Stripe SDK at application startup.
 *
 * Stripe Java SDK (v29.x) is thread-safe and only needs to be initialized once.
 * This config also exposes Stripe currency and platform commission settings
 * that can be injected wherever payment logic is implemented.
 */
@Configuration
@Slf4j
@Getter
public class StripeConfig {

    /**
     * Secret key used for all server-side Stripe API calls.
     * Keep it strictly private (never expose to frontend).
     */
    @Value("${stripe.api-key}")
    private String apiKey;

    /**
     * Publishable key (safe to expose to frontend React app).
     * Used by frontend to initialize Stripe.js.
     */
    @Value("${stripe.publishable-key}")
    private String publishableKey;

    /**
     * Webhook signing secret for verifying Stripe event authenticity.
     */
    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    /**
     * Default transaction currency (e.g., "inr", "usd").
     */
    @Value("${stripe.currency:inr}")
    private String currency;

    /**
     * Platform commission percentage applied to mentor payouts.
     * Example: 10 means 10% retained by platform.
     */
    @Value("${stripe.platform-commission-percent:10}")
    private int platformCommissionPercent;

    /**
     * Flag to indicate test mode. When true, enables debug logs for payments.
     */
    @Value("${stripe.enable-test-mode:true}")
    private boolean enableTestMode;

    /**
     * Initializes Stripe SDK with secret key after Spring context loads.
     */
    @PostConstruct
    public void init() {
        Stripe.apiKey = apiKey;
        System.out.println(Stripe.API_VERSION);
        log.info("Stripe SDK initialized successfully");
        log.info("Using currency: {}", currency);
        log.info("Platform commission: {}%", platformCommissionPercent);
        if (enableTestMode) {
            log.warn("Stripe is running in TEST MODE — use test keys only");
        }
    }
}
