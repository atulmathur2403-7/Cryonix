package com.mentr.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String learnerId;
    private String learnerName;
    private String learnerAvatar;
    private String mentorId;
    private String sessionId;
    private double rating;

    @Column(length = 2000)
    private String text;

    private String attachments;
    private String createdAt;
}
