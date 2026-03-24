package com.mentr.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "videos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String mentorId;
    private String mentorName;
    private String mentorAvatar;
    private String title;

    @Column(length = 2000)
    private String description;

    private String thumbnailUrl;
    private String videoUrl;
    private int likes;
    private int viewCount;
    private boolean isLive;
    private int liveViewerCount;
    private String createdAt;
}
