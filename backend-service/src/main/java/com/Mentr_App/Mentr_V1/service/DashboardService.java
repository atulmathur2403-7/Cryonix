package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.common.PagedResponse;
import com.Mentr_App.Mentr_V1.dto.dashboard.*;

public interface DashboardService {
    PagedResponse<MentorBookingsDashboardResponse> getMentorDashboardBookings(Long mentorId, int page, int size);
    PagedResponse<MentorSessionsDashboardResponse> getMentorDashboardSessions(Long mentorId, int page, int size);
    PagedResponse<MentorAvailabilityDashboardResponse> getMentorDashboardAvailabilityTime(Long mentorId, int page, int size);
    PagedResponse<LearnerBookingsDashboardResponse> getLearnerDashboardBookings(Long learnerId, int page, int size);
    PagedResponse<LearnerSessionDashBoardResponse> getLearnerDashboardSessions(Long learnerId, int page, int size);
}

