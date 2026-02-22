import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import './admin.css'; 

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Replace with your actual API call
        const data = await adminApi.getDashboardStats(); 
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="ns-dashboard-wrapper ns-dashboard-center">
        <div className="ns-dashboard-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ns-dashboard-wrapper ns-dashboard-center">
        <div className="ns-dashboard-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="ns-dashboard-wrapper">
      <div className="ns-dashboard-header">
        <h2 className="ns-dashboard-title">Dashboard Overview</h2>
        <p className="ns-dashboard-subtitle">Welcome back, here is what's happening today.</p>
      </div>

      <div className="ns-dashboard-grid">
        {/* Total Revenue Card */}
        <div className="ns-dashboard-card">
          <div className="ns-dashboard-card-header">
            <h3 className="ns-dashboard-card-title">Total Revenue</h3>
            <svg className="ns-dashboard-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <p className="ns-dashboard-card-value">{formatCurrency(stats.totalRevenue)}</p>
        </div>

        {/* Total Orders Card */}
        <div className="ns-dashboard-card">
          <div className="ns-dashboard-card-header">
            <h3 className="ns-dashboard-card-title">Total Orders</h3>
            <svg className="ns-dashboard-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <p className="ns-dashboard-card-value">{stats.totalOrders}</p>
        </div>

        {/* Total Products Card */}
        <div className="ns-dashboard-card">
          <div className="ns-dashboard-card-header">
            <h3 className="ns-dashboard-card-title">Total Products</h3>
            <svg className="ns-dashboard-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </div>
          <p className="ns-dashboard-card-value">{stats.totalProducts}</p>
        </div>

        {/* Total Users Card */}
        <div className="ns-dashboard-card">
          <div className="ns-dashboard-card-header">
            <h3 className="ns-dashboard-card-title">Total Users</h3>
            <svg className="ns-dashboard-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <p className="ns-dashboard-card-value">{stats.totalUsers}</p>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;