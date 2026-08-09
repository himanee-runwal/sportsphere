import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { BiCalendarEvent, BiMapPin, BiGroup, BiSearch, BiCrosshair } from 'react-icons/bi';
import { toast } from 'react-toastify';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');

  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      toast.success(`Exploring sports venues in "${searchLocation.trim()}"...`);
    } else {
      toast.info('Exploring all sports venues...');
    }
    navigate('/venues');
  };

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <section className="bg-white py-5 border-bottom border-light position-relative overflow-hidden">
        {/* Watermark Background */}
        <div 
          className="position-absolute w-100 h-100 top-0 start-0" 
          style={{
            backgroundImage: "url('/colorful_sports_watermark.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.25,
            pointerEvents: 'none',
            zIndex: 0
          }}
        ></div>
        <div className="container py-lg-5 position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center justify-content-between gy-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="badge px-3 py-2 text-teal fw-semibold mb-3" style={{ color: 'var(--ss-primary)', backgroundColor: 'rgba(15, 118, 110, 0.1)', borderRadius: '999px' }}>
                SportSphere Platform v1.0
              </span>
              <h1 className="display-4 fw-bold mb-3 text-dark leading-tight">
                Play Together.<br />
                <span style={{ color: 'var(--ss-primary)' }}>Book Smarter.</span>
              </h1>
              <p className="lead text-muted-custom mb-0" style={{ fontSize: '18px' }}>
                Discover premium sports venues, book slots dynamically, coordinate matches with local players, and enter tournaments in your community.
              </p>
            </div>

            {/* Location Search Bar Card with Single Integrated Explore Button */}
            <div className="col-lg-5">
              <div className="ss-card p-4 border-0 shadow-lg bg-white rounded-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="p-3 rounded-circle me-3" style={{ backgroundColor: 'rgba(15, 118, 110, 0.1)', color: 'var(--ss-primary)' }}>
                    <BiMapPin size={28} />
                  </div>
                  <div>
                    <h3 className="h5 fw-bold text-dark mb-0">Find & Explore Venues</h3>
                    <p className="small text-muted mb-0">Set your location to explore sports facilities nearby</p>
                  </div>
                </div>

                <form onSubmit={handleLocationSearch} className="mb-3">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Location / City</label>
                    <div className="input-group ss-input-group">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <BiSearch size={18} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter city or area (e.g. Pune, Mumbai, Bangalore)..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Popular Indian City Pills */}
                  <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                    <span className="small text-muted me-1">Popular:</span>
                    {['Pune', 'Mumbai', 'Bangalore', 'Chennai'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSearchLocation(city);
                          toast.success(`Exploring sports venues in "${city}"...`);
                          navigate('/venues');
                        }}
                        className={`btn btn-sm ${searchLocation === city ? 'btn-ss-primary' : 'btn-outline-secondary'} py-1 px-3`}
                        style={{ borderRadius: '999px', fontSize: '12px' }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-ss-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2 text-white fw-bold">
                    <BiSearch size={20} />
                    <span>Explore Venues</span>
                  </button>
                </form>

                <div className="text-center pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none small p-0 text-teal fw-semibold d-inline-flex align-items-center gap-1"
                    style={{ color: 'var(--ss-primary)' }}
                    onClick={() => {
                      toast.info('Detecting location via GPS...');
                      navigator.geolocation?.getCurrentPosition(
                        (pos) => toast.success(`Detected location: Lat ${pos.coords.latitude.toFixed(2)}, Lon ${pos.coords.longitude.toFixed(2)}`),
                        () => toast.info('Defaulting location to Pune, MH')
                      );
                    }}
                  >
                    <BiCrosshair size={16} />
                    <span>Use Current Location</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5 bg-light-gray">
        <div className="container py-lg-5">
          <div className="text-center mb-5 max-w-600 mx-auto">
            <h2 className="fw-bold text-dark">Why Choose SportSphere?</h2>
            <p className="text-muted-custom small">
              Everything you need to orchestrate games, discover facilities, and coordinate play events.
            </p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="ss-card h-100 border-0 shadow-sm bg-white p-4">
                <div className="text-teal mb-3 d-inline-block p-3 rounded-3" style={{ backgroundColor: 'rgba(15, 118, 110, 0.08)', color: 'var(--ss-primary)' }}>
                  <BiMapPin size={28} />
                </div>
                <h4 className="h5 fw-bold mb-2">Venue Discovery</h4>
                <p className="text-muted-custom small mb-0">
                  Search venues matching your preferred sports, surface type, timing, and local coordinates.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="ss-card h-100 border-0 shadow-sm bg-white p-4">
                <div className="text-teal mb-3 d-inline-block p-3 rounded-3" style={{ backgroundColor: 'rgba(15, 118, 110, 0.08)', color: 'var(--ss-primary)' }}>
                  <BiCalendarEvent size={28} />
                </div>
                <h4 className="h5 fw-bold mb-2">Instant Booking</h4>
                <p className="text-muted-custom small mb-0">
                  Pick dates, review open slots, book instantly, and securely pay online via standard gateway integrations.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="ss-card h-100 border-0 shadow-sm bg-white p-4">
                <div className="text-teal mb-3 d-inline-block p-3 rounded-3" style={{ backgroundColor: 'rgba(15, 118, 110, 0.08)', color: 'var(--ss-primary)' }}>
                  <BiGroup size={28} />
                </div>
                <h4 className="h5 fw-bold mb-2">Community Building</h4>
                <p className="text-muted-custom small mb-0">
                  Find local players, create matches, post vacancies, share costs, and compete in tournaments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
