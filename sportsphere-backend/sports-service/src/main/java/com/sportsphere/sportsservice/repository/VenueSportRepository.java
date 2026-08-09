package com.sportsphere.sportsservice.repository;

import com.sportsphere.sportsservice.entity.VenueSport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VenueSportRepository extends JpaRepository<VenueSport, Long> {
    List<VenueSport> findByVenueId(Long venueId);

    Optional<VenueSport> findByVenueIdAndSportNameIgnoreCase(Long venueId, String sportName);

    boolean existsByVenueIdAndSportNameIgnoreCase(Long venueId, String sportName);
}
