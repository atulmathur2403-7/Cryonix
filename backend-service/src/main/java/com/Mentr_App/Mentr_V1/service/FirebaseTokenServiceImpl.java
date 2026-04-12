package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.model.User;
import com.Mentr_App.Mentr_V1.util.FirebaseIdentityUtil;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseTokenServiceImpl implements FirebaseTokenService {

    private final FirebaseAuth firebaseAuth;

    @Override
    public String createCustomToken(User user) {
        String uid = FirebaseIdentityUtil.toFirebaseUid(user.getUserId());
        try {
            // Synchronous for simplicity; async version also exists (createCustomTokenAsync)
            return firebaseAuth.createCustomToken(uid);
        } catch (FirebaseAuthException e) {
            log.error("Failed to create Firebase custom token for user {}: {}", user.getUserId(), e.getMessage(), e);
            throw new IllegalStateException("Failed to create Firebase custom token", e);
        }
    }
}

