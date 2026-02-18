// src/pages/admin/Dashboard.jsx
import React from 'react';
import './admin.css';

const AdminDashboard = () => {
  return (
    <div className="admin-page">
      <h2>Dashboard Overview</h2>
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">1,234</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">$45,678</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">89</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">567</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;