package com.sportsphere.sportsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String pincode;
    private String state;
    private String country;
    private Double latitude;
    private Double longitude;
    private String googleMapsLink;
    private String contactEmail;
    private String contactPhone;
    private LocalTime openTime;
    private LocalTime closeTime;
    private boolean isActive;

    // Images
    private List<VenueImageResponse> images;
    private String primaryImageUrl;

    // Sports offered
    private List<String> sports;

    // Amenities
    private List<String> amenities;

    // Managers (user IDs from auth-service)
    private List<Long> managerUserIds;

    // Turfs
    private List<TurfResponse> turfs;

    // Distance from user (set when using /nearby endpoint)
    private Double distanceKm;

    // Rating
    private Double averageRating;
    private Long reviewCount;
    private String ratingInfo; // e.g. "4.5 (10)"

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
