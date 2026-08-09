package com.sportsphere.sportsservice.service.impl;

import com.sportsphere.common.dto.MessageResponse;
import com.sportsphere.sportsservice.dto.*;
import com.sportsphere.sportsservice.entity.*;
import com.sportsphere.sportsservice.repository.*;
import com.sportsphere.sportsservice.service.CloudinaryService;
import com.sportsphere.sportsservice.service.LocalFileStorageService;
import com.sportsphere.sportsservice.service.VenueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    private final VenueManagerRepository venueManagerRepository;
    private final VenueImageRepository venueImageRepository;
    private final VenueSportRepository venueSportRepository;
    private final TurfRepository turfRepository;
    private final VenueReviewRepository venueReviewRepository;

    // private final LocalFileStorageService localFileStorageService;
    private final CloudinaryService cloudinaryService;

    // ─────────────────────────────────────────────────────────────────────────────
    // VENUE CRUD
    // ─────────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VenueResponse createVenue(CreateVenueRequest request, Long requestingUserId, String requestingRole) {
        Venue venue = Venue.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .pincode(request.getPincode())
                .state(request.getState())
                .country(request.getCountry())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .googleMapsLink(request.getGoogleMapsLink())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .openTime(request.getOpenTime())
                .closeTime(request.getCloseTime())
                .amenities(request.getAmenities())
                .build();

        venue = venueRepository.save(venue);

        // Add sports
        if (request.getSports() != null) {
            for (String sport : request.getSports()) {
                venueSportRepository.save(VenueSport.builder()
                        .venue(venue)
                        .sportName(sport)
                        .build());
            }
        }

        // Add managers
        if (request.getManagerUserIds() != null) {
            for (Long userId : request.getManagerUserIds()) {
                venueManagerRepository.save(VenueManager.builder()
                        .venue(venue)
                        .userId(userId)
                        .build());
            }
        }

        // If created by a MANAGER, automatically assign them as a manager of this new
        // venue
        if ("MANAGER".equalsIgnoreCase(requestingRole) && requestingUserId != null) {
            if (request.getManagerUserIds() == null || !request.getManagerUserIds().contains(requestingUserId)) {
                venueManagerRepository.save(VenueManager.builder()
                        .venue(venue)
                        .userId(requestingUserId)
                        .build());
            }
        }

        return mapToResponse(venueRepository.findById(venue.getId()).orElseThrow(), null);
    }

    @Override
    @Transactional
    public VenueResponse updateVenue(Long venueId, UpdateVenueRequest request,
            Long requestingUserId, String requestingRole) {
        Venue venue = getVenueOrThrow(venueId);
        checkManagerAccess(venueId, requestingUserId, requestingRole);

        if (request.getName() != null)
            venue.setName(request.getName());
        if (request.getDescription() != null)
            venue.setDescription(request.getDescription());
        if (request.getAddress() != null)
            venue.setAddress(request.getAddress());
        if (request.getCity() != null)
            venue.setCity(request.getCity());
        if (request.getPincode() != null)
            venue.setPincode(request.getPincode());
        if (request.getState() != null)
            venue.setState(request.getState());
        if (request.getCountry() != null)
            venue.setCountry(request.getCountry());
        if (request.getLatitude() != null)
            venue.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)
            venue.setLongitude(request.getLongitude());
        if (request.getGoogleMapsLink() != null)
            venue.setGoogleMapsLink(request.getGoogleMapsLink());
        if (request.getContactEmail() != null)
            venue.setContactEmail(request.getContactEmail());
        if (request.getContactPhone() != null)
            venue.setContactPhone(request.getContactPhone());
        if (request.getOpenTime() != null)
            venue.setOpenTime(request.getOpenTime());
        if (request.getCloseTime() != null)
            venue.setCloseTime(request.getCloseTime());
        if (request.getIsActive() != null)
            venue.setActive(request.getIsActive());
        if (request.getAmenities() != null)
            venue.setAmenities(request.getAmenities());

        return mapToResponse(venueRepository.save(venue), null);
    }

    @Override
    @Transactional
    public MessageResponse softDeleteVenue(Long venueId) {
        Venue venue = getVenueOrThrow(venueId);
        venue.setActive(false);
        venueRepository.save(venue);
        return MessageResponse.builder().message("Venue deactivated successfully").build();
    }

    @Override
    public VenueResponse getVenueById(Long venueId) {
        return mapToResponse(getVenueOrThrow(venueId), null);
    }

    @Override
    public Page<VenueResponse> getAllVenues(Pageable pageable) {
        return venueRepository.findByIsActiveTrue(pageable)
                .map(v -> mapToResponse(v, null));
    }

    @Override
    public List<VenueResponse> getNearbyVenues(double lat, double lng, double radiusKm) {
        return venueRepository.findNearbyVenues(lat, lng, radiusKm)
                .stream()
                .map(v -> {
                    double dist = haversine(lat, lng, v.getLatitude(), v.getLongitude());
                    return mapToResponse(v, Math.round(dist * 10.0) / 10.0);
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MANAGERS
    // ─────────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public MessageResponse addManager(Long venueId, Long userId) {
        Venue venue = getVenueOrThrow(venueId);
        if (venueManagerRepository.existsByVenueIdAndUserId(venueId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a manager of this venue");
        }
        venueManagerRepository.save(VenueManager.builder().venue(venue).userId(userId).build());
        return MessageResponse.builder().message("Manager added successfully").build();
    }
    // ─── Manager Management ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse> getMyVenues(Long managerId) {
        if (managerId == null) {
            return List.of();
        }
        return venueManagerRepository.findByUserId(managerId).stream()
                .map(VenueManager::getVenue)
                .filter(Venue::isActive)
                .map(v -> mapToResponse(v, null))
                .toList();
    }

    @Override
    @Transactional
    public MessageResponse removeManager(Long venueId, Long userId) {
        getVenueOrThrow(venueId);
        if (!venueManagerRepository.existsByVenueIdAndUserId(venueId, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found for this venue");
        }
        venueManagerRepository.deleteByVenueIdAndUserId(venueId, userId);
        return MessageResponse.builder().message("Manager removed successfully").build();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // IMAGES
    // ─────────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VenueImageResponse uploadImage(Long venueId, MultipartFile file,
            Long requestingUserId, String requestingRole) throws IOException {
        Venue venue = getVenueOrThrow(venueId);
        checkManagerAccess(venueId, requestingUserId, requestingRole);

        java.util.Map uploadResult = cloudinaryService.uploadFile(file);
        String publicId = (String) uploadResult.get("public_id");
        String url = (String) uploadResult.get("secure_url");

        boolean isFirst = venueImageRepository.findByVenueId(venueId).isEmpty();
        VenueImage image = venueImageRepository.save(VenueImage.builder()
                .venue(venue)
                .imageId(publicId)
                .imageUrl(url)
                .isPrimary(isFirst)
                .build());

        return mapImageToResponse(image);
    }

    @Override
    @Transactional
    public MessageResponse deleteImage(Long venueId, Long imageId,
            Long requestingUserId, String requestingRole) {
        getVenueOrThrow(venueId);
        checkManagerAccess(venueId, requestingUserId, requestingRole);

        VenueImage image = venueImageRepository.findById(imageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));

        cloudinaryService.deleteFile(image.getImageId());
        venueImageRepository.delete(image);
        return MessageResponse.builder().message("Image deleted successfully").build();
    }

    @Override
    @Transactional
    public MessageResponse setPrimaryImage(Long venueId, Long imageId,
            Long requestingUserId, String requestingRole) {
        getVenueOrThrow(venueId);
        checkManagerAccess(venueId, requestingUserId, requestingRole);

        // Clear existing primary
        venueImageRepository.findByVenueId(venueId).forEach(img -> {
            img.setPrimary(false);
            venueImageRepository.save(img);
        });

        VenueImage image = venueImageRepository.findById(imageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
        image.setPrimary(true);
        venueImageRepository.save(image);
        return MessageResponse.builder().message("Primary image updated").build();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SPORTS
    // ─────────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public MessageResponse addSport(Long venueId, String sportName,
            Long requestingUserId, String requestingRole) {
        Venue venue = getVenueOrThrow(venueId);
        checkManagerAccess(venueId, requestingUserId, requestingRole);

        if (venueSportRepository.existsByVenueIdAndSportNameIgnoreCase(venueId, sportName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sport already exists at this venue");
        }
        venueSportRepository.save(VenueSport.builder().venue(venue).sportName(sportName).build());
        return MessageResponse.builder().message("Sport added successfully").build();
    }

    @Override
    @Transactional
    public MessageResponse removeSport(Long venueId, String sportName,
            Long requestingUserId, String requestingRole) {
        getVenueOrThrow(venueId);
        checkManagerAccess(venueId, requestingUserId, requestingRole);
        venueSportRepository.findByVenueIdAndSportNameIgnoreCase(venueId, sportName)
                .ifPresent(venueSportRepository::delete);
        return MessageResponse.builder().message("Sport removed successfully").build();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // TURFS
    // ─────────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TurfResponse addTurf(Long venueId, CreateTurfRequest request,
            Long requestingUserId, String requestingRole) {
        Venue venue = getVenueOrThrow(venueId);
        checkManagerAccess(venueId, requestingUserId, requestingRole);

        Turf turf = turfRepository.save(Turf.builder()
                .venue(venue)
                .name(request.getName())
                .sport(request.getSport())
                .surfaceType(request.getSurfaceType())
                .capacity(request.getCapacity())
                .lengthFt(request.getLengthFt())
                .widthFt(request.getWidthFt())
                .isIndoor(request.getIsIndoor() != null && request.getIsIndoor())
                .pricePerHour(request.getPricePerHour())
                .build());

        return mapTurfToResponse(turf);
    }

    @Override
    @Transactional
    public TurfResponse updateTurf(Long turfId, UpdateTurfRequest request,
            Long requestingUserId, String requestingRole) {
        Turf turf = getTurfOrThrow(turfId);
        checkManagerAccess(turf.getVenue().getId(), requestingUserId, requestingRole);

        if (request.getName() != null)
            turf.setName(request.getName());
        if (request.getSport() != null)
            turf.setSport(request.getSport());
        if (request.getSurfaceType() != null)
            turf.setSurfaceType(request.getSurfaceType());
        if (request.getCapacity() != null)
            turf.setCapacity(request.getCapacity());
        if (request.getLengthFt() != null)
            turf.setLengthFt(request.getLengthFt());
        if (request.getWidthFt() != null)
            turf.setWidthFt(request.getWidthFt());
        if (request.getIsIndoor() != null)
            turf.setIndoor(request.getIsIndoor());
        if (request.getPricePerHour() != null)
            turf.setPricePerHour(request.getPricePerHour());
        if (request.getIsActive() != null)
            turf.setActive(request.getIsActive());

        return mapTurfToResponse(turfRepository.save(turf));
    }

    @Override
    @Transactional
    public MessageResponse deleteTurf(Long turfId, Long requestingUserId, String requestingRole) {
        Turf turf = getTurfOrThrow(turfId);
        checkManagerAccess(turf.getVenue().getId(), requestingUserId, requestingRole);
        turf.setActive(false);
        turfRepository.save(turf);
        return MessageResponse.builder().message("Turf deactivated successfully").build();
    }

    @Override
    public TurfResponse getTurfById(Long turfId) {
        return mapTurfToResponse(getTurfOrThrow(turfId));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────────

    private Venue getVenueOrThrow(Long venueId) {
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue not found"));
    }

    private Turf getTurfOrThrow(Long turfId) {
        return turfRepository.findById(turfId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Turf not found"));
    }

    /**
     * Checks that the requesting user is either ADMIN or a registered manager of
     * the venue.
     * Throws 403 if not authorized.
     */
    private void checkManagerAccess(Long venueId, Long requestingUserId, String requestingRole) {
        if ("ADMIN".equalsIgnoreCase(requestingRole))
            return;
        if (!venueManagerRepository.existsByVenueIdAndUserId(venueId, requestingUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not a manager of this venue");
        }
    }

    /**
     * Haversine formula to compute distance in km between two lat/lng coordinates
     */
    private double haversine(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MAPPERS
    // ─────────────────────────────────────────────────────────────────────────────

    private VenueResponse mapToResponse(Venue v, Double distanceKm) {
        List<VenueImage> images = venueImageRepository.findByVenueId(v.getId());
        List<VenueSport> sports = venueSportRepository.findByVenueId(v.getId());
        List<VenueManager> managers = venueManagerRepository.findByVenueId(v.getId());
        List<Turf> turfs = turfRepository.findByVenueId(v.getId());

        Double averageRating = venueReviewRepository.getAverageRatingByVenueId(v.getId());
        Long reviewCount = venueReviewRepository.countByVenueId(v.getId());
        String ratingInfo = null;
        if (averageRating != null && reviewCount != null && reviewCount > 0) {
            ratingInfo = String.format("%.1f (%d)", averageRating, reviewCount);
        }

        String primaryImageUrl = images.stream()
                .filter(VenueImage::isPrimary)
                .map(VenueImage::getImageUrl)
                .findFirst()
                .orElse(images.isEmpty() ? null : images.get(0).getImageUrl());

        return VenueResponse.builder()
                .id(v.getId())
                .name(v.getName())
                .description(v.getDescription())
                .address(v.getAddress())
                .city(v.getCity())
                .pincode(v.getPincode())
                .state(v.getState())
                .country(v.getCountry())
                .latitude(v.getLatitude())
                .longitude(v.getLongitude())
                .googleMapsLink(v.getGoogleMapsLink())
                .contactEmail(v.getContactEmail())
                .contactPhone(v.getContactPhone())
                .openTime(v.getOpenTime())
                .closeTime(v.getCloseTime())
                .isActive(v.isActive())
                .images(images.stream().map(this::mapImageToResponse).collect(Collectors.toList()))
                .primaryImageUrl(primaryImageUrl)
                .sports(sports.stream().map(VenueSport::getSportName).collect(Collectors.toList()))
                .amenities(v.getAmenities())
                .managerUserIds(managers.stream().map(VenueManager::getUserId).collect(Collectors.toList()))
                .turfs(turfs.stream().map(this::mapTurfToResponse).collect(Collectors.toList()))
                .distanceKm(distanceKm)
                .averageRating(averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : null)
                .reviewCount(reviewCount)
                .ratingInfo(ratingInfo)
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }

    private VenueImageResponse mapImageToResponse(VenueImage img) {
        return VenueImageResponse.builder()
                .id(img.getId())
                .imageId(img.getImageId())
                .imageUrl(img.getImageUrl())
                .isPrimary(img.isPrimary())
                .build();
    }

    private TurfResponse mapTurfToResponse(Turf t) {
        return TurfResponse.builder()
                .id(t.getId())
                .venueId(t.getVenue().getId())
                .name(t.getName())
                .sport(t.getSport())
                .surfaceType(t.getSurfaceType())
                .capacity(t.getCapacity())
                .lengthFt(t.getLengthFt())
                .widthFt(t.getWidthFt())
                .isIndoor(t.isIndoor())
                .isActive(t.isActive())
                .pricePerHour(t.getPricePerHour())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

}
