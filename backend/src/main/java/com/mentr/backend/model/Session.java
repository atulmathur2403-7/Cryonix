package com.mentr.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String learnerId;
    private String mentorId;
    private String mentorName;
    private String mentorAvatar;
    private String date;
    private String time;
    private String sessionType;
    private String subject;
    private int duration;
    private String status;
    private double paymentAmount;
    private String currency;
    private Double ratingGiven;

    @Column(length = 2000)
    private String notes;
}
