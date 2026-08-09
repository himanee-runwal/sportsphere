package com.sportsphere.authservice.dto;

import com.sportsphere.authservice.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request object for updating a user's role")
public class RoleUpdateRequest {

    @NotNull(message = "Role is required")
    @Schema(description = "The new role to assign to the user")
    private Role role;
}
