package com.sportsphere.sportsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TurfResponse {
    private Long id;
    private Long venueId;
    private String name;
    private String sport;
    private String surfaceType;
    private Integer capacity;
    private Double lengthFt;
    private Double widthFt;
    private boolean isIndoor;
    private boolean isActive;
    private BigDecimal pricePerHour;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
