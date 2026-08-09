package com.sportsphere.sportsservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update turf — all fields optional")
public class UpdateTurfRequest {
    private String name;
    private String sport;
    private String surfaceType;
    private Integer capacity;
    private Double lengthFt;
    private Double widthFt;
    private Boolean isIndoor;
    private BigDecimal pricePerHour;
    private Boolean isActive;
}
