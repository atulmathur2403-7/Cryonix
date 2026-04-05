package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.meta.MentorLanguageSearchResponse;
import com.Mentr_App.Mentr_V1.exception.InvalidInputException;
import com.Mentr_App.Mentr_V1.mapper.MentorLanguageMapper;
import com.Mentr_App.Mentr_V1.model.Language;
import com.Mentr_App.Mentr_V1.repository.LanguageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MentorLanguageServiceImpl implements MentorLanguageService {

    private final LanguageRepository languageRepository;

    @Override
    @Cacheable(
            cacheNames = "languages.search",
            key = "'q=' + (#q == null ? '' : #q.toLowerCase()) + '|limit=' + (#limit == null ? 20 : #limit)"
    )
    public MentorLanguageSearchResponse searchLanguages(String q, Integer limit) {
        int lim = clampLimit(limit);
        String query = (q == null) ? "" : q.trim();

        List<Language> found = languageRepository.searchActiveLanguages(query, lim);

        if (query != null && !query.isBlank() && found.isEmpty()) {
            Map<String, Object> details = new HashMap<>();
            details.put("q", query);
            throw new InvalidInputException(
                    "LANGUAGE_NOT_FOUND",
                    "No languages found for query: " + query,
                    details
            );
        }

        return MentorLanguageSearchResponse.builder()
                .q(query)
                .limit(lim)
                .items(found.stream().map(MentorLanguageMapper::toItem).toList())
                .build();
    }

    private int clampLimit(Integer limit) {
        int lim = (limit == null) ? 20 : limit;
        if (lim <= 0) lim = 20;
        if (lim > 50) lim = 50;
        return lim;
    }
}

