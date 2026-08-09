package com.sportsphere.sportsservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddSportRequest {

    @NotBlank(message = "Sport name is required")
    @Schema(description = "Sport name to add to venue", example = "Cricket")
    private String sportName;
}
