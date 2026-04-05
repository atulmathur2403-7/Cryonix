package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.model.SessionExtension;
import com.Mentr_App.Mentr_V1.model.enums.SessionExtensionStatus;
import com.Mentr_App.Mentr_V1.repository.SessionExtensionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionExtensionCleanupScheduler {

    private final SessionExtensionRepository sessionExtensionRepository;

    @Scheduled(fixedDelay = 30_000L)
    @Transactional
    public void expireOldExtensions() {
        Instant now = Instant.now();

        List<SessionExtension> expired = sessionExtensionRepository.findExpired(
                List.of(
                        SessionExtensionStatus.PENDING_DECISION,
                        SessionExtensionStatus.APPROVED_AWAITING_PAYMENT,
                        SessionExtensionStatus.PAYMENT_PENDING
                ),
                now
        );

        for (SessionExtension e : expired) {
            if (e.getStatus() == SessionExtensionStatus.PAYMENT_PENDING) {
                // payment may still arrive late; webhook will refund if needed
                e.setStatus(SessionExtensionStatus.EXPIRED);
            } else {
                e.setStatus(SessionExtensionStatus.EXPIRED);
            }
        }

        if (!expired.isEmpty()) {
            sessionExtensionRepository.saveAll(expired);
            log.info("⏱ Expired {} session extension(s)", expired.size());
        }
    }
}

