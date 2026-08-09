package com.sportsphere.authservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response object containing access and refresh tokens")
public class AuthResponse {

    @Schema(description = "The JWT access token")
    private String token;

    @Schema(description = "The JWT refresh token")
    private String refreshToken;
}
