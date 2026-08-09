package com.sportsphere.authservice.controller;

import com.sportsphere.authservice.dto.AdminUserEditRequest;
import com.sportsphere.authservice.dto.UserResponse;
import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.authservice.dto.RoleUpdateRequest;
import com.sportsphere.authservice.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin endpoints for managing users")
public class AdminController {

    private final AuthService authService;

    @Operation(summary = "Block a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User blocked successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/{userId}/block")
    public ResponseEntity<MessageResponse> blockUser(@PathVariable Long userId) {
        return ResponseEntity.ok(authService.blockUser(userId));
    }

    @Operation(summary = "Unblock a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User unblocked successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/{userId}/unblock")
    public ResponseEntity<MessageResponse> unblockUser(@PathVariable Long userId) {
        return ResponseEntity.ok(authService.unblockUser(userId));
    }

    @Operation(summary = "Update a user's role")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User role updated successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{userId}/role")
    public ResponseEntity<MessageResponse> updateRole(
            @PathVariable Long userId,
            @Valid @RequestBody RoleUpdateRequest request
    ) {
        return ResponseEntity.ok(authService.updateRole(userId, request));
    }

    @Operation(summary = "Edit any user details (Admin)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> editUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUserEditRequest request
    ) {
        return ResponseEntity.ok(authService.editUserAsAdmin(userId, request));
    }
}
