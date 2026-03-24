package com.mentr.backend.controller;

import com.mentr.backend.model.Payment;
import com.mentr.backend.repository.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;

    public PaymentController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable String id) {
        return paymentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Payment> getPaymentsByUser(@PathVariable String userId) {
        return paymentRepository.findByUserId(userId);
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Payment> getPaymentBySession(@PathVariable String sessionId) {
        Payment payment = paymentRepository.findBySessionId(sessionId);
        return payment != null ? ResponseEntity.ok(payment) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setStatus("completed");
        payment.setCreatedAt(java.time.Instant.now().toString());
        return paymentRepository.save(payment);
    }
}
