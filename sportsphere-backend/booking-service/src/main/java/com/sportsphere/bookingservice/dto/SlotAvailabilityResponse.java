package com.sportsphere.bookingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotAvailabilityResponse {
    private Long slotId;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal price;
    private boolean isAvailable;
}
