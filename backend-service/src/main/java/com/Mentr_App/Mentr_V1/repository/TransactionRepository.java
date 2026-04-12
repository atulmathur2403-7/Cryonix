package com.Mentr_App.Mentr_V1.repository;

import com.Mentr_App.Mentr_V1.model.Transaction;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * TRANSACTION REPOSITORY (Phase 3 — Wallet & Monetization Ledger)
 * ---------------------------------------------------------------
 * Provides transaction queries for learners, mentors, admins,
 * and automated payout/refund processing.
 *
 * Product Flow alignment:
 *  • Learner Dashboard → view past wallet activity / refund logs
 *  • Mentor Dashboard → earnings & payout ledger
 *  • Admin Panel → commission and payout analytics
 *  • Refund Workflow → locate and reverse affected transactions
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * 🔍 Fetch all transactions for a given wallet, ordered by latest first.
     * Used in both learner & mentor dashboards.
     */
    List<Transaction> findByWallet_IdOrderByCreatedAtDesc(Long walletId);

    /**
     * 🔍 Fetch all transactions for a specific user via wallet linkage.
     * Useful when displaying consolidated payment history for user profile.
     */
    @Query("""
        SELECT t FROM Transaction t
         WHERE t.wallet.user.userId = :userId
         ORDER BY t.createdAt DESC
    """)
    List<Transaction> findByUserId(Long userId);

    /**
     * 🔍 Find transaction by external reference ID (e.g. Stripe intent or refund ID).
     * Used for webhook reconciliation and refund validations.
     */
    Optional<Transaction> findByReferenceId(String referenceId);

    /**
     * 🔍 Find all mentor payout transactions pending completion.
     * Used by admin or background job to finalize mentor withdrawals.
     */
    @Query("""
        SELECT t FROM Transaction t
         WHERE t.reason = 'MENTOR_PAYOUT'
           AND t.status = 'PENDING'
    """)
    List<Transaction> findPendingPayouts();

    /**
     * 🔍 Calculate total earnings credited to a mentor within a time window.
     * Supports mentor analytics and dashboard statistics.
     */
    @Query("""
        SELECT COALESCE(SUM(t.amount),0)
          FROM Transaction t
         WHERE t.wallet.user.userId = :mentorUserId
           AND t.type = 'CREDIT'
           AND t.reason = 'MENTOR_PAYOUT'
           AND t.status = 'COMPLETED'
           AND t.createdAt BETWEEN :start AND :end
    """)
    BigDecimal getMentorEarningsBetween(Long mentorUserId, Instant start, Instant end);

    /**
     * 🔍 Fetch all refund transactions for a learner (used in Report Issue flow).
     */
    @Query("""
        SELECT t FROM Transaction t
         WHERE t.wallet.user.userId = :learnerUserId
           AND t.reason = 'REFUND'
         ORDER BY t.createdAt DESC
    """)
    List<Transaction> findRefundsByLearner(Long learnerUserId);

    /**
     * 🔁 Mark a transaction as completed after wallet balance update.
     */
    @Modifying
    @Query("""
        UPDATE Transaction t
           SET t.status = 'COMPLETED',
               t.updatedAt = CURRENT_TIMESTAMP
         WHERE t.id = :transactionId
    """)
    void markAsCompleted(Long transactionId);

    /**
     * 🔁 Mark a transaction as reversed (for refunds or admin corrections).
     */
    @Modifying
    @Query("""
        UPDATE Transaction t
           SET t.status = 'REVERSED',
               t.updatedAt = CURRENT_TIMESTAMP,
               t.description = :reason
         WHERE t.id = :transactionId
    """)
    void markAsReversed(Long transactionId, String reason);
}

