package com.mentr.backend.repository;

import com.mentr.backend.model.FAQ;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FAQRepository extends JpaRepository<FAQ, String> {
    List<FAQ> findByCategory(String category);
}
