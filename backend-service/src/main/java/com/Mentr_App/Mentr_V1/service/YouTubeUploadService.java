package com.Mentr_App.Mentr_V1.service;


import java.nio.file.Path;
import java.util.List;

public interface YouTubeUploadService {

    UploadResult uploadShortVideo(
            Path mp4File,
            String title,
            String description,
            List<String> tags
    );

    record UploadResult(String videoId, String youtubeUrl) {}
}

