package com.Mentr_App.Mentr_V1.dto.dashboard;


import com.Mentr_App.Mentr_V1.dto.booking.BookingResponse;
import lombok.Data;

import java.util.List;

/**
 * DTO for learner dashboard view.
 */
@Data
public class LearnerBookingsDashboardResponse {
    private List<BookingResponse> bookings;

}

