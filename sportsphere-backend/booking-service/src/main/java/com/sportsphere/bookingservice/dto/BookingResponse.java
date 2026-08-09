package com.sportsphere.bookingservice.dto;

import com.sportsphere.bookingservice.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long bookingId;
    private String bookingNumber;
    private Long userId;
    private Long groundId;
    private LocalDate bookingDate;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private String notes;
    private Long slotId;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDateTime createdAt;
}
