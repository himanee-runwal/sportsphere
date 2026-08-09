package com.sportsphere.sportsservice.repository;

import com.sportsphere.sportsservice.entity.VenueReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VenueReviewRepository extends JpaRepository<VenueReview, Long> {

    Page<VenueReview> findByVenueId(Long venueId, Pageable pageable);

    Optional<VenueReview> findByVenueIdAndUserId(Long venueId, Long userId);

    @Query("SELECT AVG(vr.rating) FROM VenueReview vr WHERE vr.venue.id = :venueId")
    Double getAverageRatingByVenueId(@Param("venueId") Long venueId);

    @Query("SELECT COUNT(vr) FROM VenueReview vr WHERE vr.venue.id = :venueId")
    Long countByVenueId(@Param("venueId") Long venueId);
}
