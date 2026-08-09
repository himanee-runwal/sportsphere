package com.sportsphere.bookingservice.controller;

import com.sportsphere.bookingservice.dto.BookingRequest;
import com.sportsphere.bookingservice.dto.BookingResponse;
import com.sportsphere.bookingservice.dto.SlotAvailabilityResponse;
import com.sportsphere.bookingservice.dto.SlotInitializationRequest;
import com.sportsphere.bookingservice.service.BookingService;
import com.sportsphere.common.dto.MessageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/booking")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking and slot selection endpoints")
public class BookingController {

    private final BookingService bookingService;

    @Operation(summary = "Get slot availability for a ground and date (public)")
    @GetMapping("/slots")
    public ResponseEntity<List<SlotAvailabilityResponse>> getSlotAvailability(
            @RequestParam Long groundId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getSlotAvailability(groundId, date));
    }

    @Operation(summary = "Initialize slots for a ground (MANAGER or ADMIN)")
    @PostMapping("/slots/initialize")
    public ResponseEntity<MessageResponse> initializeSlots(
            @Valid @RequestBody SlotInitializationRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "MANAGER", "ADMIN");
        bookingService.initializeSlotsForGround(request.getGroundId());
        return ResponseEntity.ok(
                MessageResponse.builder().message("Slots initialized successfully").build()
        );
    }

    @Operation(summary = "Create a booking (authenticated users)")
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            HttpServletRequest httpRequest) {
        Long userId = getUserIdOrThrow(httpRequest);
        BookingResponse booking = bookingService.createBooking(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @Operation(summary = "Get bookings of the logged-in user")
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(HttpServletRequest httpRequest) {
        Long userId = getUserIdOrThrow(httpRequest);
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @Operation(summary = "Cancel a booking (owner, manager, or admin)")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long userId = getUserIdOrThrow(httpRequest);
        String role = getRole(httpRequest);
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId, role));
    }

    // Helper: extract userId or throw 401
    private Long getUserIdOrThrow(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing user context. Ensure request is routed via the API Gateway.");
        }
        return userId;
    }

    // Helper: extract role or return empty
    private String getRole(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        return role != null ? role : "";
    }

    // Helper: enforce roles
    private void requireRole(HttpServletRequest request, String... allowedRoles) {
        String userRole = getRole(request);
        for (String role : allowedRoles) {
            if (role.equalsIgnoreCase(userRole)) {
                return;
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Required roles: " + String.join(", ", allowedRoles));
    }
}
