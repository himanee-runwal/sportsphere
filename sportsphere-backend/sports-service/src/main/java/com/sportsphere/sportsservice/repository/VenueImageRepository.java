package com.sportsphere.sportsservice.repository;

import com.sportsphere.sportsservice.entity.VenueImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VenueImageRepository extends JpaRepository<VenueImage, Long> {
    List<VenueImage> findByVenueId(Long venueId);

    Optional<VenueImage> findByVenueIdAndIsPrimaryTrue(Long venueId);

    void deleteByVenueId(Long venueId);
}
