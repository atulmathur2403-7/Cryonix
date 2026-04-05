package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.config.StripeConfig;
import com.Mentr_App.Mentr_V1.model.Transaction;
import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.model.Wallet;
import com.Mentr_App.Mentr_V1.repository.TransactionRepository;
import com.Mentr_App.Mentr_V1.repository.WalletRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final StripeConfig stripeConfig;

    @Override
    @Transactional
    public Wallet initializeWalletForUser(User user) {
        return walletRepository.findByUser_UserId(user.getUserId())
                .orElseGet(() -> {
                    Wallet wallet = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .currency(stripeConfig.getCurrency())
                            .createdAt(Instant.now())
                            .lastUpdated(Instant.now())
                            .build();
                    walletRepository.save(wallet);
                    log.info("💰 Initialized wallet for user {} ({})", user.getUserId(), user.getEmail());
                    return wallet;
                });
    }

    @Override
    @Transactional
    public Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUser_UserId(user.getUserId())
                .orElseGet(() -> initializeWalletForUser(user));
    }

    @Override
    @Transactional
    public void creditWallet(User user, BigDecimal amount, String reason) {
        Wallet wallet = getOrCreateWallet(user);
        wallet.credit(amount);
        walletRepository.save(wallet);

        Transaction txn = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .currency(wallet.getCurrency())
                .type("CREDIT")
                .reason(reason)
                .status("COMPLETED")
                .referenceId("AUTO-" + Instant.now().toEpochMilli())
                .description(reason)
                .createdAt(Instant.now())
                .build();
        transactionRepository.save(txn);

        log.info("💸 Credited {} {} to user wallet {} ({})", amount, wallet.getCurrency(), user.getUserId(), reason);
    }

    @Override
    @Transactional
    public void debitWallet(User user, BigDecimal amount, String reason) {
        Wallet wallet = getOrCreateWallet(user);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance for user: " + user.getUserId());
        }

        wallet.debit(amount);
        walletRepository.save(wallet);

        Transaction txn = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .currency(wallet.getCurrency())
                .type("DEBIT")
                .reason(reason)
                .status("COMPLETED")
                .referenceId("AUTO-" + Instant.now().toEpochMilli())
                .description(reason)
                .createdAt(Instant.now())
                .build();
        transactionRepository.save(txn);

        log.info("💳 Debited {} {} from user wallet {} ({})", amount, wallet.getCurrency(), user.getUserId(), reason);
    }
}

