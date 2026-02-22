import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUserRole } from '../../api/userApi'; 
import './admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!search) {
      setFilteredUsers(users);
      return;
    }
    const lowerSearch = search.toLowerCase();
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(lowerSearch) || 
      user.email?.toLowerCase().includes(lowerSearch) ||
      user._id?.toLowerCase().includes(lowerSearch)
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) {
      try {
        await deleteUser(id);
        setUsers(users.filter(user => user._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  // FIX: Updated to use 'role' instead of 'isAdmin'
  const handleRoleToggle = async (id, currentRole) => {
    const isCurrentlyAdmin = currentRole === 'admin';
    const newRole = isCurrentlyAdmin ? 'user' : 'admin';

    if (window.confirm(`Change this user's role to ${isCurrentlyAdmin ? 'Customer' : 'Admin'}?`)) {
      try {
        await updateUserRole(id, { role: newRole });
        fetchUsers(); // Refresh the list
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update user role');
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading && users.length === 0) {
    return (
      <div className="ns-users-wrapper ns-users-center">
        <div className="ns-users-spinner"></div>
        <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="ns-users-wrapper">
      <div className="ns-users-header-row">
        <div className="ns-users-header-text">
          <h2 className="ns-users-title">User Management</h2>
          <p className="ns-users-subtitle">Showing {filteredUsers.length} registered users</p>
        </div>
        
        <div className="ns-users-actions">
          <div className="ns-users-search-box">
            <svg className="ns-users-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by Name, Email, or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ns-users-search-input"
            />
          </div>
        </div>
      </div>

      {error && <div className="ns-users-error-alert">{error}</div>}

      <div className="ns-users-content-card">
        {filteredUsers.length === 0 ? (
          <div className="ns-users-empty-state">
            <div className="ns-users-empty-icon">👥</div>
            <h3>No users found</h3>
            <p>No users match your current search criteria.</p>
          </div>
        ) : (
          <div className="ns-users-table-wrapper">
            <table className="ns-users-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  // FIX: Check the role string
                  const isUserAdmin = user.role === 'admin';
                  // SAFE ID: Uses slice(-6) so it never breaks no matter the ID length
                  const safeId = user._id ? user._id.slice(-6).toUpperCase() : 'N/A';

                  return (
                    <tr key={user._id}>
                      <td>
                        <div className="ns-users-profile-cell">
                          <div className={`ns-users-avatar ${isUserAdmin ? 'avatar-admin' : 'avatar-user'}`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="ns-users-name">{user.name}</div>
                            <div className="ns-users-id">ID: #{safeId}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <div className="ns-users-email">{user.email}</div>
                      </td>
                      
                      <td>
                        <span className={`ns-users-badge ${isUserAdmin ? 'badge-admin' : 'badge-customer'}`}>
                          {isUserAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      
                      <td>
                        <div className="ns-users-date">{formatDate(user.createdAt)}</div>
                      </td>
                      
                      <td>
                        <div className="ns-users-action-buttons">
                          <button 
                            className="ns-users-btn-icon btn-edit"
                            onClick={() => handleRoleToggle(user._id, user.role)}
                            title="Toggle Admin/Customer Role"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <polyline points="17 11 19 13 23 9"></polyline>
                            </svg>
                          </button>
                          <button 
                            className="ns-users-btn-icon btn-delete"
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            title="Delete User"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;