import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router';
import { toast } from 'react-toastify';
import { venueApi } from '../api/venueApi';
import { bookingApi } from '../api/bookingApi';
import {
  BiUser,
  BiBadgeCheck,
  BiBuilding,
  BiPlusCircle,
  BiKey,
  BiCheckCircle,
  BiMap,
  BiSearch,
  BiFootball,
  BiCrosshair,
  BiCalendarCheck,
  BiImage,
  BiToggleLeft,
  BiToggleRight,
  BiTrash,
  BiEnvelope,
  BiRupee,
  BiCheckDouble,
  BiCamera,
  BiUpload,
  BiPencil,
  BiFilterAlt,
  BiReset,
  BiGridAlt,
  BiCalendar,
  BiUserCheck,
  BiPhone,
  BiTimeFive
} from 'react-icons/bi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// Sample venue image presets
const VENUE_IMAGE_PRESETS = [
  {
    name: 'Football Turf Template',
    url: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&auto=format&fit=crop'
  },
  {
    name: 'Badminton Court Template',
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop'
  },
  {
    name: 'Cricket Turf Template',
    url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop'
  },
  {
    name: 'Tennis Court Template',
    url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop'
  }
];

// Available sports dropdown options
const SPORT_OPTIONS = ['Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball', 'Pickleball', 'Swimming'];

// Default profile avatar fallback SVG generator
const getDefaultAvatar = (name = 'User') => {
  const initial = (name[0] || 'U').toUpperCase();
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230F766E"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="40" font-family="sans-serif" font-weight="bold">${initial}</text></svg>`;
};

