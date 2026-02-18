// src/hooks/useAuth.js
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logoutUser, clearError, clearSuccess } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error, success, role } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      // Redirect admin to dashboard, regular users to home
      if (result.payload.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      // Default role is 'user' if not specified
      const userRole = result.payload.user?.role || 'user';
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const resetError = () => {
    dispatch(clearError());
  };

  const resetSuccess = () => {
    dispatch(clearSuccess());
  };

  useEffect(() => {
    // Auto-clear success message after 3 seconds
    if (success) {
      const timer = setTimeout(() => {
        resetSuccess();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return {
    // User data
    user,
    token,
    role,
    
    // State
    loading,
    error,
    success,
    
    // Actions
    login,
    register,
    logout,
    resetError,
    resetSuccess,
    
    // Authentication status
    isAuthenticated: !!token,
    
    // Role helpers
    isAdmin: role === 'admin',
    isUser: role === 'user' || (!role && token),
  };
};