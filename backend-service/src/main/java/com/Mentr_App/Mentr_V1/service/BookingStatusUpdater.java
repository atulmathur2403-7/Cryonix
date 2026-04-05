package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.booking.UpdateBookingStatusRequest;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.Booking;
import com.Mentr_App.Mentr_V1.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Decoupled helper to update booking status safely
 * without depending on BookingServiceImpl directly.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BookingStatusUpdater {

    private final BookingRepository bookingRepository;

    public void updateBookingStatus(Long bookingId, String newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingException("Booking not found"));

        booking.setStatus(newStatus.toUpperCase());
        booking.setUpdatedAt(java.time.Instant.now());
        bookingRepository.save(booking);
    }
}