const formatTime12 = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${m} ${ampm}`;
};

const DashboardPage = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Profile Avatar State
  const [userAvatar, setUserAvatar] = useState(
    user?.profileImage || getDefaultAvatar(user?.firstName || user?.name || 'User')
  );

  // Location search state for Players/Managers
  const [selectedLocation, setSelectedLocation] = useState('Mumbai');
  const [locationInput, setLocationInput] = useState('');

  // Admin Tab Navigation State: 'venues' | 'add-venue' | 'bookings'
  const [adminTab, setAdminTab] = useState('venues');

  // Selected Manager Modal State for viewing owner full profile
  const [selectedManagerModal, setSelectedManagerModal] = useState(null);

  // Admin Venue Details State
  const [selectedAdminVenue, setSelectedAdminVenue] = useState(null);

  // Edit Venue Modal State
  const [isEditVenueModalOpen, setIsEditVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editVenueLoading, setEditVenueLoading] = useState(false);

  // Edit Turf Modal State
  const [isEditTurfModalOpen, setIsEditTurfModalOpen] = useState(false);
  const [editingTurf, setEditingTurf] = useState(null);
  const [editingVenueIdForTurf, setEditingVenueIdForTurf] = useState(null);
  const [editTurfLoading, setEditTurfLoading] = useState(false);

  // Admin Venues Search & Filter State
  const [searchVenueName, setSearchVenueName] = useState('');
  const [searchCity, setSearchCity] = useState('ALL');
  const [searchStatus, setSearchStatus] = useState('ALL');
  const [searchSport, setSearchSport] = useState('ALL');

  // Admin state for multi-court sports venues with DYNAMIC DAY-WISE PRICING
  const [venues, setVenues] = useState([]);
  const [venuesLoading, setVenuesLoading] = useState(false);

  // Player Bookings State
  const [myBookings, setMyBookings] = useState([]);
  const [myBookingsLoading, setMyBookingsLoading] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setVenuesLoading(true);
        let data;
        if (user?.role === 'MANAGER' || user?.role === 'VENUE_MANAGER') {
          data = await venueApi.getMyVenues();
        } else {
          data = await venueApi.getAllVenues(0, 50);
        }
        
        // Map the backend response to the UI format
        const mappedVenues = (data.content || data || []).map(v => ({
          ...v,
          location: v.city ? `${v.address}, ${v.city}` : v.address,
          sports: v.sports ? v.sports.join(', ') : '',
          isOnline: v.isActive ?? true,
          imageUrl: v.primaryImageUrl || VENUE_IMAGE_PRESETS[0].url,
          managerName: v.managerName || 'Assigned Manager',
          managerEmail: v.contactEmail
        }));
        
        setVenues(mappedVenues);
      } catch (error) {
        toast.error('Failed to load venues');
        console.error(error);
      } finally {
        setVenuesLoading(false);
      }
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchMyBookings = async () => {
        try {
          setMyBookingsLoading(true);
          const data = await bookingApi.getMyBookings();
          setMyBookings(data || []);
        } catch (error) {
          toast.error('Failed to load your bookings');
          console.error(error);
        } finally {
          setMyBookingsLoading(false);
        }
      };
      fetchMyBookings();
    }
  }, [isAuthenticated]);

  const getGroundDetails = (groundId) => {
    for (const venue of venues) {
      if (venue.turfs) {
        const turf = venue.turfs.find(t => t.id === groundId);
        if (turf) {
          return {
            turfName: turf.name,
            venueName: venue.name,
            sport: turf.sport
          };
        }
      }
    }
    return {
      turfName: `Ground #${groundId}`,
      venueName: 'SportSphere Venue',
      sport: 'Sports'
    };
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const cancelledBooking = await bookingApi.cancelBooking(bookingId);
        toast.success(`Booking ${cancelledBooking.bookingNumber} has been cancelled.`);
        setMyBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'CANCELLED' } : b));
      } catch (error) {
        toast.error(error.message || 'Failed to cancel booking');
        console.error(error);
      }
    }
  };

  // Date-wise Booking Analytics Dataset
  const [dateAnalytics] = useState([
    {
      id: 1,
      date: '2026-07-28',
      venueName: 'Apex Sports Arena',
      totalBookingsCount: 8,
      confirmedCount: 7,
      cancelledCount: 1,
      dateRevenue: 9600
    },
    {
      id: 2,
      date: '2026-07-28',
      venueName: 'Metro Badminton & Tennis Club',
      totalBookingsCount: 5,
      confirmedCount: 5,
      cancelledCount: 0,
      dateRevenue: 4000
    },
    {
      id: 3,
      date: '2026-07-29',
      venueName: 'Apex Sports Arena',
      totalBookingsCount: 6,
      confirmedCount: 6,
      cancelledCount: 0,
      dateRevenue: 7200
    },
    {
      id: 4,
      date: '2026-07-29',
      venueName: 'Metro Badminton & Tennis Club',
      totalBookingsCount: 4,
      confirmedCount: 4,
      cancelledCount: 0,
      dateRevenue: 3200
    },
    {
      id: 5,
      date: '2026-07-30',
      venueName: 'Pinnacle Cricket Enclosure',
      totalBookingsCount: 3,
      confirmedCount: 3,
      cancelledCount: 0,
      dateRevenue: 3000
    }
  ]);

  // Analytics tab filters
  const [analyticsVenueFilter, setAnalyticsVenueFilter] = useState('ALL');
  const [analyticsDateFilter, setAnalyticsDateFilter] = useState('');

  // Form state for adding new venue with MULTIPLE COURTS & DYNAMIC DAY PRICING
  const [newVenue, setNewVenue] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    country: 'India',
    latitude: '',
    longitude: '',
    googleMapsLink: '',
    amenities: '',
    openTime: '06:00',
    closeTime: '23:00',
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    managerPassword: '',
    contactEmail: '',
    contactPhone: '',
    imageUrl: VENUE_IMAGE_PRESETS[0].url,
    imageFileName: '',
    courts: [
      { 
        id: 1, 
        namePrefix: 'Main Turf', 
        sport: 'Football', 
        surfaceType: 'Artificial Grass',
        capacity: 14,
        lengthFt: 100,
        widthFt: 60,
        isIndoor: false,
        pricePerHour: '1000',
        count: 1
      }
    ]
  });

  // Multi-step Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [resolvedManagerId, setResolvedManagerId] = useState(null);
  const [managerExists, setManagerExists] = useState(false);

  // Quick popular Indian cities
  const popularCities = ['Mumbai', 'Pune', 'Bangalore', 'Chennai'];

  // Add court row handler
  const handleAddCourt = () => {
    setNewVenue((prev) => ({
      ...prev,
      courts: [
        ...prev.courts,
        {
          id: Date.now(),
          namePrefix: `Court ${prev.courts.length + 1}`,
          sport: 'Badminton',
          surfaceType: 'Wooden',
          capacity: 4,
          lengthFt: 44,
          widthFt: 20,
          isIndoor: true,
          pricePerHour: '600',
          count: 1
        }
      ]
    }));
  };

  // Update court row field handler
  const handleCourtChange = (index, field, value) => {
    setNewVenue((prev) => {
      const updatedCourts = [...prev.courts];
      updatedCourts[index] = { ...updatedCourts[index], [field]: value };
      return { ...prev, courts: updatedCourts };
    });
  };

  // Remove court row handler
  const handleRemoveCourt = (index) => {
    if (newVenue.courts.length === 1) {
      toast.warning('A venue must have at least one court or turf.');
      return;
    }
    setNewVenue((prev) => ({
      ...prev,
      courts: prev.courts.filter((_, i) => i !== index)
    }));
  };

  // Profile Avatar Upload Handler
  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile image must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserAvatar(event.target.result);
        toast.success('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Venue Image File Upload Handler
  const handleVenueImageFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(f => f.size <= 8 * 1024 * 1024);
      if (validFiles.length < files.length) {
        toast.error('Some images are larger than 8MB and were skipped.');
      }
      if (validFiles.length === 0) return;
      
      const file = validFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewVenue((prev) => ({
          ...prev,
          imageFiles: validFiles,
          imageUrl: event.target.result,
          imageFileName: validFiles.length === 1 ? file.name : `${validFiles.length} files selected`
        }));
        toast.success(`${validFiles.length} photo(s) selected successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (locationInput.trim()) {
      setSelectedLocation(locationInput.trim());
      toast.success(`Location set to "${locationInput.trim()}"`);
      setLocationInput('');
    }
  };

  const handleQuickCityClick = (city) => {
    setSelectedLocation(city);
    toast.success(`Location set to "${city}"`);
  };

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      toast.info('Detecting current location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `Lat: ${pos.coords.latitude.toFixed(2)}, Lon: ${pos.coords.longitude.toFixed(2)} (Current Location)`;
          setSelectedLocation(loc);
          toast.success('Current location detected successfully!');
        },
        () => {
          toast.warning('Unable to retrieve GPS location. Defaulting to Pune, MH.');
          setSelectedLocation('Pune, MH');
        }
      );
    } else {
      toast.warning('Geolocation service is not supported by your browser.');
    }
  };

  // Toggle venue online/offline status
  const handleToggleOnlineStatus = (venueId) => {
    const targetVenue = venues.find((v) => v.id === venueId);
    if (!targetVenue) return;

    const newStatus = !targetVenue.isOnline;

    setVenues((prevVenues) =>
      prevVenues.map((v) => (v.id === venueId ? { ...v, isOnline: newStatus } : v))
    );

    toast.info(
      `Venue "${targetVenue.name}" is now ${newStatus ? 'ONLINE (Visible for booking)' : 'OFFLINE (Hidden)'}`
    );
  };

  // Delete venue
  const handleDeleteVenue = (venueId, venueName) => {
    if (window.confirm(`Are you sure you want to remove venue "${venueName}"?`)) {
      setVenues((prev) => prev.filter((v) => v.id !== venueId));
      toast.success(`Venue "${venueName}" removed.`);
    }
  };

  // Step 1: Manager Lookup Handler
  const handleManagerLookup = async () => {
    if (!newVenue.managerEmail) {
      toast.error('Please enter a manager email to lookup.');
      return;
    }
    try {
      const authApi = (await import('../api/authApi')).authApi;
      const user = await authApi.lookupUserByEmail(newVenue.managerEmail);
      if (user && user.id) {
        setResolvedManagerId(user.id);
        setManagerExists(true);
        setNewVenue(prev => ({ 
          ...prev, 
          managerName: `${user.firstName} ${user.lastName}`,
          managerPhone: user.phone || '',
          contactEmail: prev.managerEmail,
          contactPhone: user.phone || ''
        }));
        toast.success(`Found existing manager: ${user.firstName} ${user.lastName}`);
      }
    } catch (err) {
      if (err.status === 404 || err.message?.includes('404')) {
        setManagerExists(false);
        setResolvedManagerId(null);
        toast.info('Manager not found. Please provide details to register a new manager.');
      } else {
        toast.error('Error looking up manager.');
      }
    }
  };

  // Step 1: Manager Register Handler
  const handleManagerRegister = async (e) => {
    if (e) e.preventDefault();
    if (!newVenue.managerEmail || !newVenue.managerPassword || !newVenue.managerName) {
      toast.error('Please provide Manager Name, Email, and Password to register them.');
      return;
    }
    try {
      toast.info('Registering manager...');
      const nameParts = newVenue.managerName.trim().split(' ');
      const managerData = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        email: newVenue.managerEmail,
        phone: newVenue.managerPhone,
        password: newVenue.managerPassword,
        role: 'MANAGER'
      };
      
      const authApi = (await import('../api/authApi')).authApi;
      const registeredManager = await authApi.createManager(managerData);
      
      if (registeredManager && registeredManager.id) {
        setResolvedManagerId(registeredManager.id);
        setManagerExists(true);
        setNewVenue(prev => ({
          ...prev,
          contactEmail: prev.managerEmail,
          contactPhone: prev.managerPhone
        }));
        toast.success(`Manager ${registeredManager.firstName} created successfully!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create manager.');
    }
  };

  // Add new venue submit handler (Step 2)
  const handleAddVenueSubmit = async (e) => {
    e.preventDefault();
    
    if (onboardingStep !== 2 || !resolvedManagerId) {
      toast.error('Manager validation is required before proceeding.');
      return;
    }

    if (!newVenue.name || !newVenue.address) {
      toast.error('Please fill in Venue Name and Address.');
      return;
    }

    if (newVenue.courts.length === 0) {
      toast.error('Please add at least one court or turf for this venue.');
      return;
    }

    try {
      toast.info('Creating venue in backend...');
      
      const managerUserId = resolvedManagerId;
      // 1. Create Venue
      const venuePayload = {
        name: newVenue.name,
        description: newVenue.description,
        address: newVenue.address,
        city: newVenue.city,
        pincode: newVenue.pincode,
        state: newVenue.state,
        country: newVenue.country,
        latitude: parseFloat(newVenue.latitude) || 0,
        longitude: parseFloat(newVenue.longitude) || 0,
        googleMapsLink: newVenue.googleMapsLink,
        contactEmail: newVenue.contactEmail,
        contactPhone: newVenue.contactPhone,
        openTime: newVenue.openTime,
        closeTime: newVenue.closeTime,
        sports: Array.from(new Set(newVenue.courts.map(c => c.sport).filter(Boolean))),
        managerUserIds: [managerUserId],
        amenities: newVenue.amenities ? newVenue.amenities.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      
      const createdVenueResponse = await venueApi.createVenue(venuePayload);
      const venueId = createdVenueResponse.id || createdVenueResponse.venueId || Date.now();

      // Upload the image files to the backend if provided
      if (newVenue.imageFiles && newVenue.imageFiles.length > 0) {
        toast.info(`Uploading ${newVenue.imageFiles.length} venue image(s)...`);
        try {
          await Promise.all(newVenue.imageFiles.map(file => venueApi.uploadVenueImage(venueId, file)));
          toast.success('Venue image(s) uploaded successfully!');
        } catch (uploadErr) {
          toast.error('Venue created, but image upload failed.');
          console.error('Image upload error:', uploadErr);
        }
      }

      // 2. Add Turfs & Pricing Slots
      for (const courtGroup of newVenue.courts) {
        const count = parseInt(courtGroup.count, 10) || 1;
        
        for (let i = 1; i <= count; i++) {
          const turfName = count > 1 ? `${courtGroup.namePrefix} ${i}` : courtGroup.namePrefix;
          
          const turfPayload = {
            name: turfName,
            sport: courtGroup.sport,
            surfaceType: courtGroup.surfaceType,
            capacity: parseInt(courtGroup.capacity, 10),
            lengthFt: parseFloat(courtGroup.lengthFt),
            widthFt: parseFloat(courtGroup.widthFt),
            isIndoor: courtGroup.isIndoor === 'true' || courtGroup.isIndoor === true,
            pricePerHour: parseFloat(courtGroup.pricePerHour)
          };

          const createdTurf = await venueApi.addTurfToVenue(venueId, turfPayload);
          const turfId = createdTurf.id || createdTurf.turfId || Date.now();
        }
      }

      toast.success(`Venue "${newVenue.name}" and Manager "${newVenue.managerName}" created successfully!`);

      // Mock appending to UI
      const sportsList = venuePayload.sports.join(', ');
      const allRates = newVenue.courts.map(c => parseInt(c.pricePerHour, 10)).filter(Boolean);
      const minPrice = Math.min(...allRates) || 0;
      const maxPrice = Math.max(...allRates) || 0;
      const priceRate = minPrice === maxPrice ? `₹${minPrice}/hr` : `₹${minPrice} - ₹${maxPrice}/hr`;

      const createdVenueForUI = {
        id: venueId,
        name: newVenue.name,
        description: newVenue.description,
        address: newVenue.address,
        city: newVenue.city,
        pincode: newVenue.pincode,
        state: newVenue.state,
        country: newVenue.country,
        latitude: newVenue.latitude,
        longitude: newVenue.longitude,
        googleMapsLink: newVenue.googleMapsLink,
        contactEmail: newVenue.managerEmail,
        contactPhone: newVenue.managerPhone,
        openTime: newVenue.openTime,
        closeTime: newVenue.closeTime,
        managerUserIds: managerUserId ? [managerUserId] : [],
        location: `${newVenue.city}, ${newVenue.state}`,
        sports: sportsList || 'Multi-sport',
        amenities: newVenue.amenities ? newVenue.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
        priceRate: priceRate,
        managerEmail: newVenue.managerEmail,
        managerName: newVenue.managerName,
        managerPhone: newVenue.managerPhone,
        imageUrl: newVenue.imageUrl || VENUE_IMAGE_PRESETS[0].url,
        isOnline: true,
        totalBookings: 0,
        totalRevenue: 0,
        turfs: newVenue.courts.flatMap(court => 
          Array.from({ length: parseInt(court.count) || 1 }, (_, i) => ({
            name: parseInt(court.count) > 1 ? `${court.namePrefix} ${i + 1}` : court.namePrefix,
            sport: court.sport,
            surfaceType: court.surfaceType,
            capacity: court.capacity,
            lengthFt: court.lengthFt,
            widthFt: court.widthFt,
            isIndoor: court.isIndoor,
            pricePerHour: court.pricePerHour
          }))
        )
      };

      setVenues([createdVenueForUI, ...venues]);
      
      // Reset form
      setNewVenue({
        name: '',
        description: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        country: 'India',
        latitude: '',
        longitude: '',
        googleMapsLink: '',
        amenities: '',
        openTime: '06:00',
        closeTime: '23:00',
        managerName: '',
        managerEmail: '',
        managerPhone: '',
        managerPassword: '',
        imageUrl: VENUE_IMAGE_PRESETS[0].url,
        imageFileName: '',
        imageFiles: [],
        courts: [
          { 
            id: 1, 
            namePrefix: 'Main Turf', 
            sport: 'Football', 
            surfaceType: 'Artificial Grass',
            capacity: 14,
            lengthFt: 100,
            widthFt: 60,
            isIndoor: false,
            pricePerHour: '1000',
            count: 1
          }
        ]
      });
      setOnboardingStep(1);
      setResolvedManagerId(null);
      setManagerExists(false);
      setAdminTab('venues');

    } catch (err) {
      toast.error(err.message || 'Failed to create venue in backend.');
      console.error(err);
    }
  };

  // -----------------------------------------------------
  // MANAGER EDIT VENUE HANDLERS
  // -----------------------------------------------------
  const handleOpenEditModal = (venue) => {
    setEditingVenue({
      ...venue,
      contactEmail: venue.contactEmail || venue.managerEmail || '',
      contactPhone: venue.contactPhone || venue.managerPhone || '',
      amenities: Array.isArray(venue.amenities) ? venue.amenities.join(', ') : (venue.amenities || '')
    });
    setIsEditVenueModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditVenueModalOpen(false);
    setEditingVenue(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditVenueLoading(true);
    try {
      const payload = {
        name: editingVenue.name,
        description: editingVenue.description,
        address: editingVenue.address,
        city: editingVenue.city,
        pincode: editingVenue.pincode,
        state: editingVenue.state,
        country: editingVenue.country,
        latitude: parseFloat(editingVenue.latitude) || 0,
        longitude: parseFloat(editingVenue.longitude) || 0,
        googleMapsLink: editingVenue.googleMapsLink,
        contactEmail: editingVenue.contactEmail,
        contactPhone: editingVenue.contactPhone,
        openTime: editingVenue.openTime,
        closeTime: editingVenue.closeTime,
        amenities: typeof editingVenue.amenities === 'string' ? editingVenue.amenities.split(',').map(s => s.trim()).filter(Boolean) : editingVenue.amenities

      };
      
      await venueApi.updateVenue(editingVenue.id, payload);
      toast.success('Venue updated successfully!');
      
      // Update local state
      setVenues(venues.map(v => v.id === editingVenue.id ? { ...v, ...payload } : v));
      handleCloseEditModal();
    } catch (err) {
      toast.error('Failed to update venue.');
      console.error(err);
    } finally {
      setEditVenueLoading(false);
    }
  };

  const handleOpenEditTurfModal = (venueId, turf) => {
    setEditingVenueIdForTurf(venueId);
    setEditingTurf({ ...turf });
    setIsEditTurfModalOpen(true);
  };

  const handleCloseEditTurfModal = () => {
    setIsEditTurfModalOpen(false);
    setEditingTurf(null);
    setEditingVenueIdForTurf(null);
  };

  const handleEditTurfSubmit = async (e) => {
    e.preventDefault();
    setEditTurfLoading(true);
    try {
      const payload = {
        name: editingTurf.name,
        sport: editingTurf.sport,
        surfaceType: editingTurf.surfaceType,
        capacity: parseInt(editingTurf.capacity, 10),
        lengthFt: parseFloat(editingTurf.lengthFt),
        widthFt: parseFloat(editingTurf.widthFt),
        isIndoor: editingTurf.isIndoor === 'true' || editingTurf.isIndoor === true,
        pricePerHour: parseFloat(editingTurf.pricePerHour)
      };
      
      await venueApi.updateTurf(editingVenueIdForTurf, editingTurf.id, payload);
      toast.success('Turf updated successfully!');
      
      // Update local state
      setVenues(venues.map(v => {
        if (v.id === editingVenueIdForTurf) {
          return {
            ...v,
            turfs: (v.turfs || []).map(c => c.id === editingTurf.id ? { ...c, ...payload } : c)
          };
        }
        return v;
      }));
      handleCloseEditTurfModal();
    } catch (err) {
      toast.error('Failed to update turf.');
      console.error(err);
    } finally {
      setEditTurfLoading(false);
    }
  };

  const handleVenueImageUpload = async (venueId, files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    try {
      toast.info(`Uploading ${fileArray.length} image(s)...`);
      await Promise.all(fileArray.map(file => venueApi.uploadVenueImage(venueId, file)));
      toast.success('Images uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload some images.');
      console.error(err);
    }
  };

  const handleSetPrimaryImage = async (venueId, imageId) => {
    try {
      toast.info('Setting primary image...');
      await venueApi.setPrimaryVenueImage(venueId, imageId);
      toast.success('Primary image updated!');
      // Update local state for venues
      setVenues(venues.map(v => {
        if (v.id === venueId) {
          const updatedImages = (v.images || []).map(img => ({
            ...img,
            primary: img.id === imageId
          }));
          const newPrimary = updatedImages.find(img => img.primary)?.imageUrl || v.imageUrl;
          return { ...v, images: updatedImages, imageUrl: newPrimary, primaryImageUrl: newPrimary };
        }
        return v;
      }));
      // Update selected admin venue if it's currently selected
      if (selectedAdminVenue && selectedAdminVenue.id === venueId) {
        setSelectedAdminVenue(prev => {
          const updatedImages = (prev.images || []).map(img => ({
            ...img,
            primary: img.id === imageId
          }));
          const newPrimary = updatedImages.find(img => img.primary)?.imageUrl || prev.imageUrl;
          return { ...prev, images: updatedImages, imageUrl: newPrimary, primaryImageUrl: newPrimary };
        });
      }
    } catch (err) {
      toast.error('Failed to set primary image.');
      console.error(err);
    }
  };

  // Filtered Venues List for Admin Directory Tab
  const filteredAdminVenues = venues.filter((v) => {
    const matchesName = v.name.toLowerCase().includes(searchVenueName.toLowerCase());
    const matchesCity =
      searchCity === 'ALL' || v.location.toLowerCase().includes(searchCity.toLowerCase());
    const matchesStatus =
      searchStatus === 'ALL' ||
      (searchStatus === 'ONLINE' && v.isOnline) ||
      (searchStatus === 'OFFLINE' && !v.isOnline);
    const matchesSport =
      searchSport === 'ALL' || v.sports.toLowerCase().includes(searchSport.toLowerCase());
    return matchesName && matchesCity && matchesStatus && matchesSport;
  });

  // Filtered Date-wise Booking Analytics
  const filteredDateAnalytics = dateAnalytics.filter((b) => {
    const matchesVenue = analyticsVenueFilter === 'ALL' || b.venueName === analyticsVenueFilter;
    const matchesDate = !analyticsDateFilter || b.date === analyticsDateFilter;
    return matchesVenue && matchesDate;
  });

  // Total bookings on filtered analytics
  const totalAnalyticsBookings = filteredDateAnalytics.reduce((acc, b) => acc + b.totalBookingsCount, 0);
  const totalAnalyticsRevenue = filteredDateAnalytics.reduce((acc, b) => acc + b.dateRevenue, 0);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchVenueName('');
    setSearchCity('ALL');
    setSearchStatus('ALL');
    setSearchSport('ALL');
  };

  // If loading, show a loading spinner
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-teal" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect unauthorized users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user?.role || 'PLAYER').toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';

  const onlineVenuesCount = venues.filter((v) => v.isOnline).length;

  return (
    <div className="container py-4">
      {/* Welcome Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="p-4 rounded-3 border-0 bg-white shadow-sm ss-card d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 className="h3 mb-1 fw-bold text-dark">
                Welcome back, {user.firstName || user.name || 'User'}!
              </h1>
              <p className="text-muted-custom small mb-0">
                {isAdmin
                  ? 'Administrator Portal: Manage spacious multi-turf venues with dynamic day pricing, view owner profiles, toggle status, and inspect date analytics.'
                  : isManager
                    ? 'Venue Manager Portal: Manage courts, slot availabilities, and court bookings.'
                    : 'Player Dashboard: Search sports facilities and manage your workspace.'}
              </p>
            </div>
            <span
              className="badge px-3 py-2 text-teal fw-semibold uppercase"
              style={{
                color: 'var(--ss-primary)',
                backgroundColor: 'rgba(15, 118, 110, 0.1)',
                borderRadius: '999px'
              }}
            >
              Role: {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* ADMIN DASHBOARD LAYOUT */}
      {isAdmin ? (
        <div className="row g-4">
          {/* Top Profile Summary Card */}
          <div className="col-12">
            <div className="ss-card bg-white p-4 border-0 shadow-sm d-flex align-items-center gap-4">
              <div className="position-relative flex-shrink-0">
                <img
                  src={userAvatar}
                  alt="Profile Avatar"
                  className="rounded-circle object-fit-cover shadow-sm border border-3"
                  style={{ width: '84px', height: '84px', borderColor: 'var(--ss-primary)' }}
                />
                <label
                  htmlFor="profile-avatar-admin"
                  className="position-absolute bottom-0 end-0 bg-teal text-white rounded-circle p-1 shadow cursor-pointer"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--ss-primary)',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Upload Profile Picture"
                >
                  <BiCamera size={14} />
                </label>
                <input
                  id="profile-avatar-admin"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleProfileImageUpload}
                />
              </div>
              <div className="flex-grow-1">
                <h5 className="fw-bold mb-1 text-dark">
                  {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name || 'User'}
                </h5>
                <p className="text-muted-custom small mb-2">{user.email}</p>
                <div className="d-flex align-items-center gap-2 flex-wrap small">
                  <span className="badge bg-secondary-subtle text-dark fw-semibold">
                    Role: {userRole}
                  </span>
                  <span className="badge bg-success-subtle text-success fw-semibold border border-success-subtle">
                    <BiBadgeCheck className="me-1" />
                    Admin Access Granted
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN ADMIN CONTROL PORTAL */}
          <div className="col-12 mt-2">
            <div className="ss-card bg-white p-4 border-0 shadow-sm">
              {/* Tab Header Navigation */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4 border-bottom pb-3">
                <div className="d-flex align-items-center">
                  <div
                    className="p-2 rounded-3 me-3"
                    style={{ backgroundColor: 'rgba(15, 118, 110, 0.1)', color: 'var(--ss-primary)' }}
                  >
                    <BiBuilding size={26} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-dark">Admin Control Portal</h4>
                    <p className="text-muted-custom small mb-0">
                      Manage venue cards with dynamic day pricing, inspect owner profiles, toggle availability, and track total bookings by date.
                    </p>
                  </div>
                </div>

                {/* Navigation Pills */}
                <div className="nav nav-pills gap-2 bg-light p-1 rounded-3 border">
                  <button
                    className={`nav-link small py-2 px-3 fw-semibold ${adminTab === 'venues' ? 'active bg-teal text-white' : 'text-dark'}`}
                    style={adminTab === 'venues' ? { backgroundColor: 'var(--ss-primary)' } : {}}
                    onClick={() => setAdminTab('venues')}
                  >
                    <BiBuilding className="me-1" size={16} />
                    Venues Directory ({venues.length})
                  </button>

                  <button
                    className={`nav-link small py-2 px-3 fw-semibold ${adminTab === 'add-venue' ? 'active bg-teal text-white' : 'text-dark'}`}
                    style={adminTab === 'add-venue' ? { backgroundColor: 'var(--ss-primary)' } : {}}
                    onClick={() => setAdminTab('add-venue')}
                  >
                    <BiPlusCircle className="me-1" size={16} />
                    Add Multi-Court Venue
                  </button>

                  <button
                    className={`nav-link small py-2 px-3 fw-semibold ${adminTab === 'bookings' ? 'active bg-teal text-white' : 'text-dark'}`}
                    style={adminTab === 'bookings' ? { backgroundColor: 'var(--ss-primary)' } : {}}
                    onClick={() => setAdminTab('bookings')}
                  >
                    <BiCalendarCheck className="me-1" size={16} />
                    Booking Analytics (By Date)
                  </button>
                </div>
              </div>

              {/* TAB 1: VENUES CARDS DIRECTORY & DYNAMIC DAY PRICING */}
              {adminTab === 'venues' && (
                <div>
                  {/* Multi-Criteria Search & Filter Controls */}
                  <div className="bg-light p-3 rounded-3 mb-4 border">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <BiFilterAlt className="text-teal" size={18} style={{ color: 'var(--ss-primary)' }} />
                      <span className="fw-bold small text-dark">Search & Filter Venues</span>
                    </div>

                    <div className="row g-2 align-items-center">
                      <div className="col-lg-4 col-md-6">
                        <div className="input-group ss-input-group">
                          <span className="input-group-text bg-white border-end-0 text-muted">
                            <BiSearch size={18} />
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search by venue name..."
                            value={searchVenueName}
                            onChange={(e) => setSearchVenueName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="col-lg-3 col-md-6">
                        <select
                          className="form-select ss-select"
                          value={searchCity}
                          onChange={(e) => setSearchCity(e.target.value)}
                        >
                          <option value="ALL">All Cities / Locations</option>
                          {popularCities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-lg-3 col-md-6">
                        <select
                          className="form-select ss-select"
                          value={searchStatus}
                          onChange={(e) => setSearchStatus(e.target.value)}
                        >
                          <option value="ALL">All Statuses (Online & Offline)</option>
                          <option value="ONLINE">Online Only</option>
                          <option value="OFFLINE">Offline Only</option>
                        </select>
                      </div>

                      <div className="col-lg-2 col-md-6">
                        <button
                          type="button"
                          className="btn btn-ss-outline w-100 py-2 small d-inline-flex align-items-center justify-content-center gap-1"
                          onClick={handleResetFilters}
                        >
                          <BiReset size={16} />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Top Summary Header Banner Above Cards */}
                  <div className="bg-white p-3 rounded-3 mb-4 border d-flex align-items-center justify-content-between flex-wrap gap-2 shadow-sm">
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="fw-bold text-dark mb-0">Venues Directory</h5>
                      <span className="badge bg-teal-light text-teal px-3 py-1 fw-semibold" style={{ color: 'var(--ss-primary)', backgroundColor: 'rgba(15, 118, 110, 0.1)' }}>
                        {filteredAdminVenues.length} Venues Matching
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap small">
                      <div className="px-3 py-1 bg-light rounded-3 border fw-semibold">
                        Total Venues: <span className="text-dark">{venues.length}</span>
                      </div>
                      <div className="px-3 py-1 bg-success-subtle text-success rounded-3 border border-success-subtle fw-semibold">
                        Online: <span>{onlineVenuesCount}</span>
                      </div>
                      <div className="px-3 py-1 bg-danger-subtle text-danger rounded-3 border border-danger-subtle fw-semibold">
                        Offline: <span>{venues.length - onlineVenuesCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3 CARDS PER ROW GRID VIEW */}
                  <div className="row g-3">
                    {filteredAdminVenues.length === 0 ? (
                      <div className="col-12 text-center py-5 text-muted small bg-light rounded-3 border">
                        <BiBuilding size={40} className="text-muted mb-2" />
                        <div className="fw-bold fs-6 mb-1 text-dark">No Venues Found</div>
                        No venues match your selected filters.{' '}
                        <button className="btn btn-link p-0 small fw-semibold text-teal" onClick={handleResetFilters}>
                          Reset filters
                        </button>
                      </div>
                    ) : (
                      filteredAdminVenues.map((v) => (
                        <div className="col-lg-4 col-md-6" key={v.id}>
                          <div className="ss-card bg-white p-0 border shadow-sm rounded-3 overflow-hidden h-100 d-flex flex-column">
                            {/* Cover Image Header with Badges */}
                            <div className="position-relative" style={{ height: '150px' }}>
                              <img
                                src={v.imageUrl}
                                alt={v.name}
                                className="w-100 h-100 object-fit-cover"
                              />
                              <div className="position-absolute top-0 end-0 m-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleOnlineStatus(v.id)}
                                  className={`btn btn-sm d-inline-flex align-items-center gap-1 border-0 py-1 px-2 shadow-sm ${v.isOnline ? 'bg-success text-white' : 'bg-danger text-white'
                                    }`}
                                  style={{ borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}
                                  title="Click to toggle Online/Offline availability"
                                >
                                  {v.isOnline ? <BiToggleRight size={16} /> : <BiToggleLeft size={16} />}
                                  <span>{v.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                                  </button>
                                </div>
                              </div>

                            {/* Card Content Body */}
                            <div className="p-3 d-flex flex-column flex-grow-1">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <h6 className="fw-bold text-dark mb-0 text-truncate" title={v.name}>{v.name}</h6>
                                <span className="badge bg-light text-muted border" style={{ fontSize: '10px' }}>SS-VN-{v.id}</span>
                              </div>

                              <p className="text-muted small mb-2" style={{ fontSize: '12px' }}>
                                <BiMap className="me-1 text-teal" />
                                {v.location}
                              </p>

                              {/* CLICK TO VIEW DETAILS LINK */}
                              <div className="mb-3">
                                <div className="text-muted mb-2 d-flex align-items-center justify-content-between" style={{ fontSize: '11px', fontWeight: '600' }}>
                                  <span className="badge bg-light text-dark border fw-normal px-2 py-1" style={{ fontSize: '10px' }}>{v.sports || 'Multi-sport'}</span>
                                  <span className="badge bg-primary-subtle text-primary border" style={{ fontSize: '9px' }}>
                                    <BiTimeFive className="me-1" />
                                    {v.openTime || '06:00'} - {v.closeTime || '23:00'}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAdminVenue(v);
                                    setAdminTab('venue-details');
                                  }}
                                  className="btn btn-sm w-100 py-2 d-flex justify-content-center align-items-center gap-1"
                                  style={{ backgroundColor: 'var(--ss-primary)', color: '#fff', fontSize: '12px', borderRadius: '6px' }}
                                >
                                  View Turfs & Details
                                </button>
                              </div>

                              {/* CLICKABLE OWNER / MANAGER PROFILE CARD */}
                              <div className="p-2 bg-light rounded-3 mb-3 border mt-auto">
                                <div className="text-muted mb-1 uppercase" style={{ fontSize: '10px', fontWeight: '600' }}>
                                  Assigned Manager / Owner:
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-white border w-100 d-flex align-items-center justify-content-between p-1 px-2 shadow-sm text-start bg-white"
                                  style={{ borderRadius: '6px' }}
                                  onClick={() =>
                                    setSelectedManagerModal({
                                      managerName: v.managerName,
                                      managerEmail: v.managerEmail,
                                      managerPhone: v.managerPhone || '+91 98765 43210',
                                      venueName: v.name,
                                      venueLocation: v.location,
                                      role: 'VENUE_MANAGER',
                                      status: 'Verified Active Access',
                                      grantedDate: '2026-01-15'
                                    })
                                  }
                                >
                                  <div className="d-flex align-items-center gap-2 text-truncate me-1">
                                    <div
                                      className="p-1 rounded-circle bg-teal-light text-teal d-inline-flex flex-shrink-0"
                                      style={{ color: 'var(--ss-primary)', backgroundColor: 'rgba(15, 118, 110, 0.1)' }}
                                    >
                                      <BiUserCheck size={14} />
                                    </div>
                                    <div className="text-truncate">
                                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '11px' }}>{v.managerName}</div>
                                      <div className="text-muted text-truncate" style={{ fontSize: '10px' }}>{v.managerEmail}</div>
                                    </div>
                                  </div>
                                  <span
                                    className="badge px-1 py-1 text-teal flex-shrink-0"
                                    style={{ backgroundColor: 'rgba(15, 118, 110, 0.1)', color: 'var(--ss-primary)', fontSize: '9px' }}
                                  >
                                    Profile →
                                  </span>
                                </button>
                              </div>

                              {/* Action Buttons Footer */}
                              <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                                <button
                                  className="btn btn-sm btn-ss-outline px-2 py-1"
                                  style={{ fontSize: '11px' }}
                                  onClick={() => toast.info(`Manager credentials re-sent to ${v.managerEmail}`)}
                                >
                                  Re-send Access
                                </button>

                                <button
                                  className="btn btn-sm btn-outline-danger px-2 py-1"
                                  style={{ fontSize: '11px' }}
                                  onClick={() => handleDeleteVenue(v.id, v.name)}
                                >
                                  <BiTrash size={14} className="me-1" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ADMIN VENUE DETAILS TAB */}
              {adminTab === 'venue-details' && selectedAdminVenue && (
                <div className="bg-white p-4 rounded-3 border shadow-sm">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <button 
                        onClick={() => {
                          setAdminTab('venues');
                          setSelectedAdminVenue(null);
                        }} 
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                      >
                        &larr; Back to Directory
                      </button>
                      <h4 className="fw-bold mb-0 text-dark">{selectedAdminVenue.name} - Turfs & Pricing</h4>
                    </div>
                    <span className="badge bg-light text-dark border fw-normal">{selectedAdminVenue.sports || 'Multi-sport'}</span>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-4 mb-md-0">
                      {selectedAdminVenue.images && selectedAdminVenue.images.length > 0 ? (
                        <div className="d-flex overflow-auto gap-2 mb-3 pb-2 custom-scrollbar">
                          {selectedAdminVenue.images.map((img) => (
                            <div key={img.id} className="position-relative flex-shrink-0" style={{ width: '150px' }}>
                              <img 
                                src={img.imageUrl} 
                                alt="Venue" 
                                className="w-100 rounded-3 object-fit-cover shadow-sm border"
                                style={{ height: '100px' }}
                              />
                              {img.primary ? (
                                <span className="badge bg-success position-absolute top-0 start-0 m-1" style={{ fontSize: '10px' }}>Primary</span>
                              ) : (
                                <button 
                                  className="btn btn-sm btn-light position-absolute bottom-0 end-0 m-1 py-0 px-1 opacity-75 fw-bold hover-opacity-100"
                                  style={{ fontSize: '10px' }}
                                  onClick={() => handleSetPrimaryImage(selectedAdminVenue.id, img.id)}
                                >
                                  Set Primary
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <img 
                          src={selectedAdminVenue.imageUrl} 
                          alt={selectedAdminVenue.name} 
                          className="w-100 rounded-3 object-fit-cover shadow-sm mb-3"
                          style={{ height: '200px' }}
                        />
                      )}
                      <label className="btn btn-sm btn-ss-outline w-100 mb-4 cursor-pointer d-flex justify-content-center align-items-center gap-1">
                        <BiUpload /> Upload New Image
                        <input type="file" multiple accept="image/*" className="d-none" onChange={(e) => handleVenueImageUpload(selectedAdminVenue.id, e.target.files)} />
                      </label>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h6 className="fw-bold text-dark mb-0">Venue Information</h6>
                        <button 
                          className="btn btn-sm btn-link p-0 text-teal d-flex align-items-center gap-1"
                          onClick={() => handleOpenEditModal(selectedAdminVenue)}
                        >
                          <BiPencil /> Edit
                        </button>
                      </div>
                      <p className="text-muted small mb-2"><BiMap className="me-1" />{selectedAdminVenue.location}</p>
                      <p className="text-muted small mb-2"><BiTimeFive className="me-1" />{selectedAdminVenue.openTime || '06:00'} - {selectedAdminVenue.closeTime || '23:00'}</p>
                      <p className="text-muted small"><BiPhone className="me-1" />{selectedAdminVenue.contactPhone || 'N/A'}</p>
                    </div>

                    <div className="col-md-8">
                      <h6 className="fw-bold text-dark mb-3">Courts / Turfs Breakdown</h6>
                      <div className="d-flex flex-column gap-2">
                        {selectedAdminVenue.turfs && selectedAdminVenue.turfs.length > 0 ? (
                          selectedAdminVenue.turfs.map((turf, idx) => (
                            <div key={idx} className="p-3 bg-light rounded-3 border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                              <div>
                                <div className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                                  <span>{turf.name}</span>
                                  <span className="badge bg-white text-muted border font-monospace" style={{ fontSize: '10px' }}>{turf.sport}</span>
                                  <button type="button" onClick={() => handleOpenEditTurfModal(selectedAdminVenue.id, turf)} className="btn btn-sm btn-link p-0 text-teal ms-2">
                                    <BiPencil size={14} />
                                  </button>
                                </div>
                                <div className="text-muted" style={{ fontSize: '12px' }}>
                                  {turf.surfaceType || 'Unknown Surface'} • {turf.lengthFt || 0}x{turf.widthFt || 0}ft • Cap: {turf.capacity || 0} {turf.isIndoor ? '(Indoor)' : ''}
                                </div>
                              </div>
                              <div className="text-sm-end border-top border-sm-0 pt-2 pt-sm-0 mt-2 mt-sm-0">
                                <div className="text-muted mb-1" style={{ fontSize: '11px' }}>Price / Hour</div>
                                <h5 className="mb-0 fw-bold" style={{ color: 'var(--ss-primary)' }}>
                                  ₹{turf.pricePerHour || turf.pricing?.[0]?.pricePerHour || 0}
                                </h5>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-light rounded-3 border text-center text-muted">
                            No turfs have been configured for this venue yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADD NEW VENUE WITH MULTIPLE COURTS & DYNAMIC DAY-WISE PRICING */}
              {adminTab === 'add-venue' && (
                <div className="bg-light p-4 rounded-3 border">
                  <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                    <BiKey style={{ color: 'var(--ss-primary)' }} />
                    <span>Onboard Multi-Court Venue (Step {onboardingStep} of 2)</span>
                  </h5>

                  {onboardingStep === 1 && (
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3 text-dark border-bottom pb-2">Step 1: Venue Manager Validation</h6>
                      <p className="text-muted small mb-3">
                        Enter the manager's email. If they exist, we will link them. If not, you can register them.
                      </p>
                      <div className="row g-2 align-items-end mb-4">
                        <div className="col-md-6">
                          <Input
                            label="Manager Email Address"
                            name="managerEmail"
                            type="email"
                            placeholder="manager@sportsphere.com"
                            value={newVenue.managerEmail}
                            onChange={(e) => {
                              setNewVenue({ ...newVenue, managerEmail: e.target.value });
                              setManagerExists(false);
                              setResolvedManagerId(null);
                            }}
                          />
                        </div>
                        <div className="col-md-4">
                          <button type="button" className="btn btn-ss-primary py-2 px-3 w-100 mb-3" onClick={handleManagerLookup}>
                            Lookup Manager
                          </button>
                        </div>
                      </div>

                      {!resolvedManagerId && (
                        <div className="p-3 border rounded-3 bg-white mt-3">
                          <h6 className="fw-bold mb-3 text-dark">Register New Manager</h6>
                          <div className="row">
                            <div className="col-md-4">
                              <Input
                                label="Full Name"
                                type="text"
                                value={newVenue.managerName}
                                onChange={(e) => setNewVenue({ ...newVenue, managerName: e.target.value })}
                              />
                            </div>
                            <div className="col-md-4">
                              <Input
                                label="Phone Number"
                                type="tel"
                                value={newVenue.managerPhone}
                                onChange={(e) => setNewVenue({ ...newVenue, managerPhone: e.target.value })}
                              />
                            </div>
                            <div className="col-md-4">
                              <Input
                                label="Password"
                                type="password"
                                value={newVenue.managerPassword}
                                onChange={(e) => setNewVenue({ ...newVenue, managerPassword: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="mt-3 text-end">
                            <button type="button" className="btn btn-ss-secondary py-1 px-3" onClick={handleManagerRegister}>
                              Register Manager
                            </button>
                          </div>
                        </div>
                      )}

                      {resolvedManagerId && (
                        <div className="alert alert-success d-flex align-items-center justify-content-between mt-3 mb-0">
                          <div>
                            <BiCheckCircle className="me-2 fs-5" />
                            <strong>Manager Verified:</strong> {newVenue.managerName} ({newVenue.managerEmail})
                          </div>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-end gap-2 mt-4 border-top pt-3">
                        <button type="button" className="btn btn-ss-secondary py-2 px-3 small" onClick={() => setAdminTab('venues')}>Cancel</button>
                        <Button type="button" className="py-2 px-4" onClick={() => {
                          if (resolvedManagerId) setOnboardingStep(2);
                          else toast.error('Please lookup or register a manager first.');
                        }}>
                          Proceed to Step 2 →
                        </Button>
                      </div>
                    </div>
                  )}

                  {onboardingStep === 2 && (
                    <form onSubmit={handleAddVenueSubmit}>
                      <div className="row">
                      <div className="col-md-6">
                        <Input
                          label="Venue Name"
                          name="venueName"
                          type="text"
                          placeholder="e.g. Apex Multi-Sport Turf Complex"
                          required
                          value={newVenue.name}
                          onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          label="Description"
                          name="description"
                          type="text"
                          placeholder="e.g. Premium facility"
                          required
                          value={newVenue.description}
                          onChange={(e) => setNewVenue({ ...newVenue, description: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          label="Address"
                          name="address"
                          type="text"
                          placeholder="e.g. 123 Main St"
                          required
                          value={newVenue.address}
                          onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <Input
                          label="City"
                          name="city"
                          type="text"
                          placeholder="e.g. Pune"
                          required
                          value={newVenue.city}
                          onChange={(e) => setNewVenue({ ...newVenue, city: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <Input
                          label="Pincode"
                          name="pincode"
                          type="text"
                          placeholder="e.g. 411001"
                          required
                          value={newVenue.pincode}
                          onChange={(e) => setNewVenue({ ...newVenue, pincode: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <Input
                          label="State"
                          name="state"
                          type="text"
                          placeholder="e.g. Maharashtra"
                          required
                          value={newVenue.state}
                          onChange={(e) => setNewVenue({ ...newVenue, state: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <Input
                          label="Country"
                          name="country"
                          type="text"
                          placeholder="e.g. India"
                          required
                          value={newVenue.country}
                          onChange={(e) => setNewVenue({ ...newVenue, country: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <Input
                          label="Latitude"
                          name="latitude"
                          type="number"
                          step="0.0001"
                          placeholder="e.g. 18.5204"
                          value={newVenue.latitude}
                          onChange={(e) => setNewVenue({ ...newVenue, latitude: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <Input
                          label="Longitude"
                          name="longitude"
                          type="number"
                          step="0.0001"
                          placeholder="e.g. 73.8567"
                          value={newVenue.longitude}
                          onChange={(e) => setNewVenue({ ...newVenue, longitude: e.target.value })}
                        />
                      </div>
                      <div className="col-md-12">
                        <Input
                          label="Google Maps Link"
                          name="googleMapsLink"
                          type="url"
                          placeholder="https://maps.google.com/..."
                          value={newVenue.googleMapsLink}
                          onChange={(e) => setNewVenue({ ...newVenue, googleMapsLink: e.target.value })}
                        />
                      </div>
                      <div className="col-md-12">
                        <Input
                          label="Amenities (Comma separated)"
                          name="amenities"
                          type="text"
                          placeholder="e.g. Washroom, Drinking Water, Parking"
                          value={newVenue.amenities}
                          onChange={(e) => setNewVenue({ ...newVenue, amenities: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          label="Venue Public Contact Email"
                          name="contactEmail"
                          type="email"
                          required
                          value={newVenue.contactEmail}
                          onChange={(e) => setNewVenue({ ...newVenue, contactEmail: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <Input
                          label="Venue Public Contact Phone"
                          name="contactPhone"
                          type="tel"
                          required
                          value={newVenue.contactPhone}
                          onChange={(e) => setNewVenue({ ...newVenue, contactPhone: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <Input
                          label="Open Time"
                          name="openTime"
                          type="time"
                          required
                          value={newVenue.openTime}
                          onChange={(e) => setNewVenue({ ...newVenue, openTime: e.target.value })}
                        />
                      </div>
                      <div className="col-md-3">
                        <Input
                          label="Close Time"
                          name="closeTime"
                          type="time"
                          required
                          value={newVenue.closeTime}
                          onChange={(e) => setNewVenue({ ...newVenue, closeTime: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* DYNAMIC DAY-WISE PRICING MULTI-COURT CONFIGURATION */}
                    <div className="bg-white p-3 rounded-3 border mb-4">
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <div>
                          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                            <BiGridAlt className="text-teal" />
                            <span>Courts Configuration & Dynamic Day Pricing (Weekday vs Weekend)</span>
                          </h6>
                          <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>
                            Set custom hourly rates per court according to weekdays (Mon-Thu) vs weekends/peak days (Fri-Sun).
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-ss-primary d-inline-flex align-items-center gap-1"
                          onClick={handleAddCourt}
                        >
                          <BiPlusCircle size={16} />
                          <span>+ Add Another Court/Turf</span>
                        </button>
                      </div>

                      {/* List of Courts with Day-wise Rates */}
                      {newVenue.courts.map((court, index) => (
                        <div key={court.id || index} className="row g-2 align-items-center mb-3 bg-light p-3 rounded-3 border">
                          <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted small mb-1">
                              Court Name / Prefix
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="e.g. Badminton Court"
                              required
                              value={court.namePrefix}
                              onChange={(e) => handleCourtChange(index, 'namePrefix', e.target.value)}
                            />
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="e.g. 10"
                              min="1"
                              required
                              value={court.count}
                              onChange={(e) => handleCourtChange(index, 'count', e.target.value)}
                            />
                          </div>

                          <div className="col-md-3">
                            <label className="form-label fw-semibold text-muted small mb-1">
                              Game / Sport
                            </label>
                            <select
                              className="form-select form-select-sm ss-select"
                              value={court.sport}
                              onChange={(e) => handleCourtChange(index, 'sport', e.target.value)}
                            >
                              {SPORT_OPTIONS.map((sport) => (
                                <option key={sport} value={sport}>{sport}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small mb-1">
                              Surface Type
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="e.g. Grass"
                              required
                              value={court.surfaceType}
                              onChange={(e) => handleCourtChange(index, 'surfaceType', e.target.value)}
                            />
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small mb-1">
                              Capacity
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="e.g. 22"
                              required
                              value={court.capacity}
                              onChange={(e) => handleCourtChange(index, 'capacity', e.target.value)}
                            />
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small mb-1">
                              Length (Ft)
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="e.g. 100"
                              value={court.lengthFt}
                              onChange={(e) => handleCourtChange(index, 'lengthFt', e.target.value)}
                            />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small mb-1">
                              Width (Ft)
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="e.g. 60"
                              value={court.widthFt}
                              onChange={(e) => handleCourtChange(index, 'widthFt', e.target.value)}
                            />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small mb-1">
                              Indoor
                            </label>
                            <select
                              className="form-select form-select-sm ss-select"
                              value={court.isIndoor}
                              onChange={(e) => handleCourtChange(index, 'isIndoor', e.target.value === 'true')}
                            >
                              <option value="false">No</option>
                              <option value="true">Yes</option>
                            </select>
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-semibold text-muted small mb-1">
                              Price / Hour (₹)
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="e.g. 1000"
                              required
                              value={court.pricePerHour}
                              onChange={(e) => handleCourtChange(index, 'pricePerHour', e.target.value)}
                            />
                          </div>

                          <div className="col-md-1 text-end mt-3">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger p-2"
                              title="Remove court"
                              onClick={() => handleRemoveCourt(index)}
                            >
                              <BiTrash size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Venue Photo Direct File Upload Option */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold text-muted-custom small mb-1">
                        Venue Photo / Image File <span className="text-danger">*</span>
                      </label>

                      <div className="row g-3 align-items-center">
                        <div className="col-md-8">
                          {/* File Upload Box */}
                          <div className="border border-2 border-dashed p-3 rounded-3 bg-white text-center">
                            <BiUpload size={32} className="text-teal mb-2" style={{ color: 'var(--ss-primary)' }} />
                            <div className="small fw-semibold text-dark mb-1">
                              Choose a Venue Photo File to Upload
                            </div>
                            <p className="text-muted small mb-2" style={{ fontSize: '11px' }}>
                              Supports JPG, PNG, WEBP (Max 8MB)
                            </p>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="form-control form-control-sm mx-auto"
                              style={{ maxWidth: '300px' }}
                              onChange={handleVenueImageFileUpload}
                            />
                            {newVenue.imageFileName && (
                              <div className="mt-2 text-success small fw-semibold d-flex align-items-center justify-content-center gap-1">
                                <BiCheckCircle />
                                <span>Uploaded: {newVenue.imageFileName}</span>
                              </div>
                            )}
                          </div>

                          {/* Template Presets option */}
                          <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                            <span className="small text-muted">Or Pick Template:</span>
                            {VENUE_IMAGE_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                className={`btn btn-sm ${newVenue.imageUrl === preset.url ? 'btn-ss-primary' : 'btn-outline-secondary'
                                  } py-1 px-2`}
                                style={{ fontSize: '11px', borderRadius: '6px' }}
                                onClick={() =>
                                  setNewVenue({
                                    ...newVenue,
                                    imageUrl: preset.url,
                                    imageFileName: preset.name
                                  })
                                }
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Image Thumbnail Preview */}
                        <div className="col-md-4 text-center">
                          <div className="p-2 border rounded-3 bg-white d-inline-block shadow-sm">
                            <img
                              src={newVenue.imageUrl || VENUE_IMAGE_PRESETS[0].url}
                              alt="Venue Preview"
                              className="rounded-2 object-fit-cover"
                              style={{ width: '140px', height: '95px' }}
                              onError={(e) => {
                                e.target.src = VENUE_IMAGE_PRESETS[0].url;
                              }}
                            />
                            <div className="small text-muted mt-1" style={{ fontSize: '11px', fontWeight: '600' }}>
                              Live Photo Preview
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-3 border-top pt-3">
                      <button
                        type="button"
                        className="btn btn-ss-secondary py-2 px-3 small"
                        onClick={() => setOnboardingStep(1)}
                      >
                        ← Back to Step 1
                      </button>
                      <Button type="submit" className="py-2 px-4">
                        Save Venue & Complete
                      </Button>
                    </div>
                  </form>
                  )}
                </div>
              )}

              {/* TAB 3: BOOKINGS & ANALYTICS BY VENUE AND TOTAL BOOKINGS BY DATE */}
              {adminTab === 'bookings' && (
                <div>
                  {/* Summary Stat Cards */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border">
                        <div className="small text-muted fw-semibold uppercase">Filtered Total Bookings</div>
                        <div className="fs-3 fw-bold text-dark mt-1 d-flex align-items-center">
                          <BiCalendarCheck className="me-2 text-teal" />
                          {totalAnalyticsBookings} Bookings
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border">
                        <div className="small text-muted fw-semibold uppercase">Total Revenue on Date</div>
                        <div className="fs-3 fw-bold text-success mt-1 d-flex align-items-center">
                          <BiRupee size={28} />
                          {totalAnalyticsRevenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 bg-light rounded-3 border">
                        <div className="small text-muted fw-semibold uppercase">Active Venues</div>
                        <div className="fs-3 fw-bold text-primary mt-1 d-flex align-items-center">
                          <BiBuilding className="me-2" />
                          {onlineVenuesCount} / {venues.length} Online
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filters Bar: Venue Filter & Date Filter */}
                  <div className="bg-light p-3 rounded-3 mb-4 border">
                    <div className="row g-3 align-items-center">
                      <div className="col-md-6">
                        <label htmlFor="analyticsVenueSelect" className="small fw-semibold text-muted mb-1 d-block">
                          Filter by Venue:
                        </label>
                        <select
                          id="analyticsVenueSelect"
                          className="form-select ss-select"
                          value={analyticsVenueFilter}
                          onChange={(e) => setAnalyticsVenueFilter(e.target.value)}
                        >
                          <option value="ALL">All Venues</option>
                          {venues.map((v) => (
                            <option key={v.id} value={v.name}>
                              {v.name} ({v.location})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label htmlFor="analyticsDateSelect" className="small fw-semibold text-muted mb-1 d-block">
                          Filter by Date:
                        </label>
                        <input
                          id="analyticsDateSelect"
                          type="date"
                          className="form-control ss-input"
                          value={analyticsDateFilter}
                          onChange={(e) => setAnalyticsDateFilter(e.target.value)}
                        />
                      </div>

                      <div className="col-md-2 mt-4 text-end">
                        <button
                          className="btn btn-outline-secondary w-100 py-2 small"
                          onClick={() => {
                            setAnalyticsVenueFilter('ALL');
                            setAnalyticsDateFilter('');
                          }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total Bookings Aggregated by Date Table */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <BiCalendar className="text-teal" />
                      <span>Total Bookings Aggregated by Date</span>
                    </h5>
                    <span className="badge bg-teal-light text-teal fw-semibold">
                      Showing {filteredDateAnalytics.length} Date Records
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 border">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="fw-semibold small">Date</th>
                          <th scope="col" className="fw-semibold small">Venue Name</th>
                          <th scope="col" className="fw-semibold small text-center">Total Bookings Count</th>
                          <th scope="col" className="fw-semibold small text-center">Confirmed Slots</th>
                          <th scope="col" className="fw-semibold small text-center">Cancelled</th>
                          <th scope="col" className="fw-semibold small text-end">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDateAnalytics.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4 text-muted small">
                              No bookings recorded for the selected venue or date filter.
                            </td>
                          </tr>
                        ) : (
                          filteredDateAnalytics.map((item) => (
                            <tr key={item.id}>
                              <td className="fw-bold text-dark small">
                                <BiCalendar className="me-1 text-teal" />
                                {item.date}
                              </td>
                              <td className="fw-semibold text-dark small">{item.venueName}</td>
                              <td className="text-center">
                                <span className="badge bg-primary-subtle text-primary border px-3 py-2 fw-bold" style={{ borderRadius: '999px' }}>
                                  {item.totalBookingsCount} Bookings
                                </span>
                              </td>
                              <td className="text-center small text-success fw-semibold">
                                {item.confirmedCount} Confirmed
                              </td>
                              <td className="text-center small text-muted">
                                {item.cancelledCount} Cancelled
                              </td>
                              <td className="text-end fw-bold text-success small">
                                ₹{item.dateRevenue.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* NON-ADMIN (PLAYER / MANAGER) DASHBOARD LAYOUT */
        <div className="row g-4">
          <div className="col-lg-4">
            {/* Profile Card */}
            <div className="ss-card bg-white p-4 border-0 shadow-sm text-center">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={userAvatar}
                  alt="Profile Avatar"
                  className="rounded-circle object-fit-cover shadow-sm border border-3"
                  style={{ width: '108px', height: '108px', borderColor: 'var(--ss-primary)' }}
                />
                <label
                  htmlFor="profile-avatar-player"
                  className="position-absolute bottom-0 end-0 bg-teal text-white rounded-circle p-2 shadow cursor-pointer"
                  style={{
                    cursor: 'pointer',
                    backgroundColor: 'var(--ss-primary)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Upload Profile Picture"
                >
                  <BiCamera size={18} />
                </label>
                <input
                  id="profile-avatar-player"
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleProfileImageUpload}
                />
              </div>

              <h5 className="fw-bold mb-1 text-dark">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name || 'User'}
              </h5>
              <p className="text-muted-custom small mb-3">{user.email}</p>

              <div className="text-start border-top pt-3">
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                  <li className="d-flex justify-content-between">
                    <span className="text-muted">Role:</span>
                    <span className="fw-semibold text-teal">{userRole}</span>
                  </li>
                  <li className="d-flex justify-content-between">
                    <span className="text-muted">Location:</span>
                    <span className="fw-semibold">{selectedLocation}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            {isManager ? (
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="fw-bold mb-0 text-dark">My Managed Venues</h4>
                  <span className="badge bg-teal-light text-teal px-3 py-1 fw-semibold" style={{ color: 'var(--ss-primary)', backgroundColor: 'rgba(15, 118, 110, 0.1)' }}>
                    {venues.length} Venues
                  </span>
                </div>
                {venuesLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-teal" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : venues.length === 0 ? (
                  <div className="text-center py-5 bg-white rounded-3 shadow-sm border-0">
                    <p className="text-muted mb-0">You don't have any venues assigned to you yet.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {venues.map(v => (
                      <div key={v.id} className="col-md-6">
                        <div className="ss-card bg-white p-3 border-0 shadow-sm rounded-3 h-100 d-flex flex-column">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <h6 className="fw-bold mb-0 text-dark">{v.name}</h6>
                            <span className="badge bg-success-subtle text-success border border-success-subtle">{v.isOnline ? 'Online' : 'Offline'}</span>
                          </div>
                          <div className="text-muted small mb-2 d-flex align-items-center gap-1">
                            <BiMap size={14} /> <span>{v.location}</span>
                          </div>
                          <p className="text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {v.description || 'No description provided.'}
                          </p>
                          <div className="text-muted mb-3 d-flex flex-wrap gap-1" style={{ fontSize: '11px', fontWeight: '600' }}>
                            <span className="badge bg-light text-dark border"><BiTimeFive className="me-1" />{v.openTime || '06:00'} - {v.closeTime || '23:00'}</span>
                            <span className="badge bg-light text-dark border"><BiPhone className="me-1" />{v.contactPhone || 'N/A'}</span>
                          </div>

                          <div className="mb-3">
                            {v.images && v.images.length > 0 ? (
                              <div className="d-flex overflow-auto gap-2 pb-2 custom-scrollbar">
                                {v.images.map((img) => (
                                  <div key={img.id} className="position-relative flex-shrink-0" style={{ width: '80px' }}>
                                    <img 
                                      src={img.imageUrl} 
                                      alt="Venue" 
                                      className="w-100 rounded object-fit-cover shadow-sm border"
                                      style={{ height: '60px' }}
                                    />
                                    {img.primary ? (
                                      <span className="badge bg-success position-absolute top-0 start-0 m-1" style={{ fontSize: '8px' }}>Primary</span>
                                    ) : (
                                      <button 
                                        className="btn btn-sm btn-light position-absolute bottom-0 end-0 m-1 p-0 opacity-75 fw-bold hover-opacity-100"
                                        style={{ fontSize: '8px', padding: '2px 4px' }}
                                        onClick={() => handleSetPrimaryImage(v.id, img.id)}
                                      >
                                        Set Primary
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <img src={v.imageUrl} alt={v.name} className="w-100 rounded object-fit-cover shadow-sm" style={{ height: '100px' }} />
                            )}
                          </div>

                          <div className="d-flex flex-column gap-1 mb-3">
                            {v.turfs ? v.turfs.map((turf, idx) => (
                              <div key={idx} className="p-2 bg-light rounded border d-flex flex-column gap-1" style={{ fontSize: '11px' }}>
                                <div className="fw-bold text-dark d-flex align-items-center justify-content-between">
                                  <span>{turf.name} <span className="badge bg-white text-muted border font-monospace ms-1" style={{ fontSize: '9px' }}>{turf.sport}</span></span>
                                  <button type="button" onClick={() => handleOpenEditTurfModal(v.id, turf)} className="btn btn-sm btn-link p-0 text-teal"><BiPencil /></button>
                                </div>
                                <div className="text-muted" style={{ fontSize: '10px' }}>
                                  {turf.surfaceType || 'Unknown'} • {turf.lengthFt || 0}x{turf.widthFt || 0}ft • Cap: {turf.capacity || 0}
                                </div>
                                <div className="d-flex align-items-center justify-content-between text-muted border-top pt-1 mt-1" style={{ fontSize: '10px' }}>
                                  <span>Price / Hour</span>
                                  <span><strong className="text-teal" style={{ color: 'var(--ss-primary)' }}>₹{turf.pricePerHour || 0}</strong>/hr</span>
                                </div>
                              </div>
                            )) : (
                              <span className="text-muted small">No turfs added.</span>
                            )}
                          </div>
                          
                          <div className="mt-auto d-flex gap-2">
                            <button 
                              className="btn btn-ss-outline flex-grow-1 py-2 small d-inline-flex align-items-center justify-content-center gap-1"
                              onClick={() => handleOpenEditModal(v)}
                            >
                              <BiPencil /> <span style={{fontSize: '11px'}}>Edit Info</span>
                            </button>
                            <label className="btn btn-ss-primary flex-grow-1 py-2 small d-inline-flex align-items-center justify-content-center gap-1 mb-0 cursor-pointer">
                              <BiUpload /> <span style={{fontSize: '11px'}}>Upload Image</span>
                              <input type="file" multiple accept="image/*" className="d-none" onChange={(e) => handleVenueImageUpload(v.id, e.target.files)} />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Location Search Bar Card */}
                <div className="ss-card bg-white p-4 border-0 shadow-sm mb-4">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div className="d-flex align-items-center">
                      <div
                        className="p-2 rounded-3 me-3"
                        style={{ backgroundColor: 'rgba(15, 118, 110, 0.08)', color: 'var(--ss-primary)' }}
                      >
                        <BiMap size={24} />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">Set Preferred Location</h5>
                        <p className="text-muted-custom small mb-0">
                          Active Location: <span className="fw-semibold text-dark">{selectedLocation}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-ss-outline btn-sm d-inline-flex align-items-center gap-1"
                      onClick={handleDetectLocation}
                      style={{ padding: '8px 14px !important' }}
                    >
                      <BiCrosshair size={16} />
                      <span>Auto-Detect GPS Location</span>
                    </button>
                  </div>

                  {/* Search Input Form */}
                  <form onSubmit={handleLocationSubmit} className="row g-2 align-items-center">
                    <div className="col-md-9 col-sm-8">
                      <div className="input-group ss-input-group">
                        <span className="input-group-text bg-white border-end-0 text-muted">
                          <BiSearch size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Enter city, neighborhood, or postal code (e.g. Pune, Mumbai)..."
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-4">
                      <button type="submit" className="btn btn-ss-primary w-100 py-2">
                        Set Location
                      </button>
                    </div>
                  </form>

                  {/* Quick Location Pills */}
                  <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
                    <span className="small text-muted me-1">Popular:</span>
                    {popularCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleQuickCityClick(city)}
                        className={`btn btn-sm ${selectedLocation === city ? 'btn-ss-primary' : 'btn-outline-secondary'
                          } py-1 px-3`}
                        style={{ borderRadius: '999px', fontSize: '12px' }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* My Bookings List Card for Players */}
                <div className="ss-card bg-white p-4 border-0 shadow-sm">
                  <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <BiCalendarCheck className="text-teal" style={{ color: 'var(--ss-primary)' }} />
                      <span>My Bookings History</span>
                    </h5>
                    <span className="badge bg-teal-light text-teal px-3 py-1 fw-semibold" style={{ color: 'var(--ss-primary)', backgroundColor: 'rgba(15, 118, 110, 0.1)' }}>
                      {myBookings.length} Bookings
                    </span>
                  </div>

                  {myBookingsLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-teal" role="status">
                        <span className="visually-hidden">Loading bookings...</span>
                      </div>
                    </div>
                  ) : myBookings.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted mb-0">You don't have any bookings yet.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {myBookings.map((booking) => {
                        const details = getGroundDetails(booking.groundId);
                        const isCancelled = booking.status === 'CANCELLED';
                        return (
                          <div 
                            key={booking.bookingId} 
                            className={`p-3 rounded-3 border d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 ${
                              isCancelled ? 'bg-light border-light opacity-75' : 'bg-white'
                            }`}
                            style={{
                              borderRadius: '12px',
                              borderColor: '#E2E8F0'
                            }}
                          >
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <span className="font-monospace fw-bold text-teal" style={{ fontSize: '12px', color: 'var(--ss-primary)' }}>
                                  {booking.bookingNumber}
                                </span>
                                <span 
                                  className={`badge ${
                                    isCancelled ? 'bg-danger text-white' : 'bg-success text-white'
                                  }`}
                                  style={{ fontSize: '10px' }}
                                >
                                  {booking.status}
                                </span>
                              </div>
                              <h6 className="fw-bold text-dark mb-1">{details.venueName} - {details.turfName}</h6>
                              <div className="text-muted-custom small d-flex flex-wrap gap-2" style={{ fontSize: '12px' }}>
                                <span>Date: <strong>{booking.bookingDate}</strong></span>
                                <span>•</span>
                                <span>Time: <strong>{formatTime12(booking.startTime)} - {formatTime12(booking.endTime)}</strong></span>
                                <span>•</span>
                                <span>Sport: <strong className="badge bg-light text-dark border font-monospace" style={{ fontSize: '10px' }}>{details.sport}</strong></span>
                              </div>
                              {booking.notes && (
                                <div className="mt-2 text-muted small bg-light p-2 rounded" style={{ fontSize: '11px' }}>
                                  <strong>Notes:</strong> "{booking.notes}"
                                </div>
                              )}
                            </div>

                            <div className="d-flex flex-row flex-md-column align-items-end justify-content-between w-100 w-md-auto border-top border-md-top-0 pt-2 pt-md-0 gap-2">
                              <span className="fw-bold text-teal fs-6" style={{ color: 'var(--ss-primary)' }}>
                                ₹{booking.totalAmount.toFixed(2)}
                              </span>
                              {!isCancelled && (
                                <button
                                  onClick={() => handleCancelBooking(booking.bookingId)}
                                  className="btn btn-sm btn-outline-danger py-1 px-3"
                                  style={{ borderRadius: '8px', fontSize: '12px' }}
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* VENUE MANAGER / OWNER FULL PROFILE MODAL */}
      {selectedManagerModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedManagerModal(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom bg-light">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="p-2 rounded-circle text-teal"
                    style={{ backgroundColor: 'rgba(15, 118, 110, 0.1)', color: 'var(--ss-primary)' }}
                  >
                    <BiUserCheck size={24} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Venue Manager Full Profile</h5>
                    <p className="text-muted small mb-0" style={{ fontSize: '11px' }}>
                      Assigned Administrator Access Card
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedManagerModal(null)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-bold mb-2 shadow-sm"
                    style={{
                      width: '72px',
                      height: '72px',
                      backgroundColor: 'var(--ss-primary)',
                      fontSize: '28px'
                    }}
                  >
                    {(selectedManagerModal.managerName[0] || 'M').toUpperCase()}
                  </div>
                  <h4 className="fw-bold text-dark mb-1">{selectedManagerModal.managerName}</h4>
                  <span className="badge bg-teal-light text-teal px-3 py-1 fw-semibold" style={{ color: 'var(--ss-primary)', backgroundColor: 'rgba(15, 118, 110, 0.1)' }}>
                    {selectedManagerModal.role}
                  </span>
                </div>

                <div className="bg-light p-3 rounded-3 border mb-3">
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                    <li className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">Email Address:</span>
                      <span className="fw-semibold text-dark">{selectedManagerModal.managerEmail}</span>
                    </li>
                    <li className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">Contact Phone:</span>
                      <span className="fw-semibold text-dark d-flex align-items-center gap-1">
                        <BiPhone size={14} className="text-teal" />
                        {selectedManagerModal.managerPhone}
                      </span>
                    </li>
                    <li className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">Assigned Venue:</span>
                      <span className="fw-semibold text-dark">{selectedManagerModal.venueName}</span>
                    </li>
                    <li className="d-flex justify-content-between border-bottom pb-2">
                      <span className="text-muted">Venue Location:</span>
                      <span className="fw-semibold text-dark">{selectedManagerModal.venueLocation}</span>
                    </li>
                    <li className="d-flex justify-content-between">
                      <span className="text-muted">Access Status:</span>
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        <BiBadgeCheck className="me-1" />
                        {selectedManagerModal.status}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="modal-footer bg-light border-top">
                <button
                  type="button"
                  className="btn btn-ss-outline py-2 px-3 small"
                  onClick={() => {
                    toast.info(`Access credentials re-sent to ${selectedManagerModal.managerEmail}`);
                    setSelectedManagerModal(null);
                  }}
                >
                  <BiEnvelope className="me-1" />
                  Re-send Credentials
                </button>
                <button
                  type="button"
                  className="btn btn-ss-primary py-2 px-4 small"
                  onClick={() => setSelectedManagerModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VENUE MODAL */}
      {isEditVenueModalOpen && editingVenue && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-dark">Edit Venue Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <Input
                        label="Venue Name"
                        name="name"
                        type="text"
                        required
                        value={editingVenue.name}
                        onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12">
                      <Input
                        label="Description"
                        name="description"
                        type="text"
                        required
                        value={editingVenue.description || ''}
                        onChange={(e) => setEditingVenue({ ...editingVenue, description: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12">
                      <Input
                        label="Address"
                        name="address"
                        type="text"
                        required
                        value={editingVenue.address}
                        onChange={(e) => setEditingVenue({ ...editingVenue, address: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <Input
                        label="City"
                        name="city"
                        type="text"
                        required
                        value={editingVenue.city}
                        onChange={(e) => setEditingVenue({ ...editingVenue, city: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <Input
                        label="Pincode"
                        name="pincode"
                        type="text"
                        required
                        value={editingVenue.pincode}
                        onChange={(e) => setEditingVenue({ ...editingVenue, pincode: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <Input
                        label="State"
                        name="state"
                        type="text"
                        required
                        value={editingVenue.state}
                        onChange={(e) => setEditingVenue({ ...editingVenue, state: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <Input
                        label="Country"
                        name="country"
                        type="text"
                        required
                        value={editingVenue.country}
                        onChange={(e) => setEditingVenue({ ...editingVenue, country: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12">
                      <Input
                        label="Google Maps Link"
                        name="googleMapsLink"
                        type="url"
                        value={editingVenue.googleMapsLink || ''}
                        onChange={(e) => setEditingVenue({ ...editingVenue, googleMapsLink: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12">
                      <Input
                        label="Amenities (Comma separated)"
                        name="amenities"
                        type="text"
                        placeholder="e.g. Washroom, Drinking Water, Parking"
                        value={editingVenue.amenities || ''}
                        onChange={(e) => setEditingVenue({ ...editingVenue, amenities: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Contact Email"
                        name="contactEmail"
                        type="email"
                        required
                        value={editingVenue.contactEmail}
                        onChange={(e) => setEditingVenue({ ...editingVenue, contactEmail: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Contact Phone"
                        name="contactPhone"
                        type="tel"
                        required
                        value={editingVenue.contactPhone}
                        onChange={(e) => setEditingVenue({ ...editingVenue, contactPhone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Open Time"
                        name="openTime"
                        type="time"
                        required
                        value={editingVenue.openTime}
                        onChange={(e) => setEditingVenue({ ...editingVenue, openTime: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Close Time"
                        name="closeTime"
                        type="time"
                        required
                        value={editingVenue.closeTime}
                        onChange={(e) => setEditingVenue({ ...editingVenue, closeTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary py-2 px-4" onClick={handleCloseEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-ss-primary py-2 px-4" disabled={editVenueLoading}>
                    {editVenueLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TURF MODAL */}
      {isEditTurfModalOpen && editingTurf && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom bg-light">
                <h5 className="modal-title fw-bold text-dark">Edit Turf</h5>
                <button type="button" className="btn-close" onClick={handleCloseEditTurfModal}></button>
              </div>
              <form onSubmit={handleEditTurfSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <Input
                        label="Turf Name"
                        name="name"
                        type="text"
                        required
                        value={editingTurf.name}
                        onChange={(e) => setEditingTurf({ ...editingTurf, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark">Sport</label>
                        <select
                          className="form-select ss-input"
                          value={editingTurf.sport}
                          onChange={(e) => setEditingTurf({ ...editingTurf, sport: e.target.value })}
                          required
                        >
                          {SPORT_OPTIONS.map((sport) => (
                            <option key={sport} value={sport}>{sport}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Surface Type"
                        name="surfaceType"
                        type="text"
                        required
                        value={editingTurf.surfaceType}
                        onChange={(e) => setEditingTurf({ ...editingTurf, surfaceType: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        label="Length (ft)"
                        name="lengthFt"
                        type="number"
                        min="1"
                        required
                        value={editingTurf.lengthFt}
                        onChange={(e) => setEditingTurf({ ...editingTurf, lengthFt: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        label="Width (ft)"
                        name="widthFt"
                        type="number"
                        min="1"
                        required
                        value={editingTurf.widthFt}
                        onChange={(e) => setEditingTurf({ ...editingTurf, widthFt: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <Input
                        label="Capacity"
                        name="capacity"
                        type="number"
                        min="1"
                        required
                        value={editingTurf.capacity}
                        onChange={(e) => setEditingTurf({ ...editingTurf, capacity: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <Input
                        label="Price per Hour (₹)"
                        name="pricePerHour"
                        type="number"
                        min="0"
                        required
                        value={editingTurf.pricePerHour}
                        onChange={(e) => setEditingTurf({ ...editingTurf, pricePerHour: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 d-flex align-items-center">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isIndoorSwitch"
                          checked={editingTurf.isIndoor === true || editingTurf.isIndoor === 'true'}
                          onChange={(e) => setEditingTurf({ ...editingTurf, isIndoor: e.target.checked })}
                        />
                        <label className="form-check-label ms-2 small fw-semibold text-dark" htmlFor="isIndoorSwitch">
                          Is Indoor?
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-top">
                  <button type="button" className="btn btn-outline-secondary py-2 px-4" onClick={handleCloseEditTurfModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-ss-primary py-2 px-4" disabled={editTurfLoading}>
                    {editTurfLoading ? 'Saving...' : 'Save Turf'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
