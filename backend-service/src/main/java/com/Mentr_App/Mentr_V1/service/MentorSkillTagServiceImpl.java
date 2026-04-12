package com.Mentr_App.Mentr_V1.service;



import com.Mentr_App.Mentr_V1.dto.meta.MentorSkillTagSearchResponse;
import com.Mentr_App.Mentr_V1.exception.InvalidInputException;
import com.Mentr_App.Mentr_V1.mapper.MentorSkillTagMapper;
import com.Mentr_App.Mentr_V1.model.MentorSkillsTag;
import com.Mentr_App.Mentr_V1.repository.TagRepository;
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
public class MentorSkillTagServiceImpl implements MentorSkillTagService {

    private final TagRepository tagRepository;

    @Override
    @Cacheable(
            cacheNames = "tags.search",
            key = "'q=' + (#q == null ? '' : #q.toLowerCase()) + '|limit=' + (#limit == null ? 20 : #limit)"
    )
    public MentorSkillTagSearchResponse searchTags(String q, Integer limit) {
        int lim = clampLimit(limit);
        String query = (q == null) ? "" : q.trim();

        List<MentorSkillsTag> found = tagRepository.searchActiveTags(query, lim);

        if (query != null && !query.isBlank() && found.isEmpty()) {
            Map<String, Object> details = new HashMap<>();
            details.put("q", query);
            throw new InvalidInputException(
                    "TAG_NOT_FOUND",
                    "No tags found for query: " + query,
                    details
            );
        }

        return MentorSkillTagSearchResponse.builder()
                .q(query)
                .limit(lim)
                .items(found.stream().map(MentorSkillTagMapper::toItem).toList())
                .build();
    }

    private int clampLimit(Integer limit) {
        int lim = (limit == null) ? 20 : limit;
        if (lim <= 0) lim = 20;
        if (lim > 50) lim = 50;
        return lim;
    }
}

