package com.mentr.backend.repository;

import com.mentr.backend.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VideoRepository extends JpaRepository<Video, String> {
    List<Video> findByMentorId(String mentorId);
    List<Video> findByIsLiveTrue();
    List<Video> findByTitleContainingIgnoreCase(String title);
}
