package com.sportsphere.sportsservice.repository;

import com.sportsphere.sportsservice.entity.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    Page<Venue> findByIsActiveTrue(Pageable pageable);

    Page<Venue> findByCityIgnoreCaseAndIsActiveTrue(String city, Pageable pageable);

    /**
     * Find venues within a given radius (km) sorted by distance using Haversine
     * formula.
     * Returns venues where isActive = true.
     */
    @Query(value = """
            SELECT v.*, (
                6371 * acos(
                    cos(radians(:lat)) * cos(radians(v.latitude)) *
                    cos(radians(v.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(v.latitude))
                )
            ) AS distance
            FROM venues v
            WHERE v.is_active = true
              AND v.latitude IS NOT NULL
              AND v.longitude IS NOT NULL
            HAVING distance <= :radiusKm
            ORDER BY distance ASC
            """, nativeQuery = true)
    List<Venue> findNearbyVenues(@Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm);
}
