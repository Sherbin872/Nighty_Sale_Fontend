import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi from '../../api/orderApi';

const OrderSuccess = () => {
  const { id } = useParams(); // completedOrderId
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h3>Loading order details...</h3>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-danger">{error}</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0">
        <div className="card-body text-center">
          <h2 className="text-success mb-3">Payment Successful</h2>
          <p className="mb-1">Thank you for your purchase!</p>
          <p className="text-muted">Order ID: <strong>{order._id}</strong></p>

          <hr />

          <h5 className="mb-3">Order Summary</h5>

          {order.orderItems.map((item, index) => (
            <div key={index} className="d-flex align-items-center mb-3">
              <img
                src={item.image}
                alt={item.name}
                style={{ width: 60, height: 60, objectFit: 'cover' }}
                className="rounded"
              />
              <div className="ms-3 text-start">
                <div><strong>{item.name}</strong></div>
                <div className="text-muted">
                  Qty: {item.qty} | Size: {item.size}
                </div>
                <div>₹ {item.price}</div>
              </div>
            </div>
          ))}

          <hr />

          <div className="text-start">
            <p><strong>Shipping Address</strong></p>
            <p className="mb-1">
              {order.shippingAddress.address}, {order.shippingAddress.city}
            </p>
            <p className="mb-1">
              {order.shippingAddress.country} - {order.shippingAddress.postalCode}
            </p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>

          <hr />

          <div className="text-start">
            <p><strong>Payment Status:</strong> {order.isPaid ? 'Paid' : 'Pending'}</p>
            <p><strong>Order Status:</strong> {order.orderStatus}</p>
            <p><strong>Total Paid:</strong> ₹ {order.totalPrice}</p>
          </div>

          <div className="mt-4">
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>

            <button
              className="btn btn-primary"
              onClick={() => navigate('/my-orders')}
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
