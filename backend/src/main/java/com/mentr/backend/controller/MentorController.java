package com.mentr.backend.controller;

import com.mentr.backend.model.Mentor;
import com.mentr.backend.repository.MentorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentors")
public class MentorController {

    private final MentorRepository mentorRepository;

    public MentorController(MentorRepository mentorRepository) {
        this.mentorRepository = mentorRepository;
    }

    @GetMapping
    public List<Mentor> getAllMentors() {
        return mentorRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mentor> getMentorById(@PathVariable String id) {
        return mentorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Mentor> searchMentors(@RequestParam String query) {
        return mentorRepository.findByNameContainingIgnoreCase(query);
    }

    @GetMapping("/online")
    public List<Mentor> getOnlineMentors() {
        return mentorRepository.findByIsOnlineTrue();
    }

    @GetMapping("/live")
    public List<Mentor> getLiveMentors() {
        return mentorRepository.findByIsLiveTrue();
    }

    @GetMapping("/trending")
    public List<Mentor> getTrendingMentors() {
        return mentorRepository.findAll().stream()
                .sorted((a, b) -> Double.compare(b.getRating(), a.getRating()))
                .limit(10)
                .toList();
    }

    @GetMapping("/specialty/{specialty}")
    public List<Mentor> getMentorsBySpecialty(@PathVariable String specialty) {
        return mentorRepository.findBySpecialtyContainingIgnoreCase(specialty);
    }

    @PostMapping
    public Mentor createMentor(@RequestBody Mentor mentor) {
        return mentorRepository.save(mentor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mentor> updateMentor(@PathVariable String id, @RequestBody Mentor mentor) {
        return mentorRepository.findById(id)
                .map(existing -> {
                    mentor.setId(id);
                    return ResponseEntity.ok(mentorRepository.save(mentor));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
