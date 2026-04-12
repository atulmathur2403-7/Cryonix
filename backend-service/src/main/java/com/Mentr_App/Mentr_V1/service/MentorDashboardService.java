package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.dashboard.SummaryResponse;
import com.Mentr_App.Mentr_V1.dto.dashboard.TimeseriesResponse;

public interface MentorDashboardService {
    SummaryResponse getMentorSummaryByUserId(Long userId, String range); // userId from JWT
    TimeseriesResponse getMentorTimeseriesByUserId(Long userId, String metric, String range, String interval);
}

