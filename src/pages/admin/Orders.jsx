import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';

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
      const data = await getAllOrders();
      setOrders(data);
      setFilteredOrders(data);
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
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-orders">
      <h2>Admin Orders</h2>

      {/* Search & Sort */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by Order ID / User"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price">Total Price</option>
          <option value="status">Order Status</option>
        </select>
      </div>

      {/* Orders Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Delivered</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders
            .filter(order => !order.isDelivered)
            .map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>
                  {order.user?.name}
                  <br />
                  {order.user?.email}
                </td>
                <td>₹{order.totalPrice}</td>
                <td>{order.isPaid ? 'Yes' : 'No'}</td>
                <td>{order.isDelivered ? 'Yes' : 'No'}</td>
                <td>{order.orderStatus}</td>
                <td>
                  <select
                    value={order.orderStatus}
                    onChange={e =>
                      handleStatusChange(order._id, e.target.value)
                    }
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
  );
};

export default AdminOrders;
