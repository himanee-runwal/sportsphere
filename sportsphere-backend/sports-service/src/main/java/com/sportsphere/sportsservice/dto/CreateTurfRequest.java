package com.sportsphere.sportsservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a turf")
public class CreateTurfRequest {

    @NotBlank(message = "Turf name is required")
    @Schema(description = "Turf name", example = "Turf A")
    private String name;

    @Schema(description = "Sport type", example = "Football")
    private String sport;

    @Schema(description = "Surface type", example = "Artificial Grass")
    private String surfaceType;

    @Schema(description = "Player capacity", example = "22")
    private Integer capacity;

    @Schema(description = "Length in feet", example = "100.0")
    private Double lengthFt;

    @Schema(description = "Width in feet", example = "60.0")
    private Double widthFt;

    @Schema(description = "Is this an indoor turf?", example = "false")
    private Boolean isIndoor;

    @Schema(description = "Price per hour", example = "500.0")
    private BigDecimal pricePerHour;
}
