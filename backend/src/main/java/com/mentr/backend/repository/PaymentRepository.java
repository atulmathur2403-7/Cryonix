package com.mentr.backend.repository;

import com.mentr.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByUserId(String userId);
    Payment findBySessionId(String sessionId);
}
