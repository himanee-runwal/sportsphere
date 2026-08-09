package com.sportsphere.sportsservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new venue")
public class CreateVenueRequest {

    @NotBlank(message = "Venue name is required")
    @Schema(description = "Venue name", example = "Champions Arena")
    private String name;

    @Schema(description = "Venue description")
    private String description;

    @NotBlank(message = "Address is required")
    @Schema(description = "Street address")
    private String address;

    @NotBlank(message = "City is required")
    @Schema(description = "City", example = "Pune")
    private String city;

    @Schema(description = "Pincode", example = "411001")
    private String pincode;

    @Schema(description = "State", example = "Maharashtra")
    private String state;

    @NotBlank(message = "Country is required")
    @Schema(description = "Country", example = "India")
    private String country;

    @Schema(description = "Latitude for location-based search", example = "18.5204")
    private Double latitude;

    @Schema(description = "Longitude for location-based search", example = "73.8567")
    private Double longitude;

    @Schema(description = "Google Maps link for easy navigation")
    private String googleMapsLink;

    @NotBlank(message = "Contact email is required")
    @Schema(description = "Contact email")
    private String contactEmail;

    @NotBlank(message = "Contact phone number is required")
    @Schema(description = "Contact phone number")
    private String contactPhone;

    @NotNull(message = "Opening time is required")
    @Schema(description = "Venue opening time (HH:mm)", example = "06:00")
    private LocalTime openTime;

    @NotNull(message = "Closing time is required")
    @Schema(description = "Venue closing time (HH:mm)", example = "23:00")
    private LocalTime closeTime;

    @NotNull(message = "Sports list is required")
    @Schema(description = "List of sports offered at this venue", example = "[\"Football\", \"Cricket\"]")
    private List<String> sports;

    @Schema(description = "List of manager user IDs (from auth-service) to assign to this venue")
    private List<Long> managerUserIds;

    @Schema(description = "List of amenities offered at this venue", example = "[\"Washroom\", \"Parking\"]")
    private List<String> amenities;
}
