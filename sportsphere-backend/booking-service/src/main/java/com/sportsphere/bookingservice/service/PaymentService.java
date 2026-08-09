package com.sportsphere.bookingservice.service;

import com.sportsphere.bookingservice.dto.PaymentRequest;
import com.sportsphere.bookingservice.dto.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(Long bookingId, Long userId, PaymentRequest request);
}
