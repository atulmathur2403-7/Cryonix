package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.dto.shorts.*;

public interface MentorShortsService {

    ReserveMentorShortResponse reserve(Long userId, ReserveMentorShortRequest req, String idempotencyKey);

    FinalizeMentorShortResponse finalizeUpload(Long userId, Long uploadId);

    MentorShortVideoListResponse listMyShorts(Long userId);

    DeleteMentorShortResponse deleteShort(Long userId, Long uploadId);
}
