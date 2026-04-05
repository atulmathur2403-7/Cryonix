package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.model.MentorShortVideo;
import com.Mentr_App.Mentr_V1.model.enums.MentorShortVideoStatus;
import com.Mentr_App.Mentr_V1.repository.MentorShortVideoRepository;
import com.google.cloud.storage.Storage;
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
public class MentorShortsCleanupScheduler {

    private final MentorShortVideoRepository repo;
    private final Storage storage;

    @Scheduled(fixedDelay = 30_000L)
    @Transactional
    public void expireReservations() {
        Instant now = Instant.now();

        List<MentorShortVideo> expired = repo.findExpiredReservations(MentorShortVideoStatus.RESERVED, now);

        for (MentorShortVideo r : expired) {
            r.setStatus(MentorShortVideoStatus.EXPIRED);

            // best-effort delete if client uploaded late
            try {
                if (r.getGcsBucket() != null && r.getGcsObjectPath() != null) {
                    storage.delete(r.getGcsBucket(), r.getGcsObjectPath());
                }
            } catch (Exception e) {
                log.warn("Expire cleanup delete failed (id={}): {}", r.getId(), e.getMessage());
            }
        }

        if (!expired.isEmpty()) {
            repo.saveAll(expired);
            log.info("⏱ Expired {} reserved Shorts upload(s)", expired.size());
        }
    }
}
