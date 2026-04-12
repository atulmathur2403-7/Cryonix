package com.Mentr_App.Mentr_V1.mapper;


import com.Mentr_App.Mentr_V1.dto.shorts.MentorShortVideoItemResponse;
import com.Mentr_App.Mentr_V1.model.MentorShortVideo;

public final class MentorShortVideoMapper {

    private MentorShortVideoMapper() {}

    public static MentorShortVideoItemResponse toItem(MentorShortVideo e) {
        return MentorShortVideoItemResponse.builder()
                .id(e.getId())
                .slot(e.getSlot())
                .status(e.getStatus().name())

                .title(e.getTitle())
                .description(e.getDescription())
                .tags(e.getTags())

                .contentType(e.getContentType())
                .sizeBytes(e.getSizeBytes() == null ? 0L : e.getSizeBytes())

                .durationSeconds(e.getDurationSeconds())
                .width(e.getVideoWidth())
                .height(e.getVideoHeight())

                .youtubeVideoId(e.getYoutubeVideoId())
                .youtubeUrl(e.getYoutubeUrl())
                .createdAt(e.getCreatedAt())
                .uploadedAt(e.getUploadedAt())
                .lastError(e.getLastError())
                .build();
    }
}
