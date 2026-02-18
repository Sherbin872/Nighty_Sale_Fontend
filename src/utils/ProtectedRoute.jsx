// src/utils/protectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// const { isAuthenticated, isAdmin } = useAuth();

const ProtectedRoute = () => {
  const { token } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (!token) {
    // Redirect to login page with return url
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;