package com.sportsphere.authservice.dto;

import com.sportsphere.authservice.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
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
@Schema(description = "Request object for registering a new user")
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Schema(description = "User's first name")
    private String firstName;

    @Schema(description = "User's last name (optional)")
    private String lastName;

    @Schema(description = "User's profile image URL (optional)")
    private String profileImage;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Schema(description = "User's email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Schema(description = "User's phone number")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    @Schema(description = "User's password")
    private String password;

    @Schema(description = "User's role, defaults to PLAYER if omitted")
    private Role role; // Optional, can be defaulted to PLAYER

    @Schema(description = "User's city")
    private String city;

    @Schema(description = "User's gender")
    private String gender;

    @Schema(description = "User's experience level")
    private String experienceLevel;

    @Schema(description = "List of sports the user plays")
    private java.util.List<String> sports;
}
