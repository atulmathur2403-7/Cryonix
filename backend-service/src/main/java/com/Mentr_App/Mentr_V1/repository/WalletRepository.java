package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.Wallet;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * WALLET REPOSITORY
 * -------------------------------------------------------
 * Handles CRUD and common operations for learner/mentor wallets.
 *
 * Product Flow alignment:
 *  • Learner: check balance before payment, update after top-up/refund
 *  • Mentor: credit after successful session
 *  • Admin: view wallets pending payout
 */
@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    /** 🔍 Find wallet by user ID (used in every debit/credit action). */
    Optional<Wallet> findByUser_UserId(Long userId);

    /** 🔍 Fetch all mentor wallets with balance > 0 for payout processing. */
    @Query("""
        SELECT w FROM Wallet w
         WHERE w.user.roles IS NOT EMPTY
           AND w.balance > 0
           AND w.active = true
    """)
    List<Wallet> findActiveWalletsWithBalance();

    /** 🔁 Update wallet balance (used in manual adjustments or admin ops). */
    @Modifying
    @Query("""
        UPDATE Wallet w
           SET w.balance = :newBalance,
               w.lastUpdated = CURRENT_TIMESTAMP
         WHERE w.id = :walletId
    """)
    void updateBalance(Long walletId, BigDecimal newBalance);

    /** 🔁 Increment wallet balance (credit). */
    @Modifying
    @Query("""
        UPDATE Wallet w
           SET w.balance = w.balance + :amount,
               w.lastUpdated = CURRENT_TIMESTAMP
         WHERE w.id = :walletId
    """)
    void creditBalance(Long walletId, BigDecimal amount);

    /** 🔁 Decrement wallet balance (debit). */
    @Modifying
    @Query("""
        UPDATE Wallet w
           SET w.balance = w.balance - :amount,
               w.lastUpdated = CURRENT_TIMESTAMP
         WHERE w.id = :walletId
           AND w.balance >= :amount
    """)
    int debitBalance(Long walletId, BigDecimal amount);
}
