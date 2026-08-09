package com.sportsphere.sportsservice.repository;

import com.sportsphere.sportsservice.entity.VenueManager;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VenueManagerRepository extends JpaRepository<VenueManager, Long> {
    List<VenueManager> findByVenueId(Long venueId);

    Optional<VenueManager> findByVenueIdAndUserId(Long venueId, Long userId);

    boolean existsByVenueIdAndUserId(Long venueId, Long userId);

    List<VenueManager> findByUserId(Long userId);

    void deleteByVenueIdAndUserId(Long venueId, Long userId);
}
