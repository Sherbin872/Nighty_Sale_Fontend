// src/components/layout/AdminLayout.jsx
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AdminLayout.css';

const AdminLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Nighty Sale</h2>
          <span className="admin-role">Admin Panel</span>
        </div>
        
        <nav className="admin-nav">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => 
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => 
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">👚</span>
            Products
          </NavLink>
          
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => 
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">📦</span>
            Orders
          </NavLink>
          
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => 
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">👥</span>
            Users
          </NavLink>
          
          <NavLink 
            to="/admin/categories" 
            className={({ isActive }) => 
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">🏷️</span>
            Categories
          </NavLink>
        </nav>
        
        <div className="admin-sidebar-footer">
          <NavLink to="/" className="admin-nav-link">
            <span className="nav-icon">🏠</span>
            Back to Store
          </NavLink>
          <button onClick={logout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-content">
            <h1>Admin Dashboard</h1>
            <div className="admin-header-actions">
              <span className="admin-welcome">Welcome back, Admin!</span>
            </div>
          </div>
        </header>
        
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;