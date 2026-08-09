package com.sportsphere.sportsservice.controller;

import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.sportsservice.dto.*;
import com.sportsphere.sportsservice.service.VenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sports/venues")
@RequiredArgsConstructor
@Tag(name = "Venues", description = "Venue management endpoints")
public class VenueController {

    private final VenueService venueService;

    // ─────────────────────────────────────────────────────────────────────────────
    // VENUE CRUD
    // ─────────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Create a new venue (ADMIN or MANAGER)")
    @PostMapping
    public ResponseEntity<VenueResponse> createVenue(
            @Valid @RequestBody CreateVenueRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "ADMIN", "MANAGER");
        return ResponseEntity.status(HttpStatus.CREATED).body(venueService.createVenue(request, getUserId(httpRequest), getRole(httpRequest)));
    }

    @Operation(summary = "Update venue details (ADMIN or venue MANAGER)")
    @PutMapping("/{id}")
    public ResponseEntity<VenueResponse> updateVenue(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVenueRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(venueService.updateVenue(id, request,
                getUserId(httpRequest), getRole(httpRequest)));
    }

    @Operation(summary = "Soft-delete a venue (ADMIN only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteVenue(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "ADMIN");
        return ResponseEntity.ok(venueService.softDeleteVenue(id));
    }

    @Operation(summary = "Get venue by ID (public)")
    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> getVenue(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @Operation(summary = "List all active venues paginated (public)")
    @GetMapping
    public ResponseEntity<Page<VenueResponse>> getAllVenues(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(venueService.getAllVenues(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @Operation(summary = "Get nearby venues sorted by distance (public)")
    @GetMapping("/nearby")
    public ResponseEntity<List<VenueResponse>> getNearbyVenues(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius) {
        return ResponseEntity.ok(venueService.getNearbyVenues(lat, lng, radius));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MANAGERS
    // ─────────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Get venues for the logged-in manager (MANAGER only)")
    @GetMapping("/my-venues")
    public ResponseEntity<List<VenueResponse>> getMyVenues(HttpServletRequest httpRequest) {
        requireRole(httpRequest, "MANAGER");
        return ResponseEntity.ok(venueService.getMyVenues(getUserId(httpRequest)));
    }

    @Operation(summary = "Add a manager to venue (ADMIN only)")
    @PostMapping("/{id}/managers")
    public ResponseEntity<MessageResponse> addManager(
            @PathVariable Long id,
            @Valid @RequestBody AddManagerRequest request,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "ADMIN");
        return ResponseEntity.ok(venueService.addManager(id, request.getUserId()));
    }

    @Operation(summary = "Remove a manager from venue (ADMIN only)")
    @DeleteMapping("/{id}/managers/{userId}")
    public ResponseEntity<MessageResponse> removeManager(
            @PathVariable Long id,
            @PathVariable Long userId,
            HttpServletRequest httpRequest) {
        requireRole(httpRequest, "ADMIN");
        return ResponseEntity.ok(venueService.removeManager(id, userId));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // IMAGES
    // ─────────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Upload a venue image to Google Drive (ADMIN or MANAGER)")
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VenueImageResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpRequest) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(venueService.uploadImage(id, file, getUserId(httpRequest), getRole(httpRequest)));
    }

    @Operation(summary = "Delete a venue image (ADMIN or MANAGER)")
    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<MessageResponse> deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(venueService.deleteImage(id, imageId,
                getUserId(httpRequest), getRole(httpRequest)));
    }

    @Operation(summary = "Set primary image for venue (ADMIN or MANAGER)")
    @PatchMapping("/{id}/images/{imageId}/primary")
    public ResponseEntity<MessageResponse> setPrimaryImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(venueService.setPrimaryImage(id, imageId,
                getUserId(httpRequest), getRole(httpRequest)));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SPORTS
    // ─────────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Add a sport to venue (ADMIN or MANAGER)")
    @PostMapping("/{id}/sports")
    public ResponseEntity<MessageResponse> addSport(
            @PathVariable Long id,
            @Valid @RequestBody AddSportRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(venueService.addSport(id, request.getSportName(),
                getUserId(httpRequest), getRole(httpRequest)));
    }

    @Operation(summary = "Remove a sport from venue (ADMIN or MANAGER)")
    @DeleteMapping("/{id}/sports/{sportName}")
    public ResponseEntity<MessageResponse> removeSport(
            @PathVariable Long id,
            @PathVariable String sportName,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(venueService.removeSport(id, sportName,
                getUserId(httpRequest), getRole(httpRequest)));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TURFS
    // ─────────────────────────────────────────────────────────────────────────────

    @Operation(summary = "Add a turf/court to venue (ADMIN or MANAGER)")
    @PostMapping("/{id}/turfs")
    public ResponseEntity<TurfResponse> addTurf(
            @PathVariable Long id,
            @Valid @RequestBody CreateTurfRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(venueService.addTurf(id, request, getUserId(httpRequest), getRole(httpRequest)));
    }

    @Operation(summary = "Update turf details (ADMIN or MANAGER)")
    @PutMapping("/{id}/turfs/{turfId}")
    public ResponseEntity<TurfResponse> updateTurf(
            @PathVariable Long id,
            @PathVariable Long turfId,
            @Valid @RequestBody UpdateTurfRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(venueService.updateTurf(turfId, request,
                getUserId(httpRequest), getRole(httpRequest)));
    }

    @Operation(summary = "Soft-delete a turf (ADMIN or MANAGER)")
    @DeleteMapping("/{id}/turfs/{turfId}")
    public ResponseEntity<MessageResponse> deleteTurf(
            @PathVariable Long id,
            @PathVariable Long turfId,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(venueService.deleteTurf(turfId,
                getUserId(httpRequest), getRole(httpRequest)));
    }

    @Operation(summary = "Get turf details by ID (public)")
    @GetMapping("/turfs/{turfId}")
    public ResponseEntity<TurfResponse> getTurf(@PathVariable Long turfId) {
        return ResponseEntity.ok(venueService.getTurfById(turfId));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TURF PRICING
    // ─────────────────────────────────────────────────────────────────────────────
    
    // Pricing is now handled via pricePerHour directly on the Turf entity

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────────────────────────────────────────

    private Long getUserId(HttpServletRequest request) {
        String userIdStr = request.getHeader("X-User-Id");
        if (userIdStr != null && !userIdStr.isEmpty()) {
            try {
                return Long.parseLong(userIdStr);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private String getRole(HttpServletRequest request) {
        return request.getHeader("X-User-Role");
    }

    private void requireRole(HttpServletRequest request, String... requiredRoles) {
        String role = getRole(request);
        for (String requiredRole : requiredRoles) {
            if (requiredRole.equalsIgnoreCase(role)) {
                return;
            }
        }
        throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Only " + String.join(" or ", requiredRoles) + " can perform this action");
    }
}
