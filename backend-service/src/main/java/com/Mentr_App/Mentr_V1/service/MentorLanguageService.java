package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.meta.MentorLanguageSearchResponse;

public interface MentorLanguageService {
    MentorLanguageSearchResponse searchLanguages(String q, Integer limit);
}

