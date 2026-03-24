package com.mentr.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String fullName;
    private String username;
    private String email;
    private String phone;

    @Column(length = 1000)
    private String bio;

    private String interests;
    private String avatar;
    private int sessionsBooked;
    private int sessionsCompleted;
    private double avgRating;
    private boolean isMentor;
}
