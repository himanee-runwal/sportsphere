package com.sportsphere.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request object for resetting a password")
public class ResetPasswordRequest {

    @NotBlank(message = "Token or OTP is required")
    @Schema(description = "The token or OTP received via email/phone")
    private String tokenOrOtp;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    @Schema(description = "The new password")
    private String newPassword;
}
