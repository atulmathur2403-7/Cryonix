package com.mentr.backend.controller;

import com.mentr.backend.model.Video;
import com.mentr.backend.repository.VideoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoRepository videoRepository;

    public VideoController(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    @GetMapping
    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Video> getVideoById(@PathVariable String id) {
        return videoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mentor/{mentorId}")
    public List<Video> getVideosByMentor(@PathVariable String mentorId) {
        return videoRepository.findByMentorId(mentorId);
    }

    @GetMapping("/live")
    public List<Video> getLiveVideos() {
        return videoRepository.findByIsLiveTrue();
    }

    @GetMapping("/search")
    public List<Video> searchVideos(@RequestParam String query) {
        return videoRepository.findByTitleContainingIgnoreCase(query);
    }

    @PostMapping
    public Video createVideo(@RequestBody Video video) {
        video.setCreatedAt(java.time.Instant.now().toString());
        return videoRepository.save(video);
    }
}
