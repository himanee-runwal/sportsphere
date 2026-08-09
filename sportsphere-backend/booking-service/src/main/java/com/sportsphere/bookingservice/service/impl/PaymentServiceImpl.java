package com.sportsphere.bookingservice.service.impl;

import com.sportsphere.bookingservice.dto.PaymentRequest;
import com.sportsphere.bookingservice.dto.PaymentResponse;
import com.sportsphere.bookingservice.entity.Booking;
import com.sportsphere.bookingservice.entity.Payment;
import com.sportsphere.bookingservice.enums.BookingStatus;
import com.sportsphere.bookingservice.enums.PaymentStatus;
import com.sportsphere.bookingservice.repository.BookingRepository;
import com.sportsphere.bookingservice.repository.PaymentRepository;
import com.sportsphere.bookingservice.service.PaymentService;
import com.sportsphere.common.exception.BadRequestException;
import com.sportsphere.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public PaymentResponse processPayment(Long bookingId, Long userId, PaymentRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!booking.getUserId().equals(userId)) {
            throw new BadRequestException("You are not authorized to pay for this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Booking is not in PENDING state. Current state: " + booking.getStatus());
        }

        Optional<Payment> existingPaymentOpt = paymentRepository.findByBookingId(bookingId);
        if (existingPaymentOpt.isPresent() && existingPaymentOpt.get().getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment has already been successful for this booking");
        }

        // Simulate successful payment processing
        Payment payment = Payment.builder()
                .booking(booking)
                .transactionId(UUID.randomUUID().toString())
                .amount(booking.getTotalAmount())
                .status(PaymentStatus.SUCCESS)
                .paymentMethod(request.getPaymentMethod())
                .build();

        payment = paymentRepository.save(payment);

        // Update booking status
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        log.info("Simulated successful payment {} for booking {}", payment.getTransactionId(), booking.getBookingNumber());

        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(booking.getId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
