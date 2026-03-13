import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../../api/orderApi";
import { jsPDF } from "jspdf"; // NEW: Import jsPDF
import "./AdminOrderDetail.css";

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data);
      setStatus(data.orderStatus);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, status);
      await fetchOrderDetails();
      alert("Order status updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // NEW: Generate 4x6 PDF Shipping Label
  // ==========================================
  const generatePDF = () => {
    if (!order) return;

    // Create a 4x6 inch PDF (Standard Thermal Label Size)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [4, 6],
    });

    // Set standard professional font family
    doc.setFont("helvetica");

    // Optional: Draw a clean outer border around the whole label
    doc.setLineWidth(0.02);
    doc.rect(0.15, 0.15, 3.7, 5.7);

    // 1. Company Name Header (CENTERED)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    // Using x=2 (center of 4 inches) and align: 'center'
    doc.text("MANAVAATTI", 2, 0.5, { align: "center" });

    // Draw a line separator under header
    doc.setLineWidth(0.01);
    doc.line(0.15, 0.65, 3.85, 0.65);

    // Order ID (Left) & Date (Right)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      `ORDER #: ${order._id.substring(18, 24).toUpperCase()}`,
      0.25,
      0.85,
    );

    doc.setFont("helvetica", "normal");
    // Right align the date at x=3.75
    doc.text(
      `DATE: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
      3.75,
      0.85,
      { align: "right" },
    );

    // Draw a line separator under Order Details
    doc.line(0.15, 1.0, 3.85, 1.0);

    // 2. TO ADDRESS (Shipping Details)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SHIP TO:", 0.25, 1.25);

    // Customer Name (Large & uppercase for easy reading by delivery agents)
    doc.setFontSize(14);
    const customerName = (
      order.shippingAddress?.fullName ||
      order.user?.name ||
      "N/A"
    ).toUpperCase();
    doc.text(customerName, 0.25, 1.5);

    // Address Body
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // Split address to handle long lines
    const addressLines = doc.splitTextToSize(
      order.shippingAddress?.address || "",
      3.5,
    );
    let currentY = 1.7;

    doc.text(addressLines, 0.25, currentY);
    currentY += addressLines.length * 0.2; // Adjust Y based on address length

    doc.text(
      `${order.shippingAddress?.city || ""}, ${order.shippingAddress?.postalCode || ""}`,
      0.25,
      currentY,
    );
    currentY += 0.2;
    doc.text(`${order.shippingAddress?.state || ""} `, 0.15, currentY);
    // currentY += 0.1;
    doc.text(`${order.shippingAddress?.country || ""}`, 0.25, currentY);
    currentY += 0.3; // Extra space before phone number

    // Phone Number (Highly visible)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Ph: ${order.shippingAddress?.phone || order.shippingAddress?.mobileNumber || "N/A"}`,
      0.25,
      currentY,
    );

    // Draw a line separator before Return Address
    currentY += 0.25;
    doc.line(0.15, currentY, 3.85, currentY);

    // 3. FROM ADDRESS (Return Details)
    currentY += 0.2;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("RETURN TO:", 0.25, currentY);

    doc.setFont("helvetica", "normal");
    currentY += 0.15;
    doc.text("Manavaatti", 0.25, currentY);
    currentY += 0.15;
    doc.text("123 Your Street Name, Building No", 0.25, currentY); // UPDATE THIS
    currentY += 0.15;
    doc.text("Your City, State, PIN-123456", 0.25, currentY); // UPDATE THIS
    currentY += 0.15;
    doc.text("Ph: +91 9876543210", 0.25, currentY); // UPDATE THIS

    // Save the PDF
    doc.save(
      `Manavaatti_Label_${order._id.substring(18, 24).toUpperCase()}.pdf`,
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  if (loading) {
    return (
      <div className="ns-order-detail-wrapper ns-center">
        <div className="ns-spinner"></div>
        <p>Loading Order #{id.substring(18, 24).toUpperCase()}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="ns-order-detail-wrapper ns-center">
        <div className="ns-error-box">{error || "Order not found"}</div>
        <button
          className="ns-btn-back"
          onClick={() => navigate("/admin/orders")}
        >
          ← Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="ns-order-detail-wrapper">
      {/* Header */}
      <div className="ns-order-detail-header">
        <div>
          <button
            className="ns-btn-back-link"
            onClick={() => navigate("/admin/orders")}
          >
            ← Back to Orders
          </button>
          <h2 className="ns-title">
            Order #{order._id.substring(18, 24).toUpperCase()}
          </h2>
          <p className="ns-subtitle">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="ns-header-badges">
          {/* NEW: Download PDF Button */}
          <button onClick={generatePDF} className="ns-btn-download">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Label
          </button>

          <span
            className={`ns-badge ${order.isPaid ? "badge-success" : "badge-error"}`}
          >
            {order.isPaid ? "Paid" : "Unpaid"}
          </span>
          <span
            className={`ns-badge badge-${order.orderStatus.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {order.orderStatus}
          </span>
        </div>
      </div>

      <div className="ns-order-grid">
        {/* LEFT COLUMN: Customer & Shipping */}
        <div className="ns-order-left">
          {/* Customer Card */}
          <div className="ns-card">
            <h3 className="ns-card-title">Customer Information</h3>
            <div className="ns-info-row">
              <span className="ns-info-label">Name:</span>
              <span className="ns-info-value">
                {order.user?.name || order.shippingAddress?.fullName || "N/A"}
              </span>
            </div>
            <div className="ns-info-row">
              <span className="ns-info-label">Email:</span>
              <span className="ns-info-value">
                {order.user?.email || "N/A"}
              </span>
            </div>
            <div className="ns-info-row">
              <span className="ns-info-label">Mobile Number:</span>
              <span className="ns-info-value ns-highlight">
                {order.shippingAddress?.phone ||
                  order.shippingAddress?.mobileNumber ||
                  "No phone provided"}
              </span>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="ns-card">
            <h3 className="ns-card-title">Shipping Address</h3>
            <div className="ns-address-box">
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          {/* Update Status Card */}
          <div className="ns-card ns-action-card">
            <h3 className="ns-card-title">Update Order Status</h3>
            <div className="ns-status-update-box">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="ns-status-select"
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleUpdateStatus}
                disabled={updating || status === order.orderStatus}
                className="ns-btn-update"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Items & Summary */}
        <div className="ns-order-right">
          {/* Order Items */}
          <div className="ns-card">
            <h3 className="ns-card-title">
              Order Items ({order.orderItems?.length || 0})
            </h3>
            <div className="ns-order-items-list">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="ns-order-item">
                  <div className="ns-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="ns-no-image">No Img</div>
                    )}
                  </div>
                  <div className="ns-item-details">
                    <h4>{item.name}</h4>
                    <p>Size: {item.size || "N/A"}</p>
                  </div>
                  <div className="ns-item-price-calc">
                    {item.qty} x {formatCurrency(item.price)}
                  </div>
                  <div className="ns-item-total">
                    {formatCurrency(item.qty * item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="ns-card">
            <h3 className="ns-card-title">Payment Summary</h3>

            <div className="ns-summary-row">
              <span>Payment Method:</span>
              <span style={{ textTransform: "capitalize" }}>
                {order.paymentMethod || "Razorpay"}
              </span>
            </div>

            <hr className="ns-divider" />

            <div className="ns-summary-row">
              <span>Items Subtotal:</span>
              <span>{formatCurrency(order.itemsPrice)}</span>
            </div>
            <div className="ns-summary-row">
              <span>Shipping:</span>
              <span>{formatCurrency(order.shippingPrice)}</span>
            </div>
            <div className="ns-summary-row">
              <span>Tax:</span>
              <span>{formatCurrency(order.taxPrice)}</span>
            </div>

            <hr className="ns-divider" />

            <div className="ns-summary-row ns-total-row">
              <span>Total Amount:</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
