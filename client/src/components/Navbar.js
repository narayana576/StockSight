import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logo from '../assets/stocksight-logo.png';
import './Navbar.css';
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <div className="navbar-logo-text">
          <Link to="/" className="logo-link">
            <img src={logo} alt="StockSight Logo" className="logo-img" />
            <span className="logo-text">StockSight</span>
          </Link>
        </div>

        <div className="navbar-menu">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Contact
          </NavLink>

          <div className="dropdown">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              More ▼
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/faq" className="dropdown-item">FAQ</Link>
                <Link to="/blog" className="dropdown-item">Blog</Link>
                <Link to="/support" className="dropdown-item">Support</Link>
              </div>
            )}
          </div>

          {!isAuthenticated ? (
            <Link to="/login" className="auth-button">
              Login
            </Link>
          ) : (
            <button onClick={handleLogout} className="auth-button logout">
              Logout
            </button>
          )}
        </div>

        <div className="hamburger" onClick={toggleMobileMenu}>
          <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => isActive ? "mobile-link active" : "mobile-link"}
          >
            Contact
          </NavLink>
          <button onClick={toggleDropdown} className="mobile-link">
            More ▼
          </button>
          {isDropdownOpen && (
            <div className="mobile-submenu">
              <Link to="/faq" className="mobile-link">FAQ</Link>
              <Link to="/blog" className="mobile-link">Blog</Link>
              <Link to="/support" className="mobile-link">Support</Link>
            </div>
          )}
          {!isAuthenticated ? (
            <Link to="/login" className="mobile-auth-button">
              Login
            </Link>
          ) : (
            <button onClick={handleLogout} className="mobile-auth-button logout">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;