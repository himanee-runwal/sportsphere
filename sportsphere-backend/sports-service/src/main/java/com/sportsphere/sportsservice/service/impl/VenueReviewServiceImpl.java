package com.sportsphere.sportsservice.service.impl;

import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.sportsservice.dto.VenueReviewRequest;
import com.sportsphere.sportsservice.dto.VenueReviewResponse;
import com.sportsphere.sportsservice.entity.Venue;
import com.sportsphere.sportsservice.entity.VenueReview;
import com.sportsphere.sportsservice.repository.VenueRepository;
import com.sportsphere.sportsservice.repository.VenueReviewRepository;
import com.sportsphere.sportsservice.service.VenueReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VenueReviewServiceImpl implements VenueReviewService {

    private final VenueReviewRepository reviewRepository;
    private final VenueRepository venueRepository;

    @Override
    @Transactional
    public VenueReviewResponse addOrUpdateReview(Long venueId, Long userId, VenueReviewRequest request) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));

        Optional<VenueReview> existingReviewOpt = reviewRepository.findByVenueIdAndUserId(venueId, userId);

        VenueReview review;
        if (existingReviewOpt.isPresent()) {
            review = existingReviewOpt.get();
            review.setRating(request.getRating());
            review.setComment(request.getComment());
        } else {
            review = VenueReview.builder()
                    .venue(venue)
                    .userId(userId)
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .build();
        }

        VenueReview savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VenueReviewResponse> getVenueReviews(Long venueId, Pageable pageable) {
        if (!venueRepository.existsById(venueId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found");
        }
        return reviewRepository.findByVenueId(venueId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public MessageResponse deleteReview(Long venueId, Long userId) {
        VenueReview review = reviewRepository.findByVenueIdAndUserId(venueId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        
        reviewRepository.delete(review);
        return new MessageResponse("Review deleted successfully");
    }

    private VenueReviewResponse mapToResponse(VenueReview review) {
        return VenueReviewResponse.builder()
                .id(review.getId())
                .venueId(review.getVenue().getId())
                .userId(review.getUserId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
