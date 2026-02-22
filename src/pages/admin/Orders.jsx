import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';
import './admin.css'; // New dedicated CSS file

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, sort, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
      setFilteredOrders(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...orders];

    // Search
    if (search) {
      data = data.filter(order =>
        order._id.includes(search) ||
        order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    switch (sort) {
      case 'price':
        data.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'status':
        data.sort((a, b) => a.orderStatus.localeCompare(b.orderStatus));
        break;
      default:
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredOrders(data);
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      fetchOrders(); // Refresh to get latest data
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format Date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // We are currently filtering out delivered orders in the map below, 
  // so let's calculate exactly how many are visible.
  const visibleOrders = filteredOrders.filter(order => !order.isDelivered);

  if (loading && orders.length === 0) {
    return (
      <div className="ns-orders-wrapper ns-orders-center">
        <div className="ns-orders-spinner"></div>
        <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="ns-orders-wrapper">
      
      {/* Header Section */}
      <div className="ns-orders-header-row">
        <div className="ns-orders-header-text">
          <h2 className="ns-orders-title">Order Management</h2>
          <p className="ns-orders-subtitle">
            Showing {visibleOrders.length} active orders
          </p>
        </div>
        
        {/* Controls: Search & Sort */}
        <div className="ns-orders-actions">
          <div className="ns-orders-search-box">
            <svg className="ns-orders-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by ID, Name, Email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ns-orders-search-input"
            />
          </div>

          <select 
            value={sort} 
            onChange={e => setSort(e.target.value)}
            className="ns-orders-sort-select"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price">Sort by: Total Price</option>
            <option value="status">Sort by: Status</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="ns-orders-error-alert">{error}</div>
      )}

      {/* Main Content Card */}
      <div className="ns-orders-content-card">
        {visibleOrders.length === 0 ? (
          <div className="ns-orders-empty-state">
            <div className="ns-orders-empty-icon">📝</div>
            <h3>No active orders found</h3>
            <p>You have processed all your orders or the search didn't match anything.</p>
          </div>
        ) : (
          <div className="ns-orders-table-wrapper">
            <table className="ns-orders-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map(order => (
                  <tr key={order._id}>
                    
                    {/* Order Details */}
                    <td>
                      <div className="ns-orders-id">#{order._id.substring(18, 24).toUpperCase()}</div>
                      <div className="ns-orders-date">{formatDate(order.createdAt)}</div>
                    </td>
                    
                    {/* Customer Info */}
                    <td>
                      <div className="ns-orders-customer-name">{order.user?.name || 'Unknown User'}</div>
                      <div className="ns-orders-customer-email">{order.user?.email || 'N/A'}</div>
                    </td>
                    
                    {/* Total Amount */}
                    <td className="ns-orders-amount">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    
                    {/* Payment Badge */}
                    <td>
                      <span className={`ns-orders-badge ${order.isPaid ? 'badge-success' : 'badge-error'}`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    
                    {/* Status Badge */}
                    <td>
                      <span className={`ns-orders-badge badge-${order.orderStatus.replace(/\s+/g, '-').toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    
                    {/* Action Dropdown */}
                    <td>
                      <select
                        className="ns-orders-action-select"
                        value={order.orderStatus}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;