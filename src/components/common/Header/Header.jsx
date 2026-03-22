// src/components/common/Header/Header.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux"; // 1. ADDED THIS IMPORT
import {
  FiSearch,
  FiShoppingCart,
  FiMoon,
  FiSun,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import "./Header.css";

const Header = () => {
  const { user, logout, isAuthenticated, role, isAdmin } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 2. FETCH CART ITEMS FROM REDUX
  const { items: cartItems = [] } = useSelector((state) => state.cart);

  // 3. CALCULATE REAL CART COUNT (Total physical items)
  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || item.qty || 1),
    0
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-content">
        <div className="logo">
          <Link className="lin" to="/" onClick={closeMobileMenu}>
            <img
              className="mainLogo"
              height={40}
              src="https://res.cloudinary.com/diclfmeg4/image/upload/v1773988736/manavaatti-logo_evv92c.png"
              alt=""
            />
            <img
              className="angelLogo"
              height={40}
              src="https://res.cloudinary.com/diclfmeg4/image/upload/v1774197135/IMG-20260322-WA0009-removebg-preview_zvipsu.png"
              alt=""
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav desktop-nav">
          <Link to="/" className="nav-link" onClick={closeMobileMenu}>
            Home
          </Link>
          <Link to="/products" className="nav-link" onClick={closeMobileMenu}>
            Products
          </Link>
          <Link to="/cart" className="nav-link" onClick={closeMobileMenu}>
            Cart
          </Link>
          {isAuthenticated && role !== "admin" && (
            <Link to="/orders" className="nav-link" onClick={closeMobileMenu}>
              Orders
            </Link>
          )}
          {role === "admin" && (
            <Link
              to="/admin/dashboard"
              className="nav-link admin-link"
              onClick={closeMobileMenu}
            >
              🛠️ Admin
            </Link>
          )}
        </nav>

        {/* Desktop Header Actions */}
        <div className="header-actions desktop-actions">
          {isAuthenticated ? (
            <div className="user-menu-icons">
              {/* Search */}
              <Link to="/search" onClick={closeMobileMenu}>
                <div className="icon-btn" aria-label="Search">
                  <FiSearch className="ic" size={22} />
                </div>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="cart-count">{cartCount}</span>
                )}
              </Link>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link">
                Login
              </Link>
              <Link to="/register" className="auth-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle">
          {/* Cart Icon for Mobile */}
          <Link to="/cart" className="icon-btn mobile-cart" aria-label="Cart">
            <FiShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>

          {/* Hamburger Icon */}
          <button
            className="hamburger-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          {/* Mobile Navigation Links */}
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
              Home
            </Link>
            <Link
              to="/products"
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              Products
            </Link>
            <Link
              to="/cart"
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              Cart
              {cartCount > 0 && (
                <span className="mobile-cart-count">{cartCount}</span>
              )}
            </Link>
            {isAuthenticated && role !== "admin" && (
              <Link
                to="/orders"
                className="mobile-nav-link"
                onClick={closeMobileMenu}
              >
                Orders
              </Link>
            )}
            {role === "admin" && (
              <Link
                to="/admin/dashboard"
                className="mobile-nav-link admin-link"
                onClick={closeMobileMenu}
              >
                🛠️ Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Mobile Auth Section */}
          <div className="mobile-auth-section">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <span className="mobile-user-greeting">
                    Hi, {user?.name || "User"}
                  </span>
                  <span className="mobile-user-email">{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="mobile-logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link
                  to="/login"
                  className="mobile-auth-link"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="mobile-auth-btn"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Search */}
          <div className="mobile-search">
            <Link to="/search" onClick={closeMobileMenu}>
              <div className="mobile-search-box">
                <FiSearch size={20} className="mobile-search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="mobile-search-input"
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;