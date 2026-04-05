package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.meta.PronounsMetaResponse;
import com.Mentr_App.Mentr_V1.mapper.PronounsMetaMapper;
import com.Mentr_App.Mentr_V1.model.enums.Pronouns;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Service
@Transactional(readOnly = true)
public class PronounsMetaServiceImpl implements PronounsMetaService {

    @Override
    @Cacheable(cacheNames = "pronouns.meta", key = "'all'")
    public PronounsMetaResponse getPronouns() {
        return PronounsMetaResponse.builder()
                .items(Arrays.stream(Pronouns.values()).map(PronounsMetaMapper::toItem).toList())
                .build();
    }
}

