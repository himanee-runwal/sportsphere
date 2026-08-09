import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { venueApi } from '../api/venueApi';
import { bookingApi } from '../api/bookingApi';
import { toast } from 'react-toastify';
import { 
  BiMap, 
  BiTimeFive, 
  BiToggleRight, 
  BiToggleLeft,
  BiChevronLeft,
  BiCheckCircle,
  BiLock,
  BiRupee,
  BiCalendar,
  BiMessageDetail,
  BiRefresh,
  BiSearch,
  BiShareAlt,
  BiBriefcase,
  BiCart,
  BiInfoCircle
} from 'react-icons/bi';

const formatTime12 = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${m} ${ampm}`;
};

const formatLocalDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getSportEmoji = (sportName) => {
  const name = (sportName || '').toLowerCase();
  if (name.includes('badminton')) return '🏸';
  if (name.includes('football') || name.includes('soccer')) return '⚽';
  if (name.includes('table tennis') || name.includes('ping pong')) return '🏓';
  if (name.includes('tennis')) return '🎾';
  if (name.includes('squash')) return '🎾';
  if (name.includes('cricket')) return '🏏';
  if (name.includes('basketball')) return '🏀';
  if (name.includes('pickleball')) return '🏓';
  if (name.includes('swimming')) return '🏊';
  return '⚽';
};

const getVenueDistance = (venueId) => {
  const hash = (venueId * 7) % 25 + 1;
  const decimal = (venueId * 3) % 10;
  return `~ ${hash}.${decimal} km`;
};

const getConsecutiveSlots = (startSlot, durationHours, allSlots) => {
  if (!startSlot || !allSlots || allSlots.length === 0) return [];
  
  const sorted = [...allSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const startIndex = sorted.findIndex(s => s.slotId === startSlot.slotId);
  if (startIndex === -1) return [];

  const result = [];
  for (let i = 0; i < durationHours; i++) {
    const currentSlot = sorted[startIndex + i];
    if (!currentSlot || !currentSlot.available) {
      return []; // Return empty if contiguous availability is broken
    }
    if (i > 0) {
      const prevSlot = result[i - 1];
      if (prevSlot.endTime !== currentSlot.startTime) {
        return []; // Gap detected
      }
    }
    result.push(currentSlot);
  }
  return result;
};

const VenuesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Navigation states: 'listing' | 'details' | 'booking'
  const [viewState, setViewState] = useState('listing');
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Directory filter states
  const [activeTab, setActiveTab] = useState('venues');
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('ALL');

  // Booking states
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingDuration, setBookingDuration] = useState(1);

  // Cart & Checkout states
  const [cart, setCart] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  
  // Payment states
  const [paymentStep, setPaymentStep] = useState(false);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Date boundaries: Min is today, Max is today + 1 month
  const today = new Date();
  const minDate = formatLocalDate(today);
  const maxDateVal = new Date();
  maxDateVal.setMonth(maxDateVal.getMonth() + 1);
  const maxDate = formatLocalDate(maxDateVal);

  useEffect(() => {
    setSelectedDate(minDate);
  }, []);

  // Fetch Venues on mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const data = await venueApi.getAllVenues(0, 50);
        const mappedVenues = (data.content || data || []).map(v => ({
          ...v,
          location: v.city ? `${v.address}, ${v.city}` : v.address,
          sports: v.sports ? v.sports.join(', ') : '',
          isOnline: v.isActive ?? true,
          imageUrl: v.primaryImageUrl || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=800'
        }));
        setVenues(mappedVenues);
      } catch (error) {
        toast.error('Failed to load venues');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  // Auto-open venue details if passed from Dashboard
  useEffect(() => {
    if (venues.length > 0 && location.state?.venueId && viewState === 'listing') {
      const target = venues.find(v => String(v.id) === String(location.state.venueId));
      if (target) {
        handleVenueClick(target);
        // Clear the state so it doesn't re-trigger on back navigation
        window.history.replaceState({}, document.title);
      }
    }
  }, [venues, location.state, viewState]);

  // Fetch slots whenever selected court or date changes
  useEffect(() => {
    if (selectedCourt && selectedDate && viewState === 'booking') {
      const fetchSlots = async () => {
        try {
          setSlotsLoading(true);
          setSelectedSlot(null);
          setBookingDuration(1);
          const data = await bookingApi.getSlotAvailability(selectedCourt.id, selectedDate);
          setSlots(data || []);
        } catch (error) {
          toast.error('Failed to load slots for this date.');
          setSlots([]);
          console.error(error);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [selectedCourt, selectedDate, viewState]);

  // Determine contiguous selected slot array span based on start slot and duration
  const getSelectedSlotsSpan = () => {
    if (!selectedSlot) return [];
    const span = getConsecutiveSlots(selectedSlot, bookingDuration, slots);
    return span.length > 0 ? span : [selectedSlot];
  };

  const selectedSlots = getSelectedSlotsSpan();

  const canIncrement = () => {
    if (!selectedSlot) return false;
    const nextSpan = getConsecutiveSlots(selectedSlot, bookingDuration + 1, slots);
    return nextSpan.length === bookingDuration + 1;
  };

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    const filteredTurfs = selectedVenue?.turfs?.filter(t => 
      (t.sport || '').toLowerCase() === sport.toLowerCase()
    ) || [];
    
    if (filteredTurfs.length > 0) {
      setSelectedCourt(filteredTurfs[0]);
    } else {
      setSelectedCourt(null);
    }
    setSelectedSlot(null);
    setBookingDuration(1);
  };

  const handleDetailsSportSelect = (sport) => {
    setSelectedSport(sport);
    const filteredTurfs = selectedVenue?.turfs?.filter(t => 
      (t.sport || '').toLowerCase() === sport.toLowerCase()
    ) || [];
    if (filteredTurfs.length > 0) {
      setSelectedCourt(filteredTurfs[0]);
    }
  };

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    const firstTurfSport = venue.turfs?.[0]?.sport || '';
    setSelectedSport(firstTurfSport);
    setSelectedCourt(venue.turfs?.[0] || null);

    // Fetch reviews
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const reviewData = await venueApi.getVenueReviews(venue.id, 0, 10);
        setReviews(reviewData.content || reviewData || []);
        
        // Pre-fill review form if user already has a review
        if (user) {
          const existing = (reviewData.content || reviewData || []).find(r => String(r.userId) === String(user.id));
          if (existing) {
            setReviewForm({ rating: existing.rating, comment: existing.comment || '' });
          } else {
            setReviewForm({ rating: 5, comment: '' });
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();

    setViewState('details');
  };

  const handleBookNowClick = () => {
    setViewState('booking');
    setCart(null);
    setSelectedSlot(null);
    setBookingDuration(1);
    setBookingNotes('');
    setConfirmedBooking(null);
    setPaymentStep(false);
    setPendingBookings([]);
  };

  const handleAddToCart = () => {
    if (!selectedSlot || !selectedCourt) {
      toast.error('Please select a valid starting slot and court.');
      return;
    }
    setCart({
      venue: selectedVenue,
      turf: selectedCourt,
      date: selectedDate,
      slots: selectedSlots
    });
    toast.success('Slots added to cart successfully!');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to proceed with checkout.');
      navigate('/login', { state: { from: '/venues' } });
      return;
    }

    if (!cart) {
      toast.error('Your cart is empty.');
      return;
    }

    try {
      setBookingSubmitLoading(true);
      let createdBookings = [];
      
      // Loop over each slot in the cart and book it
      for (const slot of cart.slots) {
        const bookingData = {
          groundId: cart.turf.id,
          slotId: slot.slotId,
          bookingDate: cart.date,
          notes: bookingNotes
        };
        const resp = await bookingApi.createBooking(bookingData);
        createdBookings.push(resp);
      }

      setPendingBookings(createdBookings);
      setPaymentStep(true);
      toast.info('Booking created! Please complete payment.');
    } catch (error) {
      toast.error(error.message || 'Checkout failed. Slots may have already been booked.');
      console.error(error);
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!pendingBookings || pendingBookings.length === 0) return;

    try {
      setPaymentLoading(true);
      let lastResponse = null;

      for (const booking of pendingBookings) {
        const paymentData = { paymentMethod };
        lastResponse = await bookingApi.processPayment(booking.id, paymentData);
      }

      // Merge timings and show receipt
      setConfirmedBooking({
        ...lastResponse,
        startTime: cart.slots[0].startTime,
        endTime: cart.slots[cart.slots.length - 1].endTime,
        totalAmount: cart.slots.reduce((sum, s) => sum + s.price, 0)
      });
      setPaymentStep(false);
      setPendingBookings([]);
      setCart(null);
      toast.success('Payment successful! Booking confirmed.');
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
      console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to submit a review.');
      return;
    }
    if (!reviewForm.rating) {
      toast.error('Please select a rating.');
      return;
    }
    try {
      setSubmittingReview(true);
      await venueApi.addOrUpdateReview(selectedVenue.id, reviewForm);
      toast.success('Review submitted successfully!');
      
      // Refresh reviews
      const reviewData = await venueApi.getVenueReviews(selectedVenue.id, 0, 10);
      setReviews(reviewData.content || reviewData || []);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!isAuthenticated) return;
    try {
      setSubmittingReview(true);
      await venueApi.deleteReview(selectedVenue.id);
      toast.success('Review deleted successfully!');
      
      setReviewForm({ rating: 5, comment: '' });
      
      // Refresh reviews
      const reviewData = await venueApi.getVenueReviews(selectedVenue.id, 0, 10);
      setReviews(reviewData.content || reviewData || []);
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleForceInitialize = async () => {
    if (!selectedCourt) return;
    try {
      setSlotsLoading(true);
      await bookingApi.initializeSlots(selectedCourt.id);
      toast.success('Slots templates reinitialized successfully!');
      const data = await bookingApi.getSlotAvailability(selectedCourt.id, selectedDate);
      setSlots(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to initialize slots.');
      console.error(error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const filteredVenues = venues.filter(v => {
    const matchesName = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = sportFilter === 'ALL' || v.sports.toLowerCase().includes(sportFilter.toLowerCase());
    return matchesName && matchesSport;
  });

  const allAvailableSports = Array.from(
    new Set(venues.flatMap(v => v.sports ? v.sports.split(', ') : []))
  );

  const userRole = (user?.role || '').toUpperCase();
  const canInitialize = userRole === 'MANAGER' || userRole === 'ADMIN' || userRole === 'VENUE_MANAGER';

  // -------------------------------------------------------------------------
  // VIEW RENDER 1: BOOKING FORM & CART PAGE
  // -------------------------------------------------------------------------
  if (viewState === 'booking' && selectedVenue) {
    const venueSportsList = Array.from(
      new Set(selectedVenue.turfs?.map(t => t.sport).filter(Boolean) || [])
    );

    const courtsForSport = selectedVenue.turfs?.filter(t => 
      (t.sport || '').toLowerCase() === selectedSport.toLowerCase()
    ) || [];

    return (
      <div className="container py-5">
        {/* Navigation back */}
        <button 
          onClick={() => {
            if (confirmedBooking) {
              setViewState('listing');
              setSelectedVenue(null);
            } else {
              setViewState('details');
            }
          }} 
          className="btn btn-ss-outline d-inline-flex align-items-center gap-2 mb-4 py-2 px-3 border shadow-sm bg-white"
          style={{ borderRadius: '10px' }}
        >
          <BiChevronLeft size={20} />
          <span>Back to Venue Details</span>
        </button>

        {confirmedBooking ? (
          /* SUCCESS SCREEN RECEIPT */
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div 
                className="ss-card bg-white p-5 border-0 shadow-lg text-center position-relative overflow-hidden"
                style={{ borderRadius: '16px' }}
              >
                <div className="position-absolute top-0 start-0 w-100 bg-success" style={{ height: '6px' }}></div>
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-4"
                  style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16A34A' }}
                >
                  <BiCheckCircle size={48} />
                </div>

                <h3 className="fw-bold text-dark mb-2">Booking Confirmed!</h3>
                <p className="text-muted-custom small mb-4">
                  Thank you! Your court reservation has been confirmed.
                </p>

                {/* Ticket Details */}
                <div 
                  className="p-4 bg-white rounded-3 border mb-4 text-start shadow-sm"
                  style={{ borderStyle: 'dashed', borderColor: 'var(--ss-border, #E2E8F0)' }}
                >
                  <div className="text-center border-bottom pb-3 mb-3">
                    <span className="text-muted small uppercase fw-semibold">Booking Number</span>
                    <h5 className="font-monospace fw-bold text-teal mb-0 mt-1" style={{ color: 'var(--ss-primary)' }}>
                      {confirmedBooking.bookingNumber}
                    </h5>
                  </div>

                  <div className="d-flex flex-column gap-2 small">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted-custom">Venue:</span>
                      <strong className="text-dark">{selectedVenue.name}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted-custom">Ground / Court:</span>
                      <strong className="text-dark">{selectedCourt?.name}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted-custom">Sport:</span>
                      <span className="badge bg-light text-dark border font-monospace">{selectedCourt?.sport}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted-custom">Booking Date:</span>
                      <strong className="text-dark">{confirmedBooking.bookingDate}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted-custom">Time Slot:</span>
                      <strong className="text-dark">
                        {formatTime12(confirmedBooking.startTime)} - {formatTime12(confirmedBooking.endTime)}
                      </strong>
                    </div>
                    {confirmedBooking.notes && (
                      <div className="d-flex flex-column mt-2 pt-2 border-top">
                        <span className="text-muted-custom small mb-1">Notes:</span>
                        <p className="text-dark bg-light p-2 rounded small mb-0 font-italic">
                          "{confirmedBooking.notes}"
                        </p>
                      </div>
                    )}
                    <div className="d-flex justify-content-between border-top pt-2 mt-2">
                      <strong className="text-dark">Total Amount:</strong>
                      <strong className="text-teal fs-5" style={{ color: 'var(--ss-primary)' }}>
                        ₹{confirmedBooking.totalAmount.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <button 
                    onClick={() => {
                      setConfirmedBooking(null);
                      setViewState('booking');
                      setSelectedSlot(null);
                      setBookingDuration(1);
                      setCart(null);
                    }}
                    className="btn btn-ss-outline flex-grow-1 py-2"
                  >
                    Book Another Slot
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-ss-primary flex-grow-1 py-2"
                  >
                    Go to My Bookings
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* FORM & CART LAYOUT */
          <div className="row g-4">
            {/* Left Column: Form Selector */}
            <div className="col-lg-6">
              <div className="ss-card bg-white p-4 border shadow-sm" style={{ borderRadius: '12px' }}>
                <h4 className="fw-bold text-dark mb-1">{selectedVenue.name}</h4>
                <p className="text-muted small mb-4">{selectedVenue.location}</p>

                {/* Form fields */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Sports</label>
                  <select 
                    className="form-select border shadow-none"
                    value={selectedSport}
                    onChange={(e) => handleSportChange(e.target.value)}
                    style={{ borderRadius: '8px', padding: '10px' }}
                  >
                    <option value="" disabled>--Select Sport--</option>
                    {venueSportsList.map(sport => (
                      <option key={sport} value={sport}>{getSportEmoji(sport)} {sport}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Court</label>
                  <select 
                    className="form-select border shadow-none"
                    value={selectedCourt?.id || ''}
                    onChange={(e) => {
                      const courtObj = selectedVenue.turfs?.find(t => t.id === parseInt(e.target.value, 10));
                      setSelectedCourt(courtObj || null);
                      setSelectedSlot(null);
                      setBookingDuration(1);
                    }}
                    style={{ borderRadius: '8px', padding: '10px' }}
                    disabled={!selectedSport}
                  >
                    <option value="" disabled>--Select Court--</option>
                    {courtsForSport.map(court => (
                      <option key={court.id} value={court.id}>{court.name} (₹{court.pricePerHour}/hr)</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Date</label>
                  <input 
                    type="date" 
                    className="form-control border shadow-none"
                    value={selectedDate}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                      setBookingDuration(1);
                    }}
                    style={{ borderRadius: '8px', padding: '10px' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Duration</label>
                  <div className="d-flex align-items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => setBookingDuration(prev => Math.max(1, prev - 1))}
                      disabled={bookingDuration === 1 || !selectedSlot}
                      className="btn btn-light border p-2 d-flex align-items-center justify-content-center"
                      style={{ borderRadius: '8px', width: '40px', height: '40px' }}
                    >
                      -
                    </button>
                    <span className="fw-semibold">{bookingDuration} Hr</span>
                    <button 
                      type="button" 
                      onClick={() => setBookingDuration(prev => prev + 1)}
                      disabled={!canIncrement() || !selectedSlot}
                      className="btn btn-light border p-2 d-flex align-items-center justify-content-center"
                      style={{ borderRadius: '8px', width: '40px', height: '40px' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark d-flex align-items-center justify-content-between w-100">
                    <span>Start Time (Select Visual Slot)</span>
                    {canInitialize && selectedCourt && (
                      <button 
                        type="button" 
                        onClick={handleForceInitialize}
                        className="btn btn-link p-0 text-teal small fw-semibold text-decoration-none"
                        style={{ color: 'var(--ss-primary)' }}
                      >
                        <BiRefresh size={16} /> Reinitialize Slots
                      </button>
                    )}
                  </label>

                  {slotsLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-teal" role="status"></div>
                    </div>
                  ) : !selectedCourt ? (
                    <div className="text-muted small p-3 bg-light rounded text-center">
                      Please select court to load visual slots
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-muted small p-3 bg-light rounded text-center">
                      No slots templates loaded.
                    </div>
                  ) : (
                    /* Visual slot grid of small boxes */
                    <div className="row g-2">
                      {slots.map((slot) => {
                        const isSelectedInSpan = selectedSlots.some(s => s.slotId === slot.slotId);
                        const isAvailable = slot.available;
                        
                        return (
                          <div className="col-4 col-sm-3" key={slot.slotId}>
                            <button
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setBookingDuration(1); // reset duration
                              }}
                              className={`w-100 p-2 rounded text-center border transition-hover d-flex flex-column align-items-center justify-content-center ${
                                !isAvailable 
                                  ? 'bg-light text-muted border-light cursor-not-allowed opacity-60'
                                  : isSelectedInSpan
                                    ? 'bg-teal text-white border-teal shadow-sm'
                                    : 'bg-white text-dark border-light-custom'
                              }`}
                              style={{
                                fontSize: '11px',
                                minHeight: '56px',
                                borderColor: isSelectedInSpan 
                                  ? 'var(--ss-primary)' 
                                  : 'var(--ss-border, #E2E8F0)',
                                backgroundColor: isSelectedInSpan 
                                  ? 'var(--ss-primary)' 
                                  : !isAvailable 
                                    ? '#F1F5F9' 
                                    : '#FFFFFF',
                                color: isSelectedInSpan ? '#FFFFFF' : '#0F172A'
                              }}
                            >
                              <span className="fw-bold">{formatTime12(slot.startTime).split(' ')[0]}</span>
                              <span style={{ fontSize: '9px', opacity: 0.9 }}>
                                {formatTime12(slot.startTime).split(' ')[1]}
                              </span>
                              {!isAvailable ? (
                                <span className="text-danger" style={{ fontSize: '8px', fontWeight: 'bold' }}>Booked</span>
                              ) : (
                                <span style={{ fontSize: '9px', fontWeight: '600', color: isSelectedInSpan ? '#FFF' : 'var(--ss-primary)' }}>
                                  ₹{slot.price}
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedSlot}
                  className="btn btn-ss-primary w-100 py-3 mt-2"
                >
                  Add To Cart
                </button>
              </div>
            </div>

            {/* Right Column: Shopping Cart */}
            <div className="col-lg-6">
              <div 
                className="ss-card bg-white p-4 border shadow-sm h-100 d-flex flex-column justify-content-between"
                style={{ borderRadius: '12px' }}
              >
                {!cart ? (
                  <div className="text-center py-5 my-auto">
                    <BiCart className="text-muted mb-3" size={72} />
                    <h5 className="fw-bold text-dark">Cart Is Empty</h5>
                    <p className="small text-muted-custom">
                      Configure your booking parameters and click Add to Cart.
                    </p>
                  </div>
                ) : paymentStep ? (
                  <form onSubmit={handlePayment} className="h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Payment Details</h5>
                      <div className="alert alert-warning small">
                        <strong>Test Payment Mode:</strong> Please complete this step to confirm your PENDING booking.
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark">Payment Method</label>
                        <select 
                          className="form-select border shadow-none"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ borderRadius: '8px', padding: '10px' }}
                        >
                          <option value="CREDIT_CARD">Credit Card</option>
                          <option value="DEBIT_CARD">Debit Card</option>
                          <option value="UPI">UPI / Net Banking</option>
                        </select>
                      </div>

                      <div className="p-3 bg-light rounded-3 border mb-3 text-center">
                        <span className="text-muted small d-block mb-1">Total Amount Due</span>
                        <h3 className="fw-bold text-teal mb-0" style={{ color: 'var(--ss-primary)' }}>
                          ₹{cart.slots.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-top">
                      <button
                        type="submit"
                        disabled={paymentLoading}
                        className="btn btn-ss-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                      >
                        {paymentLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            <span>Processing Payment...</span>
                          </>
                        ) : (
                          <span>Pay Now</span>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCheckout} className="h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">Cart Summary</h5>
                      
                      <div className="p-3 bg-light rounded-3 border mb-3">
                        <div className="mb-2 d-flex justify-content-between small">
                          <span className="text-muted">Venue:</span>
                          <strong className="text-dark">{cart.venue.name}</strong>
                        </div>
                        <div className="mb-2 d-flex justify-content-between small">
                          <span className="text-muted">Court / Turf:</span>
                          <strong className="text-dark">{cart.turf.name}</strong>
                        </div>
                        <div className="mb-2 d-flex justify-content-between small">
                          <span className="text-muted">Sport:</span>
                          <span className="badge bg-white text-dark border font-monospace">{cart.turf.sport}</span>
                        </div>
                        <div className="mb-2 d-flex justify-content-between small">
                          <span className="text-muted">Date:</span>
                          <strong className="text-dark">{cart.date}</strong>
                        </div>
                        <div className="mb-2 d-flex justify-content-between small">
                          <span className="text-muted">Time Slot:</span>
                          <strong className="text-dark">
                            {formatTime12(cart.slots[0].startTime)} - {formatTime12(cart.slots[cart.slots.length - 1].endTime)} ({cart.slots.length} Hr)
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between border-top pt-2 mt-2">
                          <strong className="text-dark">Total Price:</strong>
                          <strong className="text-teal fs-6" style={{ color: 'var(--ss-primary)' }}>
                            ₹{cart.slots.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark d-flex align-items-center gap-1">
                          <BiMessageDetail />
                          <span>Special Requests / Notes</span>
                        </label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="e.g. need bats, bibs, water? (Optional)"
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          style={{ borderRadius: '8px', fontSize: '13px' }}
                        ></textarea>
                      </div>

                      {!isAuthenticated && (
                        <div className="alert alert-info py-2 small mb-3">
                          <BiInfoCircle className="me-1" />
                          Authentication is required. You will be redirected to Log In.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted">Subtotal:</span>
                        <strong className="fs-5 text-dark">
                          ₹{cart.slots.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                        </strong>
                      </div>

                      <button
                        type="submit"
                        disabled={bookingSubmitLoading}
                        className="btn btn-ss-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                      >
                        {bookingSubmitLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            <span>Checking out...</span>
                          </>
                        ) : (
                          <span>{isAuthenticated ? 'Proceed to Payment' : 'Log In to Checkout'}</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW RENDER 2: DETAILED VIEW (Mockup 2 & 3)
  // -------------------------------------------------------------------------
  if (viewState === 'details' && selectedVenue) {
    const sportsList = selectedVenue.turfs 
      ? Array.from(new Set(selectedVenue.turfs.map(t => t.sport).filter(Boolean))) 
      : [];

    return (
      <div className="container py-5">
        {/* Back Button */}
        <button 
          onClick={() => setViewState('listing')} 
          className="btn btn-ss-outline d-inline-flex align-items-center gap-2 mb-4 py-2 px-3 border shadow-sm bg-white"
          style={{ borderRadius: '10px' }}
        >
          <BiChevronLeft size={20} />
          <span>Back to Directory</span>
        </button>

        <div className="row g-4">
          {/* Left Column (8 cols): Gallery, Sports Buttons, Amenities, About */}
          <div className="col-lg-8">
            {/* Gallery Cover Photo */}
            <div className="ss-card bg-white p-0 border overflow-hidden shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <div style={{ height: '350px' }} className="position-relative">
                <img 
                  src={selectedVenue.imageUrl} 
                  alt={selectedVenue.name} 
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>

            {/* Sports Available Selector Grid */}
            <div className="ss-card bg-white p-4 border shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <h5 className="fw-bold text-dark mb-1">Sports Available</h5>
              <p className="text-muted small mb-3">Click on sports to view price rates</p>
              
              <div className="d-flex flex-wrap gap-2">
                {sportsList.map((sport) => {
                  const isSelected = selectedSport.toLowerCase() === sport.toLowerCase();
                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleDetailsSportSelect(sport)}
                      className={`btn p-3 d-flex flex-column align-items-center justify-content-center border transition-hover ${
                        isSelected ? 'border-teal' : 'bg-white text-dark'
                      }`}
                      style={{
                        borderRadius: '10px',
                        minWidth: '100px',
                        minHeight: '90px',
                        borderColor: isSelected ? 'var(--ss-primary)' : '#E2E8F0',
                        backgroundColor: isSelected ? 'rgba(15, 118, 110, 0.05)' : '#FFFFFF'
                      }}
                    >
                      <span className="fs-3 mb-1">{getSportEmoji(sport)}</span>
                      <span className="small fw-semibold">{sport}</span>
                    </button>
                  );
                })}
              </div>

              {/* Show rate details of selected sport's court */}
              {selectedCourt && (
                <div className="mt-3 p-3 bg-light rounded-3 border small">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong className="text-dark">{selectedCourt.name}</strong>
                      <div className="text-muted-custom" style={{ fontSize: '11px' }}>
                        Surface: {selectedCourt.surfaceType || 'Hybrid'} • Size: {selectedCourt.lengthFt}x{selectedCourt.widthFt} ft • Capacity: {selectedCourt.capacity} players
                      </div>
                    </div>
                    <span className="fw-bold text-teal" style={{ color: 'var(--ss-primary)', fontSize: '15px' }}>
                      ₹{selectedCourt.pricePerHour}/hr
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Amenities Section */}
            <div className="ss-card bg-white p-4 border shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <h5 className="fw-bold text-dark mb-3">Amenities</h5>
              {(!selectedVenue.amenities || selectedVenue.amenities.length === 0) ? (
                <div className="text-muted small">No amenities listed for this venue.</div>
              ) : (
                <div className="row g-3">
                  {selectedVenue.amenities.map((amenity, idx) => (
                    <div className="col-md-6 col-sm-6" key={idx}>
                      <div className="d-flex align-items-center gap-2">
                        <BiCheckCircle className="text-success" size={20} />
                        <span className="small text-dark fw-medium">{amenity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* About Venue */}
            <div className="ss-card bg-white p-4 border shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <h5 className="fw-bold text-dark mb-3">About Venue</h5>
              <p className="text-muted-custom small" style={{ lineHeight: '1.6' }}>
                {selectedVenue.description || `Welcome to ${selectedVenue.name}, Pune's premier sporting arena designed to offer clean, professional infrastructure for multi-sport enthusiasts. Our courts are built using quality materials to prevent physical stress, featuring bright lighting configurations for evening matches.`}
              </p>
            </div>

            {/* Reviews & Feedback Section */}
            <div className="ss-card bg-white p-4 border shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-dark mb-0">Reviews & Feedback</h5>
                <span className="badge bg-light text-dark border">
                  {selectedVenue.ratingInfo || 'No Reviews'}
                </span>
              </div>

              {/* Review Form for logged in users */}
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="mb-4 p-3 bg-light rounded-3 border">
                  <h6 className="fw-semibold text-dark mb-2">Leave a Review</h6>
                  <div className="mb-2 d-flex align-items-center gap-2">
                    <label className="small text-muted-custom">Rating:</label>
                    <select 
                      className="form-select form-select-sm border shadow-none" 
                      style={{ width: '80px' }}
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                    >
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}
                    </select>
                  </div>
                  <textarea 
                    className="form-control mb-2" 
                    rows="2" 
                    placeholder="Tell us about your experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  ></textarea>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted" style={{ fontSize: '11px' }}>
                      Note: You can only have one review per venue. Submitting again updates it.
                    </span>
                    <div>
                      {reviews.some(r => String(r.userId) === String(user?.id)) && (
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger me-2"
                          onClick={handleReviewDelete}
                          disabled={submittingReview}
                        >
                          Delete
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="btn btn-sm btn-ss-primary"
                        disabled={submittingReview}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="alert alert-info small py-2 mb-4">
                  Please log in to leave a review.
                </div>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-teal"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-muted small py-3">
                  No reviews yet. Be the first to review!
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map(review => (
                    <div key={review.id} className="p-3 border rounded-3 bg-white">
                      <div className="d-flex justify-content-between mb-2">
                        <div className="fw-semibold text-dark" style={{ fontSize: '14px' }}>
                          User #{review.userId}
                        </div>
                        <div className="text-warning small fw-bold">
                          {review.rating} ★
                        </div>
                      </div>
                      {review.comment && (
                        <p className="small text-muted-custom mb-0" style={{ lineHeight: '1.5' }}>
                          "{review.comment}"
                        </p>
                      )}
                      <div className="text-muted mt-2 text-end" style={{ fontSize: '10px' }}>
                        {new Date(review.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Maps and Booking CTA Details */}
          <div className="col-lg-4">
            {/* Interactive Maps Box */}
            <div className="ss-card bg-white p-0 border overflow-hidden shadow-sm mb-4" style={{ borderRadius: '12px', height: '240px' }}>
              <iframe 
                title="Venue Map"
                src={`https://maps.google.com/maps?q=${selectedVenue.latitude || 18.5204},${selectedVenue.longitude || 73.8567}&z=15&output=embed`}
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                loading="lazy"
              ></iframe>
            </div>

            {/* Book Now Widgets panel */}
            <div className="ss-card bg-white p-4 border shadow-sm" style={{ borderRadius: '12px' }}>
              <button 
                onClick={handleBookNowClick}
                className="btn btn-success w-100 py-3 text-white fw-bold mb-3 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#4CAF50', border: 'none', borderRadius: '10px', fontSize: '16px' }}
              >
                Book Now
              </button>

              <div className="d-flex gap-2 mb-4">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.info('Link copied to clipboard!');
                  }}
                  className="btn btn-light border py-2 px-3 flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: '8px', fontSize: '13px' }}
                >
                  <BiShareAlt />
                  <span>Share</span>
                </button>
                <button 
                  onClick={() => toast.info('For corporate enquiries contact: contact@sportosphere.com')}
                  className="btn btn-light border py-2 px-3 flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: '8px', fontSize: '13px' }}
                >
                  <BiBriefcase />
                  <span>Bulk / Corporate</span>
                </button>
              </div>

              <div className="mb-3 p-3 bg-light rounded-3 border">
                <span className="text-muted small fw-semibold">Timing</span>
                <div className="text-dark fw-bold mt-1" style={{ fontSize: '14px' }}>
                  {selectedVenue.openTime || '07:00 AM'} - {selectedVenue.closeTime || '09:00 PM'}
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 border">
                <span className="text-muted small fw-semibold">Location</span>
                <div className="text-dark small fw-semibold mt-1" style={{ lineHeight: '1.4' }}>
                  {selectedVenue.location}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW RENDER 3: SEARCH DIRECTORY VIEW (Mockup 1)
  // -------------------------------------------------------------------------
  return (
    <div className="container py-5">
      {/* Directory Title and Search Controls */}
      <div className="row align-items-center gy-3 mb-4">
        <div className="col-md-7">
          <h2 className="fw-bold text-dark mb-1">
            Sports Venues in Pune: Discover and Book Nearby Venues
          </h2>
        </div>
        <div className="col-md-5">
          <div className="d-flex gap-2">
            {/* Search Input */}
            <div className="input-group ss-input-group flex-grow-1">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <BiSearch size={18} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by venue name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}
              />
            </div>
            
            {/* Sport Dropdown Filter */}
            <select
              className="form-select border shadow-none"
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              style={{ width: '150px', borderRadius: '8px' }}
            >
              <option value="ALL">All Sports</option>
              {allAvailableSports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Tabs */}
      <div className="border-bottom d-flex gap-4 mb-4 pb-0 overflow-x-auto">
        {[
          { id: 'venues', label: `Venues (${filteredVenues.length})` },
          { id: 'coaching', label: 'Coaching (20)' },
          { id: 'events', label: 'Events (4)' },
          { id: 'memberships', label: 'Memberships (14)' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn pb-2 px-1 border-0 fw-semibold position-relative"
              style={{
                color: isActive ? 'var(--ss-primary)' : 'var(--ss-text-secondary)',
                fontSize: '15px',
                borderBottom: isActive ? '3px solid var(--ss-primary)' : 'none',
                borderRadius: 0
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-teal" role="status">
            <span className="visually-hidden">Loading venues...</span>
          </div>
        </div>
      ) : activeTab !== 'venues' ? (
        /* Empty tab state */
        <div className="text-center py-5 bg-white border rounded-3 shadow-sm">
          <h5 className="fw-bold text-dark">No Listings Available</h5>
          <p className="text-muted small">Secondary templates for coaching, events, and memberships are currently offline. Explore our booking Venues tab.</p>
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded-3 shadow-sm">
          <h5 className="fw-bold text-dark">No Venues Found</h5>
          <p className="text-muted small">We couldn't find any sports venues matching your query.</p>
        </div>
      ) : (
        /* Venues Card Directory */
        <div className="row g-4">
          {filteredVenues.map((v) => {
            const distance = getVenueDistance(v.id);
            const sportsArray = v.sports ? v.sports.split(', ') : [];
            return (
              <div className="col-lg-4 col-md-6" key={v.id}>
                <div 
                  className="ss-card bg-white p-0 border shadow-sm rounded-3 overflow-hidden h-100 d-flex flex-column transition-hover"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleVenueClick(v)}
                >
                  {/* Card Cover picture */}
                  <div className="position-relative" style={{ height: '200px' }}>
                    <img
                      src={v.imageUrl}
                      alt={v.name}
                      className="w-100 h-100 object-fit-cover"
                    />
                    <div className="position-absolute bottom-0 end-0 m-2">
                      <span
                        className="badge px-3 py-2 text-white fw-bold shadow-sm"
                        style={{ backgroundColor: '#4CAF50', borderRadius: '4px', fontSize: '12px' }}
                      >
                        Bookable
                      </span>
                    </div>
                  </div>

                  {/* Card details body */}
                  <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                    <div>
                      {/* Name and Rating */}
                      <div className="d-flex align-items-start justify-content-between mb-1">
                        <h5 className="fw-bold text-dark mb-0 text-truncate flex-grow-1" style={{ fontSize: '16px' }} title={v.name}>
                          {v.name}
                        </h5>
                        <span className="small fw-semibold text-warning d-flex align-items-center gap-1 ms-2" style={{ whiteSpace: 'nowrap' }}>
                          ★ {v.ratingInfo || 'No Reviews'}
                        </span>
                      </div>

                      {/* Location address and mockup distance */}
                      <p className="text-muted-custom small mb-2" style={{ fontSize: '13px' }}>
                        {v.city || 'Pune'} ({distance})
                      </p>
                    </div>

                    {/* Bottom row listing sport emojis */}
                    <div className="d-flex align-items-center gap-2 pt-2 border-top mt-2">
                      {sportsArray.slice(0, 4).map((sport, idx) => (
                        <span 
                          key={idx} 
                          className="fs-5" 
                          title={sport}
                        >
                          {getSportEmoji(sport)}
                        </span>
                      ))}
                      {sportsArray.length > 4 && (
                        <span className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>
                          +{sportsArray.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VenuesPage;
