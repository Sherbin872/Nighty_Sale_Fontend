// src/components/common/Footer/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="home-footer">
        <div className="footer-columns">
          <div className="footer-column">
            <h4 className="footer-title">Atelier</h4>
            <a href="#" className="footer-link">Heritage</a>
            <a href="#" className="footer-link">Sustainability</a>
            <a href="#" className="footer-link">Press</a>
          </div>
          <div className="footer-column">
            <h4 className="footer-title">Concierge</h4>
            <a href="#" className="footer-link">Orders</a>
            <a href="#" className="footer-link">Care Guide</a>
            <a href="#" className="footer-link">Shipping</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-brand">
            <h3 className="brand-name">Manavaatti</h3>
            <span className="brand-tagline">Timeless Comfort</span>
          </div>
          <div className="social-links">
            <a href="#" className="social-link">📸</a>
            <a href="#" className="social-link">🎯</a>
          </div>
        </div>
        
        <p className="footer-copyright">© 2026 Manavaatti. Theme #A3D48F.</p>
      </footer>
  );
};

export default Footer;