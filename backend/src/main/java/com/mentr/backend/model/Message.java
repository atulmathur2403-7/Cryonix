package com.mentr.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String senderId;
    private String receiverId;
    private String conversationId;

    @Column(length = 2000)
    private String text;

    private String type;
    private String createdAt;
    private boolean isRead;
}
