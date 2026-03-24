import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import './OrderSuccess.css'; // Import the new CSS

const OrderSuccess = () => {
  const { id } = useParams(); // completedOrderId
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderApi.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError('Unable to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Calculate estimated delivery date (7-9 days from now)
  const getDeliveryDateRange = () => {
    const today = new Date();
    const startDate = new Date(today.setDate(today.getDate() + 7));
    const endDate = new Date(today.setDate(today.getDate() + 2));
    
    return {
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="error-state">
        <div className="error-card">
          <h3 className="text-danger">{error || 'Order not found'}</h3>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const deliveryDate = getDeliveryDateRange();

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h1>Order Placed!</h1>
          <p>Your elegant new pieces are being prepared for delivery.</p>
        </div>

        {/* <div className="order-info-grid">
          <div className="info-item">
            <span className="info-label">ORDER NUMBER</span>
            <span className="info-value">#{order._id?.slice(-8).toUpperCase()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">ARRIVAL DATE</span>
            <span className="info-value highlight">
              {deliveryDate.start} - {deliveryDate.end}
            </span>
          </div>
        </div> */}

        {/* Order Items */}
        {order.orderItems.map((item, index) => (
          <div key={index} className="product-item">
            <div className="pproduct-image">
              <img 
                src={item.image} 
                alt={item.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/70x70?text=Product';
                }}
              />
            </div>
            <div className="product-details">
              <div className="pproduct-name">{item.name}</div>
              <div className="product-meta text-muted">
                Qty: {item.qty} | Size: {item.size}
              </div>
              <div className="product-price">₹ {item.price}</div>
            </div>
          </div>
        ))}

        {/* Order Summary */}
        <div className="order-summary">
          <div className="summary-row">
            <span>Shipping</span>
            <span className="summary-value">FREE</span>
          </div>
          <div className="summary-row total">
            <span>Total Paid</span>
            <span className="summary-value">₹ {order.totalPrice}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/')}
          >
            Back to Shop
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/orders')}
          >
            My Orders
          </button>
        </div>

        {/* Need Assistance */}
        <div className="assistance-section">
          <div className="assistance-text">NEED ASSISTANCE WITH YOUR ORDER</div>
          <a href="/support" className="assistance-link">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;