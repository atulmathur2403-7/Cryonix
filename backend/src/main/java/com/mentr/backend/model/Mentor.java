package com.mentr.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mentors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mentor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String username;
    private String specialty;

    @Column(length = 2000)
    private String about;

    private String avatar;
    private boolean isVerified;
    private boolean isOnline;
    private boolean isLive;
    private int followers;
    private int following;
    private int likes;
    private double rating;
    private int totalMentees;
    private int reviewCount;
    private double messagePrice;
    private double callPrice;
    private double subscriptionPrice;
    private String youtubeLink;
    private String location;
}
