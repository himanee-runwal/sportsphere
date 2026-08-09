package com.sportsphere.sportsservice.service;

import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.sportsservice.dto.VenueReviewRequest;
import com.sportsphere.sportsservice.dto.VenueReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VenueReviewService {

    /**
     * Add or update a review for a venue by a user.
     */
    VenueReviewResponse addOrUpdateReview(Long venueId, Long userId, VenueReviewRequest request);

    /**
     * Get paginated reviews for a venue.
     */
    Page<VenueReviewResponse> getVenueReviews(Long venueId, Pageable pageable);

    /**
     * Delete a review for a venue by a user.
     */
    MessageResponse deleteReview(Long venueId, Long userId);
}
