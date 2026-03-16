import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/image/logo.png';

export default function Header() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!(localStorage.getItem('studentToken') || localStorage.getItem('token'))
  );

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentCourseName');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    closeMenu();
    navigate('/');
  };

  return (
    <>
      <style>
        {`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
        }

        .header {
          width: 100%;
          background-color: var(--palegray);
          border-bottom: 1px solid var(--richblue);
          position: sticky;
          top: 0;
          z-index: 50;
          font-family: 'Inter', sans-serif;
        }

        .header-container {
          max-width: 72rem;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          position: relative;
        }

        .logo-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
        }

        .logo-button img {
          height: 3.25rem;
          border-radius: 0.5rem;
          border: 1px solid var(--richblue);
          background: var(--palegray);
        }

        .brand-name {
          font-weight: 600;
          color: var(--richblue);
          text-align: left;
        }

        .brand-tagline {
          font-size: 10px;
          color: var(--richblue);
        }

        /* NAV LINKS */
        .nav-links {
          display: flex;
          gap: 1rem;
        }

        .nav-links a {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--richblue);
          text-decoration: none;
          padding: 0.25rem 0.5rem;
        }

        .nav-links a.active {
          border-bottom: 2px solid var(--richblue);
        }

        .shop-link {
          font-weight: 600;
          border: 1px solid var(--richblue);
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
        }

        /* MOBILE */
        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          font-size: 1.6rem;
          cursor: pointer;
          color: var(--richblue);
        }

        @media (max-width: 768px) {
          .mobile-menu-button {
            display: block;
          }

          .nav-links {
            display: ${isMobileMenuOpen ? 'flex' : 'none'};
            flex-direction: column;
            position: absolute;
            top: 100%;
            right: 1rem;
            background: var(--palegray);
            border: 1px solid var(--richblue);
            border-radius: 0.75rem;
            padding: 0.75rem;
            width: 220px;
            gap: 0.75rem;
          }
        }
        `}
      </style>

      <header className="header">
        <div className="header-container">
          <button className="logo-button" onClick={() => { navigate('/'); closeMenu(); }}>
            <img src={logo} alt="Stekora Tech logo" />
            <div>
              <div className="brand-name">Stekora Tech</div>
              <div className="brand-tagline">
                where ideas become digital solutions
              </div>
            </div>
          </button>

          {/* ☰ / ✕ toggle */}
          <button
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <nav className="nav-links">
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/services" onClick={closeMenu}>Services</NavLink>
            <NavLink to="/study" onClick={closeMenu}>Courses</NavLink>
            <NavLink to="/jobs" onClick={closeMenu}>Jobs</NavLink>
            <NavLink to="/about" onClick={closeMenu}>About</NavLink>

            {/* ✅ CONTACT ADDED */}
            <NavLink to="/contact" onClick={closeMenu}>
              Contact
            </NavLink>

            <NavLink
              to="/shop"
              onClick={closeMenu}
              className={({ isActive }) =>
                `shop-link ${isActive ? 'active' : ''}`
              }
            >
              Shop
            </NavLink>

            {!isLoggedIn ? (
              <NavLink
                to="/login"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `shop-link ${isActive ? 'active' : ''}`
                }
              >
                Login
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="shop-link"
                style={{
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
