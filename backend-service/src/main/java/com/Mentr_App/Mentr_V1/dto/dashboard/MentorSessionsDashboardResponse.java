package com.Mentr_App.Mentr_V1.dto.dashboard;


import com.Mentr_App.Mentr_V1.dto.availability.AvailabilityResponse;
import com.Mentr_App.Mentr_V1.dto.booking.BookingResponse;
import com.Mentr_App.Mentr_V1.dto.session.SessionResponse;
import lombok.Data;

import java.util.List;

/**
 * DTO for mentor dashboard view.
 */
@Data
public class MentorSessionsDashboardResponse {
    private List<SessionResponse> sessions;
}

