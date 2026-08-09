package com.sportsphere.sportsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueImageResponse {
    private Long id;
    private String imageId;
    private String imageUrl;
    private boolean isPrimary;
}
