package com.mentr.backend.controller;

import com.mentr.backend.model.FAQ;
import com.mentr.backend.repository.FAQRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    private final FAQRepository faqRepository;

    public SupportController(FAQRepository faqRepository) {
        this.faqRepository = faqRepository;
    }

    @GetMapping("/faqs")
    public List<FAQ> getAllFAQs() {
        return faqRepository.findAll();
    }

    @GetMapping("/faqs/category/{category}")
    public List<FAQ> getFAQsByCategory(@PathVariable String category) {
        return faqRepository.findByCategory(category);
    }

    @PostMapping("/report")
    public Map<String, String> submitReport(@RequestBody Map<String, String> report) {
        return Map.of(
                "status", "submitted",
                "message", "Your report has been received. We'll get back to you within 24 hours.",
                "ticketId", "TICKET-" + System.currentTimeMillis()
        );
    }
}
