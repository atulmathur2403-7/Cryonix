package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.booking.BookingRequest;
import com.Mentr_App.Mentr_V1.dto.booking.BookingResponse;
import com.Mentr_App.Mentr_V1.dto.booking.RefundDestination;
import com.Mentr_App.Mentr_V1.dto.booking.UpdateBookingStatusRequest;
import com.Mentr_App.Mentr_V1.model.User;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, User learner);
    BookingResponse updateBookingStatus(Long bookingId, UpdateBookingStatusRequest request);
    List<BookingResponse> getBookingsForLearner(Long learnerId);
    List<BookingResponse> getBookingsForMentor(Long mentorId);
    BookingResponse cancelByLearner(Long bookingId, User learner, RefundDestination dest, String reason);

}

