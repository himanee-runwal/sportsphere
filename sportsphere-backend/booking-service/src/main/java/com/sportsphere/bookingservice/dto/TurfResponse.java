package com.sportsphere.bookingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TurfResponse {
    private Long id;
    private Long venueId;
    private String name;
    private boolean isActive;
    private BigDecimal pricePerHour;
}
