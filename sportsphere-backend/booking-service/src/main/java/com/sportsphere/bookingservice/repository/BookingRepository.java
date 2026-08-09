package com.sportsphere.bookingservice.repository;

import com.sportsphere.bookingservice.entity.Booking;
import com.sportsphere.bookingservice.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByGroundIdAndBookingDate(Long groundId, LocalDate bookingDate);

    boolean existsByGroundIdAndBookingDateAndSlotIdAndStatusIn(
            Long groundId,
            LocalDate bookingDate,
            Long slotId,
            Collection<BookingStatus> statuses);
}
