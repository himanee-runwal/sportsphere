package com.sportsphere.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request object for user authentication")
public class AuthRequest {

    @NotBlank(message = "Email or phone is required")
    @Schema(description = "User's email or phone number")
    private String emailOrPhone;

    @NotBlank(message = "Password is required")
    @Schema(description = "User's password")
    private String password;
}
