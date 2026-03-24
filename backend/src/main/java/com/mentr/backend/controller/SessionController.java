package com.mentr.backend.controller;

import com.mentr.backend.model.Session;
import com.mentr.backend.repository.SessionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionRepository sessionRepository;

    public SessionController(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @GetMapping
    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Session> getSessionById(@PathVariable String id) {
        return sessionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/learner/{learnerId}")
    public List<Session> getSessionsByLearner(@PathVariable String learnerId) {
        return sessionRepository.findByLearnerId(learnerId);
    }

    @GetMapping("/learner/{learnerId}/upcoming")
    public List<Session> getUpcomingSessions(@PathVariable String learnerId) {
        return sessionRepository.findByLearnerIdAndStatus(learnerId, "upcoming");
    }

    @GetMapping("/learner/{learnerId}/completed")
    public List<Session> getCompletedSessions(@PathVariable String learnerId) {
        return sessionRepository.findByLearnerIdAndStatus(learnerId, "completed");
    }

    @PostMapping
    public Session createSession(@RequestBody Session session) {
        return sessionRepository.save(session);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Session> updateSession(@PathVariable String id, @RequestBody Session session) {
        return sessionRepository.findById(id)
                .map(existing -> {
                    session.setId(id);
                    return ResponseEntity.ok(sessionRepository.save(session));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Session> completeSession(@PathVariable String id) {
        return sessionRepository.findById(id)
                .map(s -> {
                    s.setStatus("completed");
                    return ResponseEntity.ok(sessionRepository.save(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Session> cancelSession(@PathVariable String id) {
        return sessionRepository.findById(id)
                .map(s -> {
                    s.setStatus("cancelled");
                    return ResponseEntity.ok(sessionRepository.save(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
