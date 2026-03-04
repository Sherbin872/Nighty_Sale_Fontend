// src/components/layout/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AdminLayout.css';

const AdminLayout = () => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileView && isSidebarOpen) {
        const sidebar = document.querySelector('.admin-layout__sidebar');
        const toggle = document.querySelector('.admin-layout__mobile-toggle');
        
        if (sidebar && !sidebar.contains(event.target) && 
            toggle && !toggle.contains(event.target)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileView, isSidebarOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobileView]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Menu Toggle */}
      <button 
        className="admin-layout__mobile-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      <div 
        className={` ${isSidebarOpen ? 'admin-layout__overlay--visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Admin Sidebar */}
      <aside className={`admin-layout__sidebar ${isSidebarOpen ? 'admin-layout__sidebar--open' : ''}`}>
        <div className="admin-layout__logo-container">
          <h2 className="admin-layout__logo">Nighty Sale</h2>
          <span className="admin-layout__badge">Admin Panel</span>
        </div>
        
        <nav className="admin-layout__nav">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => 
              `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
            }
            onClick={() => isMobileView && setIsSidebarOpen(false)}
          >
            <span className="admin-layout__nav-icon">📊</span>
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => 
              `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
            }
            onClick={() => isMobileView && setIsSidebarOpen(false)}
          >
            <span className="admin-layout__nav-icon">👚</span>
            Products
          </NavLink>
          
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => 
              `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
            }
            onClick={() => isMobileView && setIsSidebarOpen(false)}
          >
            <span className="admin-layout__nav-icon">📦</span>
            Orders
          </NavLink>
          
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => 
              `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
            }
            onClick={() => isMobileView && setIsSidebarOpen(false)}
          >
            <span className="admin-layout__nav-icon">👥</span>
            Users
          </NavLink>
          
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
            }
            onClick={() => isMobileView && setIsSidebarOpen(false)}
          >
            <span className="admin-layout__nav-icon">🏠</span>
            Back to Store
          </NavLink>
        </nav>
        
        <div className="admin-layout__footer">
          <button onClick={logout} className="admin-layout__logout-btn">
            <span className="admin-layout__logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-layout__main">
        <header className="admin-layout__header">
          <div className="admin-layout__header-content">
            <h1 className="admin-layout__header-title">Admin Dashboard</h1>
            <div className="admin-layout__header-actions">
              <span className="admin-layout__welcome-text">Welcome back, Admin!</span>
            </div>
          </div>
        </header>
        
        <div className="admin-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;