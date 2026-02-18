// src/components/common/BottomNav/BottomNav.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import './BottomNav.css';

const BottomNav = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (isAdmin) return null; // Don't show bottom nav for admin users

  const navItems = [
    {
      path: '/',
      icon: 'home',
      label: 'Home',
      active: location.pathname === '/'
    },
    {
      path: '/products',
      icon: 'auto_awesome_motion',
      label: 'Boutique',
      active: location.pathname.includes('/products')
    },
    {
      path: '/wishlist',
      icon: 'favorite',
      label: 'Saved',
      active: location.pathname === '/wishlist'
    },
    {
      path: isAuthenticated ? '/profile' : '/login',
      icon: 'person_2',
      label: 'Profile',
      active: location.pathname === '/profile' || location.pathname === '/login'
    }
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `bottom-nav-item ${isActive ? 'active' : ''}`
            }
            aria-label={item.label}
          >
            <span className={`material-symbols-outlined ${item.active ? 'active' : ''}`}>
              {item.icon}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;