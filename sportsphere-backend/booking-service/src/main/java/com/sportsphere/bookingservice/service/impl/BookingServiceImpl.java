package com.sportsphere.bookingservice.service.impl;

import com.sportsphere.bookingservice.client.NotificationServiceClient;
import com.sportsphere.bookingservice.client.SportsServiceClient;
import com.sportsphere.bookingservice.dto.*;
import com.sportsphere.bookingservice.entity.Booking;
import com.sportsphere.bookingservice.entity.TimeSlot;
import com.sportsphere.bookingservice.enums.BookingStatus;
import com.sportsphere.bookingservice.repository.BookingRepository;
import com.sportsphere.bookingservice.repository.TimeSlotRepository;
import com.sportsphere.bookingservice.service.BookingService;
import com.sportsphere.common.exception.BadRequestException;
import com.sportsphere.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final SportsServiceClient sportsServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    @Override
    @Transactional
    public List<SlotAvailabilityResponse> getSlotAvailability(Long groundId, LocalDate date) {
        if (date.isBefore(LocalDate.now(IST))) {
            throw new BadRequestException("Cannot check slot availability for past dates");
        }

        // Fetch Turf from sports-service to ensure it exists and is active
        TurfResponse turf = sportsServiceClient.getTurfById(groundId);
        if (!turf.isActive()) {
            throw new BadRequestException("The requested turf is currently inactive");
        }

        VenueResponse venue = sportsServiceClient.getVenueById(turf.getVenueId());
        LocalTime openTime = venue.getOpenTime();

        // Fetch configured slots
        List<TimeSlot> slots = timeSlotRepository.findByGroundIdAndIsAvailableTrue(groundId);

        // If no slots exist yet, auto-initialize hourly slots based on Venue's
        // operating hours
        if (slots.isEmpty()) {
            log.info("No slots found for ground ID {}. Auto-initializing slots...", groundId);
            initializeSlotsForGround(groundId);
            slots = timeSlotRepository.findByGroundIdAndIsAvailableTrue(groundId);
        }

        // Fetch all bookings for this ground on the specific date
        List<Booking> bookings = bookingRepository.findByGroundIdAndBookingDate(groundId, date);
        Set<Long> bookedSlotIds = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING)
                .map(b -> b.getSlot().getId())
                .collect(Collectors.toSet());

        return slots.stream()
                .map(slot -> {
                        boolean isBooked = bookedSlotIds.contains(slot.getId());

                        // If the slot's start time is earlier than the venue's open time, it must be the next day (post-midnight)
                        boolean isNextDay = slot.getStartTime().isBefore(openTime);
                        LocalDate actualSlotDate = isNextDay ? date.plusDays(1) : date;
                        LocalDateTime slotDateTime = LocalDateTime.of(actualSlotDate, slot.getStartTime());

                        boolean isPast = slotDateTime.isBefore(LocalDateTime.now(IST));

                        // Filter out past slots entirely — don't return them
                        if (isPast) return null;

                        return SlotAvailabilityResponse.builder()
                                .slotId(slot.getId())
                                .startTime(slot.getStartTime())
                                .endTime(slot.getEndTime())
                                .price(calculateSlotPrice(turf.getPricePerHour(), slot))
                                .isAvailable(!isBooked)
                                .isBooked(isBooked)
                                .build();
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long userId) {
        if (request.getBookingDate().isBefore(LocalDate.now(IST))) {
            throw new BadRequestException("Cannot create booking for past dates");
        }

        // Fetch Turf details from sports-service
        TurfResponse turf = sportsServiceClient.getTurfById(request.getGroundId());
        if (!turf.isActive()) {
            throw new BadRequestException("Cannot book an inactive turf");
        }
        // Find time slot and lock it to serialize bookings on the same slot
        TimeSlot slot = timeSlotRepository.findByIdWithLock(request.getSlotId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Time slot not found with ID: " + request.getSlotId()));

        if (!slot.getGroundId().equals(request.getGroundId())) {
            throw new BadRequestException("The selected slot does not belong to the requested ground");
        }

        if (request.getBookingDate().equals(LocalDate.now(IST)) && slot.getStartTime().isBefore(LocalTime.now(IST))) {
            throw new BadRequestException("Cannot book a time slot in the past");
        }

        if (!slot.getIsAvailable()) {
            throw new BadRequestException("The selected slot is marked as unavailable");
        }

        // Check if already booked
        boolean isAlreadyBooked = bookingRepository.existsByGroundIdAndBookingDateAndSlotIdAndStatusIn(
                request.getGroundId(),
                request.getBookingDate(),
                request.getSlotId(),
                List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING));

        if (isAlreadyBooked) {
            throw new BadRequestException("The selected time slot is already booked for this date");
        }

        // Compute total amount based on duration and hourly rate
        BigDecimal totalAmount = calculateSlotPrice(turf.getPricePerHour(), slot);

        // Generate a unique booking number
        String bookingNumber = "BK-" + request.getBookingDate().toString().replace("-", "") + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .bookingNumber(bookingNumber)
                .userId(userId)
                .groundId(request.getGroundId())
                .slot(slot)
                .bookingDate(request.getBookingDate())
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .notes(request.getNotes())
                .build();

        final Booking savedBooking = bookingRepository.save(booking);

        // Fetch User email from some user service or decode from JWT token if available. 
        // For now, we will send to a placeholder email as it's not present in Booking object
        String userEmail = "user" + userId + "@example.com";
        String timeString = slot.getStartTime().toString() + " - " + slot.getEndTime().toString();
        
        // Fire and forget notification to prevent blocking/hanging if notification-service is sleeping
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                notificationServiceClient.sendBookingConfirmation(
                    userId.toString(), 
                    userEmail, 
                    savedBooking.getBookingNumber(), 
                    turf.getName(), 
                    timeString
                );
            } catch (Exception e) {
                log.error("Failed to send booking confirmation email async: ", e);
            }
        });

        return mapToBookingResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    @Override
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId, String role) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        // Check authorization
        boolean isAuthorized = false;
        if ("ADMIN".equalsIgnoreCase(role)) {
            isAuthorized = true;
        } else if (booking.getUserId().equals(userId)) {
            isAuthorized = true;
        } else if ("MANAGER".equalsIgnoreCase(role)) {
            // Fetch Turf and Venue to check if the current user is a manager of this venue
            TurfResponse turf = sportsServiceClient.getTurfById(booking.getGroundId());
            VenueResponse venue = sportsServiceClient.getVenueById(turf.getVenueId());
            if (venue.getManagerUserIds() != null && venue.getManagerUserIds().contains(userId)) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new BadRequestException("You are not authorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        return mapToBookingResponse(booking);
    }

    @SuppressWarnings("null")
    @Override
    @Transactional
    public void initializeSlotsForGround(Long groundId) {
        // Fetch Turf and Venue details from sports-service
        TurfResponse turf = sportsServiceClient.getTurfById(groundId);
        VenueResponse venue = sportsServiceClient.getVenueById(turf.getVenueId());

        LocalTime openTime = venue.getOpenTime();
        LocalTime closeTime = venue.getCloseTime();

        if (openTime == null || closeTime == null) {
            throw new BadRequestException("Venue operating hours are not configured");
        }

        // Delete existing slot configuration for the ground
        timeSlotRepository.deleteByGroundId(groundId);

        // Calculate total operating minutes — supports overnight venues (e.g., 11:30 PM to 3:30 AM)
        long totalMinutes = ChronoUnit.MINUTES.between(openTime, closeTime);
        if (totalMinutes <= 0) {
            totalMinutes += 24 * 60; // Crosses midnight
        }

        // Generate hourly slots within the operating window
        LocalTime startTime = openTime;
        long minutesGenerated = 0;
        while (minutesGenerated < totalMinutes) {
            long remainingMinutes = totalMinutes - minutesGenerated;
            long slotMinutes = Math.min(60, remainingMinutes);
            LocalTime endTime = startTime.plusMinutes(slotMinutes);

            TimeSlot slot = TimeSlot.builder()
                    .groundId(groundId)
                    .startTime(startTime)
                    .endTime(endTime)
                    .isAvailable(true)
                    .build();

            timeSlotRepository.save(slot);
            startTime = endTime;
            minutesGenerated += slotMinutes;
        }

        log.info("Initialized hourly time slots for ground ID {} between {} and {}", groundId, openTime, closeTime);
    }

    private BigDecimal calculateSlotPrice(BigDecimal pricePerHour, TimeSlot slot) {
        if (pricePerHour == null) {
            return BigDecimal.ZERO;
        }
        long minutes = ChronoUnit.MINUTES.between(slot.getStartTime(), slot.getEndTime());
        if (minutes < 0) {
            minutes += 24 * 60; // Handle overnight slots
        }
        return pricePerHour.multiply(BigDecimal.valueOf(minutes))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        return BookingResponse.builder()
                .bookingId(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .userId(booking.getUserId())
                .groundId(booking.getGroundId())
                .bookingDate(booking.getBookingDate())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .notes(booking.getNotes())
                .slotId(booking.getSlot().getId())
                .startTime(booking.getSlot().getStartTime())
                .endTime(booking.getSlot().getEndTime())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
