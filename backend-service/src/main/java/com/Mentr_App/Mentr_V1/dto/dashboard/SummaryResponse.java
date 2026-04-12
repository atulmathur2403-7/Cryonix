package com.Mentr_App.Mentr_V1.dto.dashboard;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SummaryResponse {
    private Long mentorId;
    private String range; // ex "30d"
    private Long totalSessionsCompleted;
    private Long totalReviews;
    private Long totalMinutesMentored;
}
