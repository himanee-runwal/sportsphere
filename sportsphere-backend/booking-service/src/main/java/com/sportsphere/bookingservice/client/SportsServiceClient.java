package com.sportsphere.bookingservice.client;

import com.sportsphere.bookingservice.dto.TurfResponse;
import com.sportsphere.bookingservice.dto.VenueResponse;
import com.sportsphere.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class SportsServiceClient {

    private final RestTemplate restTemplate;

    @Value("${sports-service.url}")
    private String sportsServiceUrl;

    public TurfResponse getTurfById(Long turfId) {
        String url = sportsServiceUrl + "/api/v1/sports/venues/turfs/" + turfId;
        try {
            log.info("Fetching turf details from sports-service: {}", url);
            return restTemplate.getForObject(url, TurfResponse.class);
        } catch (HttpClientErrorException.NotFound e) {
            log.error("Turf not found in sports-service: ID {}", turfId);
            throw new ResourceNotFoundException("Turf not found with ID: " + turfId);
        } catch (Exception e) {
            log.error("Failed to fetch turf details from sports-service for ID {}: {}", turfId, e.getMessage());
            throw new RuntimeException("Error communicating with sports service: " + e.getMessage());
        }
    }

    public VenueResponse getVenueById(Long venueId) {
        String url = sportsServiceUrl + "/api/v1/sports/venues/" + venueId;
        try {
            log.info("Fetching venue details from sports-service: {}", url);
            return restTemplate.getForObject(url, VenueResponse.class);
        } catch (HttpClientErrorException.NotFound e) {
            log.error("Venue not found in sports-service: ID {}", venueId);
            throw new ResourceNotFoundException("Venue not found with ID: " + venueId);
        } catch (Exception e) {
            log.error("Failed to fetch venue details from sports-service for ID {}: {}", venueId, e.getMessage());
            throw new RuntimeException("Error communicating with sports service: " + e.getMessage());
        }
    }
}
