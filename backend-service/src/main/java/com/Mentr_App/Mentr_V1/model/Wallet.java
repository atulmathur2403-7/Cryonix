package com.Mentr_App.Mentr_V1.model;



import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * WALLET ENTITY (Phase 3 — Payment & Earnings Layer)
 * -------------------------------------------------
 * Represents a user's in-app wallet balance — used for both learners and mentors.
 *
 * Product Flow alignment:
 *  • Learner: Pays for sessions from wallet or top-up before Stripe call
 *  • Mentor: Receives session earnings (credited post-payment)
 *  • Platform: Uses Transaction logs to compute commissions
 *
 * Wallets are denominated in the same currency as Stripe transactions.
 */

@Entity
@Table(name = "wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Each wallet belongs to exactly one user.
     * Shared by both learners and mentors (User role defines context).
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * Current wallet balance.
     * Stored in main currency units (e.g., INR, USD).
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    /**
     * ISO currency code — should match Stripe’s currency.
     * Example: "inr", "usd".
     */
    @Column(nullable = false, length = 10)
    private String currency = "inr";

    /**
     * Wallet creation timestamp.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    /**
     * Last transaction timestamp.
     * Updated each time a credit/debit occurs.
     */
    @Column(name = "last_updated", nullable = false)
    private Instant lastUpdated = Instant.now();

    /**
     * Indicates if wallet is active (soft-disable option for banned users).
     */
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    /**
     * Optional total lifetime earnings — for mentors analytics dashboard.
     */
    @Column(name = "lifetime_earnings", precision = 14, scale = 2)
    private BigDecimal lifetimeEarnings = BigDecimal.ZERO;

    /**
     * Optional total spent amount — for learners analytics dashboard.
     */
    @Column(name = "lifetime_spent", precision = 14, scale = 2)
    private BigDecimal lifetimeSpent = BigDecimal.ZERO;

    // -----------------------------------------------------------------------
    // Convenience Methods
    // -----------------------------------------------------------------------

    /**
     * Credit money into wallet (used for mentor payouts or top-ups).
     */
    public void credit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) return;
        if (balance == null) balance = BigDecimal.ZERO;
        if (lifetimeEarnings == null) lifetimeEarnings = BigDecimal.ZERO;
        balance = balance.add(amount);
        lifetimeEarnings = lifetimeEarnings.add(amount);
        lastUpdated = Instant.now();
    }

    /**
     * Debit money from wallet (used for learner payments or refunds).
     */
    public void debit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) return;
        if (balance == null) balance = BigDecimal.ZERO;
        if (lifetimeSpent == null) lifetimeSpent = BigDecimal.ZERO;
        if (balance.compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }
        balance = balance.subtract(amount);
        lifetimeSpent = lifetimeSpent.add(amount);
        lastUpdated = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (balance == null) balance = BigDecimal.ZERO;
        if (currency == null) currency = "inr";
        if (lifetimeEarnings == null) lifetimeEarnings = BigDecimal.ZERO;
        if (lifetimeSpent == null) lifetimeSpent = BigDecimal.ZERO;
        lastUpdated = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        lastUpdated = Instant.now();
        if (balance == null) balance = BigDecimal.ZERO;
        if (lifetimeEarnings == null) lifetimeEarnings = BigDecimal.ZERO;
        if (lifetimeSpent == null) lifetimeSpent = BigDecimal.ZERO;
    }
}
