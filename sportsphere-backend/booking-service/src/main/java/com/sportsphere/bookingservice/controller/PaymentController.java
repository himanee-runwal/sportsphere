package com.sportsphere.bookingservice.controller;

import com.sportsphere.bookingservice.dto.PaymentRequest;
import com.sportsphere.bookingservice.dto.PaymentResponse;
import com.sportsphere.bookingservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/booking/{bookingId}/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Endpoints for simulating booking payments")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Process a simulated payment for a booking")
    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(
            @PathVariable Long bookingId,
            @Valid @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in");
        }
        return ResponseEntity.ok(paymentService.processPayment(bookingId, userId, request));
    }

    private Long getUserId(HttpServletRequest request) {
        String userIdStr = request.getHeader("X-User-Id");
        if (userIdStr != null && !userIdStr.isEmpty()) {
            try {
                return Long.parseLong(userIdStr);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
