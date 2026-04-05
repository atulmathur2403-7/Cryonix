package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.config.MentorShortsProperties;
import com.Mentr_App.Mentr_V1.exception.ApiException;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.googleapis.media.MediaHttpUploader;
import com.google.api.client.http.*;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.nio.file.Path;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class YouTubeUploadServiceImpl implements YouTubeUploadService {

    private final MentorShortsProperties props;
    private volatile YouTube youtubeClient;

    private YouTube youtube() {
        if (youtubeClient != null) return youtubeClient;

        synchronized (this) {
            if (youtubeClient != null) return youtubeClient;

            try {
                var yt = props.getYoutube();
                if (isBlank(yt.getClientId()) || isBlank(yt.getClientSecret()) || isBlank(yt.getRefreshToken())) {
                    throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "YOUTUBE_NOT_CONFIGURED",
                            "YouTube OAuth credentials are not configured.");
                }

                NetHttpTransport transport = new NetHttpTransport();
                JacksonFactory jsonFactory = JacksonFactory.getDefaultInstance();

                GoogleCredential credential = new GoogleCredential.Builder()
                        .setTransport(transport)
                        .setJsonFactory(jsonFactory)
                        .setClientSecrets(yt.getClientId(), yt.getClientSecret())
                        .build()
                        .setRefreshToken(yt.getRefreshToken());

                boolean refreshed = credential.refreshToken();
                if (!refreshed) {
                    throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "YOUTUBE_AUTH_FAILED",
                            "Failed to refresh YouTube OAuth token.");
                }

                youtubeClient = new YouTube.Builder(transport, jsonFactory, credential)
                        .setApplicationName(yt.getApplicationName())
                        .build();

                log.info("✅ YouTube client initialized");
                return youtubeClient;

            } catch (ApiException ae) {
                throw ae;
            } catch (Exception e) {
                log.error("❌ Failed to init YouTube client: {}", e.getMessage(), e);
                throw new ApiException(HttpStatus.BAD_GATEWAY, "YOUTUBE_INIT_FAILED", "Failed to initialize YouTube client.");
            }
        }
    }

    @Override
    public UploadResult uploadShortVideo(Path mp4File, String title, String description, List<String> tags) {
        try {
            var yt = props.getYoutube();

            Video video = new Video();

            VideoSnippet snippet = new VideoSnippet();
            snippet.setTitle(title);
            snippet.setDescription(description);
            snippet.setTags(tags);
            snippet.setCategoryId(yt.getCategoryId());
            video.setSnippet(snippet);

            VideoStatus status = new VideoStatus();
            status.setPrivacyStatus(yt.getPrivacyStatus());
            status.setSelfDeclaredMadeForKids(false);
            video.setStatus(status);

            try (FileInputStream fis = new FileInputStream(mp4File.toFile())) {
                InputStreamContent media = new InputStreamContent("video/mp4", fis);
                media.setLength(mp4File.toFile().length());

                YouTube.Videos.Insert insert = youtube()
                        .videos()
                        .insert(List.of("snippet", "status"), video, media);

                // Recommended: don't notify subscribers for automated uploads
                insert.setNotifySubscribers(false);

                // Resumable upload
                MediaHttpUploader uploader = insert.getMediaHttpUploader();
                uploader.setDirectUploadEnabled(false);
                uploader.setChunkSize(MediaHttpUploader.MINIMUM_CHUNK_SIZE);

                Video uploaded = insert.execute();

                String id = uploaded.getId();
                String url = "https://www.youtube.com/watch?v=" + id;

                return new UploadResult(id, url);
            }

        } catch (GoogleJsonResponseException gjre) {
            String msg = "YouTube API error: " + gjre.getDetails();
            log.error(msg);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "YOUTUBE_UPLOAD_FAILED", msg);
        } catch (ApiException ae) {
            throw ae;
        } catch (Exception e) {
            log.error("YouTube upload failed: {}", e.getMessage(), e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "YOUTUBE_UPLOAD_FAILED", "Failed to upload video to YouTube.");
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
