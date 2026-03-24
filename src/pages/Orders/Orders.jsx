import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../../api/orderApi';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError('Unable to fetch your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Calculate order stats
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const pendingOrders = orders.filter(order => !order.isPaid).length;

  // Helper function to get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      'Pending': 'status-pending',
      'Processing': 'status-processing',
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-pending'
    };
    return statusMap[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-card">
          <h3>{error}</h3>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="empty-state">
          <div className="empty-state-icon">🛍️</div>
          <h3>No orders yet</h3>
          <p>Looks like you haven't placed any orders. Start shopping to see your orders here!</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        {/* <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{totalOrders}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">₹{totalSpent}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingOrders}</span>
          </div>
        </div> */}
      </div>

      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            {/* Card Header */}
            <div className="order-card-header">
              <div>
                <div className="order-id">#{order._id.slice(-8).toUpperCase()}</div>
                <div className="order-date">
                  <span>📅</span>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <span className={`order-status-badge ${getStatusClass(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="order-card-body">
              {/* Order Items Preview (show first 2 items) */}
              <div className="order-items-preview">
                {order.orderItems.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="preview-item">
                    <div className="preview-item-image">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50x50?text=Product';
                        }}
                      />
                    </div>
                    <div className="preview-item-details">
                      <div className="preview-item-name">{item.name}</div>
                      <div className="preview-item-meta">
                        Qty: {item.qty} | Size: {item.size}
                      </div>
                    </div>
                    <div className="preview-item-price">₹{item.price}</div>
                  </div>
                ))}
                {order.orderItems.length > 2 && (
                  <div className="more-items-badge">
                    +{order.orderItems.length - 2} more items
                  </div>
                )}
              </div>

              {/* Mini Summary Card with --surface background */}
              <div className="order-summary-mini">
                <div className="summary-item">
                  <span className="summary-label">Payment</span>
                  <span className={`order-status-badge ${order.isPaid ? 'status-paid' : 'status-pending'}`}>
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total</span>
                  <span className="summary-value highlight">₹{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="order-card-footer">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/')}
              >
                Shop More
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/order-success/${order._id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;