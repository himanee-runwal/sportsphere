package com.sportsphere.sportsservice.service;

import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.sportsservice.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface VenueService {

    // ─── Venue CRUD ────────────────────────────────────────────────────────────
    VenueResponse createVenue(CreateVenueRequest request, Long requestingUserId, String requestingRole);

    VenueResponse updateVenue(Long venueId, UpdateVenueRequest request, Long requestingUserId, String requestingRole);

    MessageResponse softDeleteVenue(Long venueId);

    VenueResponse getVenueById(Long venueId);

    Page<VenueResponse> getAllVenues(Pageable pageable);

    List<VenueResponse> getNearbyVenues(double lat, double lng, double radiusKm);

    // ─── Manager Management ─────────────────────────────────────────────────────
    List<VenueResponse> getMyVenues(Long managerId);
    MessageResponse addManager(Long venueId, Long userId);

    MessageResponse removeManager(Long venueId, Long userId);

    // ─── Images ─────────────────────────────────────────────────────────────────
    VenueImageResponse uploadImage(Long venueId, MultipartFile file, Long requestingUserId, String requestingRole)
            throws IOException;

    MessageResponse deleteImage(Long venueId, Long imageId, Long requestingUserId, String requestingRole);

    MessageResponse setPrimaryImage(Long venueId, Long imageId, Long requestingUserId, String requestingRole);

    // ─── Sports ─────────────────────────────────────────────────────────────────
    MessageResponse addSport(Long venueId, String sportName, Long requestingUserId, String requestingRole);

    MessageResponse removeSport(Long venueId, String sportName, Long requestingUserId, String requestingRole);

    // ─── Turfs ──────────────────────────────────────────────────────────────────
    TurfResponse addTurf(Long venueId, CreateTurfRequest request, Long requestingUserId, String requestingRole);

    TurfResponse updateTurf(Long turfId, UpdateTurfRequest request, Long requestingUserId, String requestingRole);

    MessageResponse deleteTurf(Long turfId, Long requestingUserId, String requestingRole);

    TurfResponse getTurfById(Long turfId);

    // ─── Turf Pricing ───────────────────────────────────────────────────────────
    // Pricing is now handled via pricePerHour directly on the Turf entity

}
