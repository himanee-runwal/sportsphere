package com.sportsphere.sportsservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Request to update venue details — all fields optional (partial update)")
public class UpdateVenueRequest {

    @Schema(description = "Venue name")
    private String name;

    @Schema(description = "Venue description")
    private String description;

    @Schema(description = "Street address")
    private String address;

    @Schema(description = "City")
    private String city;

    @Schema(description = "Pincode")
    private String pincode;

    @Schema(description = "State")
    private String state;

    @Schema(description = "Country")
    private String country;

    @Schema(description = "Latitude")
    private Double latitude;

    @Schema(description = "Longitude")
    private Double longitude;

    @Schema(description = "Google Maps link")
    private String googleMapsLink;

    @Schema(description = "Contact email")
    private String contactEmail;

    @Schema(description = "Contact phone")
    private String contactPhone;

    @Schema(description = "Venue opening time (HH:mm)", example = "06:00")
    private LocalTime openTime;

    @Schema(description = "Venue closing time (HH:mm)", example = "23:00")
    private LocalTime closeTime;

    @Schema(description = "Set venue active/inactive")
    private Boolean isActive;

    @Schema(description = "List of amenities offered at this venue")
    private List<String> amenities;
}
