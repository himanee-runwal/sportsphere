package com.sportsphere.sportsservice.controller;

import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.sportsservice.dto.VenueReviewRequest;
import com.sportsphere.sportsservice.dto.VenueReviewResponse;
import com.sportsphere.sportsservice.service.VenueReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/sports/venues/{venueId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Venue Reviews", description = "Endpoints for venue ratings and comments")
public class VenueReviewController {

    private final VenueReviewService venueReviewService;

    @Operation(summary = "Add or update a review for a venue (requires login)")
    @PostMapping
    public ResponseEntity<VenueReviewResponse> addOrUpdateReview(
            @PathVariable Long venueId,
            @Valid @RequestBody VenueReviewRequest request,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in to review");
        }
        return ResponseEntity.ok(venueReviewService.addOrUpdateReview(venueId, userId, request));
    }

    @Operation(summary = "Get reviews for a venue (paginated)")
    @GetMapping
    public ResponseEntity<Page<VenueReviewResponse>> getVenueReviews(
            @PathVariable Long venueId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(venueReviewService.getVenueReviews(venueId, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @Operation(summary = "Delete the logged-in user's review for a venue")
    @DeleteMapping
    public ResponseEntity<MessageResponse> deleteReview(
            @PathVariable Long venueId,
            HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be logged in to delete review");
        }
        return ResponseEntity.ok(venueReviewService.deleteReview(venueId, userId));
    }

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
}
