package com.sportsphere.sportsservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddManagerRequest {

    @NotNull(message = "Manager user ID is required")
    @Schema(description = "User ID of the manager from auth-service", example = "5")
    private Long userId;
}
