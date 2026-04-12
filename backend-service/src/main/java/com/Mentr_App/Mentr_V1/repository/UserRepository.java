package com.Mentr_App.Mentr_V1.repository;



import com.Mentr_App.Mentr_V1.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameIgnoreCase(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByUsernameIgnoreCase(String username);

    Optional<User> findByPhoneE164(String phoneE164);

    boolean existsByPhoneE164(String phoneE164);
}
