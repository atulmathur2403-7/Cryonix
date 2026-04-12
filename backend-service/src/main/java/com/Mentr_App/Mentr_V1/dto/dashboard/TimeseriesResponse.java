package com.Mentr_App.Mentr_V1.dto.dashboard;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeseriesResponse {
    private Long mentorId;
    private String metric;      // sessions | reviews | minutes
    private String interval;    // day (we use daily buckets in MVP)
    private List<String> labels; // yyyy-MM-dd
    private List<Long> values;
}

