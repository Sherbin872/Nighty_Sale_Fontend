// src/components/layout/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-layout-background">
        <div className="auth-layout-overlay">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;