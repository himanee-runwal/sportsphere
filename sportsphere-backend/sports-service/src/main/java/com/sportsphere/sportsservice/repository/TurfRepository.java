package com.sportsphere.sportsservice.repository;

import com.sportsphere.sportsservice.entity.Turf;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TurfRepository extends JpaRepository<Turf, Long> {
    List<Turf> findByVenueId(Long venueId);

    List<Turf> findByVenueIdAndIsActiveTrue(Long venueId);
}
