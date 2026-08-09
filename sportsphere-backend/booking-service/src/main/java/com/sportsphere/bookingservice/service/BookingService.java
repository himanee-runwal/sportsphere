package com.sportsphere.bookingservice.service;

import com.sportsphere.bookingservice.dto.BookingRequest;
import com.sportsphere.bookingservice.dto.BookingResponse;
import com.sportsphere.bookingservice.dto.SlotAvailabilityResponse;
import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    List<SlotAvailabilityResponse> getSlotAvailability(Long groundId, LocalDate date);

    BookingResponse createBooking(BookingRequest request, Long userId);

    List<BookingResponse> getMyBookings(Long userId);

    BookingResponse cancelBooking(Long bookingId, Long userId, String role);

    void initializeSlotsForGround(Long groundId);
}
