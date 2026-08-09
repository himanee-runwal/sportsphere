import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { BiMenu } from 'react-icons/bi';

const PublicLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg ss-navbar sticky-top">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center ss-nav-brand">
            <svg className="me-2" width="28" height="28" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--ss-primary)' }}>
              <mask id="navSoccerMask">
                <circle cx="256" cy="256" r="170" fill="#FFFFFF" />
                <polygon points="256,176 332,231 303,321 209,321 180,231" fill="none" stroke="#000000" stroke-width="24" stroke-linejoin="round" />
                <path d="M 256,176 L 256,86" stroke="#000000" stroke-width="24" stroke-linecap="round" />
                <path d="M 332,231 L 418,203" stroke="#000000" stroke-width="24" stroke-linecap="round" />
                <path d="M 303,321 L 356,394" stroke="#000000" stroke-width="24" stroke-linecap="round" />
                <path d="M 209,321 L 156,394" stroke="#000000" stroke-width="24" stroke-linecap="round" />
                <path d="M 180,231 L 94,203" stroke="#000000" stroke-width="24" stroke-linecap="round" />
              </mask>
              <circle cx="256" cy="256" r="215" stroke="currentColor" stroke-width="30" />
              <circle cx="256" cy="256" r="170" fill="currentColor" mask="url(#navSoccerMask)" />
            </svg>
            <span>SportSphere</span>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#sportsphereNavbar"
            aria-controls="sportsphereNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <BiMenu style={{ fontSize: '24px' }} />
          </button>

          <div className="collapse navbar-collapse" id="sportsphereNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link ss-nav-link ${isActive ? 'active' : ''}`}>
                  Home
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/venues" className={({ isActive }) => `nav-link ss-nav-link ${isActive ? 'active' : ''}`}>
                  Venues
                </NavLink>
              </li>

            </ul>

            <div className="d-flex align-items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn btn-ss-outline py-2 px-3 small" style={{ padding: '8px 16px !important' }}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn btn-ss-secondary py-2 px-3 small" style={{ padding: '8px 16px !important' }}>
                    Logout
                  </button>
                  <span className="navbar-text ms-2 fw-semibold text-muted-custom small d-none d-lg-inline">
                    Hi, {user.firstName || 'User'}
                  </span>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ss-outline py-2 px-3 small" style={{ padding: '8px 16px !important' }}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-ss-primary py-2 px-3 small" style={{ padding: '8px 16px !important' }}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="ss-footer mt-auto">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-4 col-md-6">
              <Link to="/" className="d-flex align-items-center mb-3 text-white text-decoration-none">
                <svg className="me-2" width="28" height="28" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--ss-accent)' }}>
                  <mask id="footerSoccerMask">
                    <circle cx="256" cy="256" r="170" fill="#FFFFFF" />
                    <polygon points="256,176 332,231 303,321 209,321 180,231" fill="none" stroke="#000000" stroke-width="24" stroke-linejoin="round" />
                    <path d="M 256,176 L 256,86" stroke="#000000" stroke-width="24" stroke-linecap="round" />
                    <path d="M 332,231 L 418,203" stroke="#000000" stroke-width="24" stroke-linecap="round" />
                    <path d="M 303,321 L 356,394" stroke="#000000" stroke-width="24" stroke-linecap="round" />
                    <path d="M 209,321 L 156,394" stroke="#000000" stroke-width="24" stroke-linecap="round" />
                    <path d="M 180,231 L 94,203" stroke="#000000" stroke-width="24" stroke-linecap="round" />
                  </mask>
                  <circle cx="256" cy="256" r="215" stroke="currentColor" stroke-width="30" />
                  <circle cx="256" cy="256" r="170" fill="currentColor" mask="url(#footerSoccerMask)" />
                </svg>
                <span className="fs-5 fw-bold">SportSphere</span>
              </Link>
              <p className="small mb-3" style={{ color: '#94a3b8' }}>
                Play Together. Book Smarter. The modern venue booking and community management platform for sports enthusiasts.
              </p>
              <p className="small mb-0" style={{ color: '#64748b' }}>
                &copy; {new Date().getFullYear()} SportSphere. All rights reserved.
              </p>
            </div>

            <div className="col-lg-2 col-md-3 col-6">
              <h6 className="text-white fw-bold mb-3 small text-uppercase">Explore</h6>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                <li><Link to="/venues">Find Venues</Link></li>

                <li><Link to="/venues">Book Slots</Link></li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-3 col-6">
              <h6 className="text-white fw-bold mb-3 small text-uppercase">Partners & Owners</h6>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                <li>
                  <a
                    href="#partner"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Venue onboarding and manager access are managed by SportSphere Administrators. Contact admin@sportsphere.com to list your venue.');
                    }}
                  >
                    List Your Venue
                  </a>
                </li>
                <li><Link to="/venues">Partner Facilities</Link></li>
                <li>
                  <a
                    href="#benefits"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('SportSphere partner benefits include automated slot scheduling, dynamic pricing, and manager portals.');
                    }}
                  >
                    Owner Benefits
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-6 col-12">
              <h6 className="text-white fw-bold mb-3 small text-uppercase">Support & Legal</h6>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-2 small">
                <li>
                  <a
                    href="#help"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Need help? Contact support@sportsphere.com or reach out to our team.');
                    }}
                  >
                    Help Center & FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Support email: support@sportsphere.com | Hotline: +1 (800) 555-SPORT');
                    }}
                  >
                    Contact Support
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('SportSphere respects user privacy and data encryption standards.');
                    }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#terms"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('SportSphere terms of service and booking cancellation guidelines apply.');
                    }}
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
