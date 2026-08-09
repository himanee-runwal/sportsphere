package com.sportsphere.authservice.controller;

import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.authservice.dto.*;
import com.sportsphere.authservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication and account management")
public class AuthController {

        private final AuthService authService;

        @Operation(summary = "Register a new user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "User registered successfully", content = @Content(schema = @Schema(implementation = MessageResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Validation error"),
                        @ApiResponse(responseCode = "409", description = "Email already exists")
        })
        @PostMapping("/register")
        public ResponseEntity<MessageResponse> register(
                        @Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
                MessageResponse messageResponse = authService.register(request);
                return ResponseEntity.ok(messageResponse);
        }

        @Operation(summary = "Login an existing user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully logged in", content = @Content(schema = @Schema(implementation = AuthResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Validation error"),
                        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
                        @ApiResponse(responseCode = "404", description = "User not found")
        })
        @PostMapping("/login")
        public ResponseEntity<AuthResponse> authenticate(
                        @Valid @RequestBody AuthRequest request, HttpServletResponse response) {
                AuthResponse authResponse = authService.authenticate(request);
                setTokenCookies(response, authResponse);
                return ResponseEntity.ok(authResponse);
        }

        @Operation(summary = "Refresh access token")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
                        @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
        })
        @PostMapping("/refresh")
        public ResponseEntity<AuthResponse> refresh(
                        @CookieValue(name = "refreshToken", required = false) String refreshTokenCookie,
                        @RequestBody(required = false) RefreshTokenRequest requestBody,
                        HttpServletResponse response) {

                String tokenToUse = refreshTokenCookie;
                if (tokenToUse == null && requestBody != null) {
                        tokenToUse = requestBody.getRefreshToken();
                }

                if (tokenToUse == null) {
                        throw new org.springframework.web.server.ResponseStatusException(
                                        org.springframework.http.HttpStatus.UNAUTHORIZED, "Refresh token is required");
                }

                RefreshTokenRequest request = new RefreshTokenRequest(tokenToUse);
                AuthResponse authResponse = authService.refreshToken(request);
                setTokenCookies(response, authResponse);
                return ResponseEntity.ok(authResponse);
        }

        @Operation(summary = "Logout user")
        @PostMapping("/logout")
        public ResponseEntity<MessageResponse> logout(
                        @RequestHeader(value = "Authorization", required = false) @Parameter(hidden = true) String authHeader,
                        @CookieValue(name = "accessToken", required = false) String accessTokenCookie,
                        HttpServletResponse response) {
                // Clear cookies
                ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                                .httpOnly(true)
                                .secure(true)
                                .path("/")
                                .maxAge(0)
                                .sameSite("None")
                                .build();
                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                                .httpOnly(true)
                                .secure(true)
                                .path("/")
                                .maxAge(0)
                                .sameSite("None")
                                .build();
                response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

                // Try to get token from header or cookie
                String token = null;
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        token = authHeader.substring(7);
                } else if (accessTokenCookie != null) {
                        token = accessTokenCookie;
                }

                if (token != null) {
                        try {
                                return ResponseEntity.ok(authService.logout(token));
                        } catch (Exception e) {
                                // Ignore invalid/expired token errors during logout
                        }
                }

                return ResponseEntity.ok(MessageResponse.builder().message("Logged out successfully").build());
        }

        private void setTokenCookies(HttpServletResponse response, AuthResponse authResponse) {
                if (authResponse.getToken() != null) {
                        ResponseCookie cookie = ResponseCookie.from("accessToken", authResponse.getToken())
                                        .httpOnly(true)
                                        .secure(true) // MUST be true for cross-origin (production)
                                        .path("/")
                                        .maxAge(24 * 60 * 60) // 1 day
                                        .sameSite("None") // MUST be None for cross-origin
                                        .build();
                        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
                }

                if (authResponse.getRefreshToken() != null) {
                        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                                        .httpOnly(true)
                                        .secure(true) // MUST be true for cross-origin (production)
                                        .path("/")
                                        .maxAge(7 * 24 * 60 * 60) // 7 days
                                        .sameSite("None") // MUST be None for cross-origin
                                        .build();
                        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
                }
        }

        @Operation(summary = "Initiate password reset (Forgot Password)")
        @PostMapping("/forgot-password")
        public ResponseEntity<MessageResponse> forgotPassword(
                        @Valid @RequestBody ForgotPasswordRequest request) {
                return ResponseEntity.ok(authService.forgotPassword(request));
        }

        @Operation(summary = "Verify OTP for password reset")
        @PostMapping("/verify-otp")
        public ResponseEntity<MessageResponse> verifyOtp(
                        @Valid @RequestBody VerifyOtpRequest request) {
                return ResponseEntity.ok(authService.verifyOtp(request));
        }

        @Operation(summary = "Complete password reset")
        @PostMapping("/reset-password")
        public ResponseEntity<MessageResponse> resetPassword(
                        @Valid @RequestBody ResetPasswordRequest request) {
                return ResponseEntity.ok(authService.resetPassword(request));
        }

        @Operation(summary = "Change existing password")
        @PostMapping("/change-password")
        public ResponseEntity<MessageResponse> changePassword(
                        @RequestHeader(value = "X-User-Email") String email,
                        @Valid @RequestBody ChangePasswordRequest request) {
                return ResponseEntity.ok(authService.changePassword(email, request));
        }

        @Operation(summary = "Get current user profile")
        @GetMapping("/me")
        public ResponseEntity<UserResponse> getMe(
                        @RequestHeader(value = "X-User-Email") String email) {
                return ResponseEntity.ok(authService.getMe(email));
        }

        @Operation(summary = "Lookup user by email (Admin)")
        @GetMapping("/admin/users/lookup")
        public ResponseEntity<UserResponse> lookupUserByEmail(
                        @RequestParam("email") String email) {
                return ResponseEntity.ok(authService.getUserByEmail(email));
        }

        @Operation(summary = "Create manager (Admin)")
        @PostMapping("/admin/users")
        public ResponseEntity<UserResponse> createManager(
                        @Valid @RequestBody RegisterRequest request) {
                return ResponseEntity.ok(authService.createManager(request));
        }
}
