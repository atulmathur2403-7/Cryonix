package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.model.Wallet;
import java.math.BigDecimal;

public interface WalletService {
    Wallet initializeWalletForUser(User user);
    Wallet getOrCreateWallet(User user);
    void creditWallet(User user, BigDecimal amount, String reason);
    void debitWallet(User user, BigDecimal amount, String reason);
}

