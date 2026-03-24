package com.mentr.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String sessionId;
    private String userId;
    private double amount;
    private String currency;
    private String method;
    private String status;
    private String transactionId;
    private String createdAt;
}
