package com.mentr.backend.controller;

import com.mentr.backend.model.User;
import com.mentr.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signUp(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "token", "sample-jwt-token-" + saved.getId(),
                "user", saved
        ));
    }

    @PostMapping("/auth/signin")
    public ResponseEntity<?> signIn(@RequestBody Map<String, String> credentials) {
        User user = userRepository.findByEmail(credentials.get("email"));
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        return ResponseEntity.ok(Map.of(
                "token", "sample-jwt-token-" + user.getId(),
                "user", user
        ));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        return userRepository.findById(id)
                .map(existing -> {
                    user.setId(id);
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
