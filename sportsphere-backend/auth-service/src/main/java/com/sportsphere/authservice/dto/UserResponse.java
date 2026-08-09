package com.sportsphere.authservice.dto;

import com.sportsphere.authservice.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response object containing safe user profile information")
public class UserResponse {

    @Schema(description = "The user's unique ID")
    private Long id;

    @Schema(description = "The user's first name")
    private String firstName;

    @Schema(description = "The user's last name")
    private String lastName;

    @Schema(description = "The user's profile image URL")
    private String profileImage;

    @Schema(description = "The user's bio")
    private String bio;

    @Schema(description = "The user's email address")
    private String email;

    @Schema(description = "The user's phone number")
    private String phone;

    @Schema(description = "The user's role")
    private Role role;

    @Schema(description = "Whether the user's account is blocked")
    private boolean isBlocked;

    @Schema(description = "The user's city")
    private String city;

    @Schema(description = "The user's gender")
    private String gender;

    @Schema(description = "The user's experience level")
    private String experienceLevel;

    @Schema(description = "List of sports the user plays")
    private java.util.List<String> sports;
}
