// src/pages/Checkout.js
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { checkoutService, orderUtils } from '../../api/orderAndPaymentApi';
import './Checkout.css';

// Step indicators
const CheckoutSteps = ({ currentStep }) => {
  const steps = ['SHIPPING', 'PAYMENT', 'CONFIRM'];
  
  return (
    <div className="checkout-steps">
      {steps.map((step, index) => (
        <div key={step} className="step-container">
          <div className={`step-circle ${index <= currentStep ? 'active' : ''}`}>
            {index + 1}
          </div>
          <span className={`step-label ${index === currentStep ? 'current' : ''}`}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`step-line ${index < currentStep ? 'active' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { items: cartItems, total: cartTotal } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: '',
    email: userInfo?.email || ''
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('ready');
  const [orderId, setOrderId] = useState(null);
  console.log('cartItems:', cartItems);

  // Calculate order summary using the service
  
  const orderSummary = useMemo(() => {
    return checkoutService.getOrderSummary(cartItems);
  }, [cartItems]);
  
  // Calculate totals for display
  const orderTotals = useMemo(() => {
  const itemsPrice = Number(orderSummary.subtotal) || 0;
  const taxPrice = Number(orderSummary.tax) || 0;
  const shippingPrice = Number(orderSummary.shipping) || 0;
  const totalPrice = Number(orderSummary.total) || 0;

  console.log('Order Totals:', { itemsPrice, taxPrice, shippingPrice, totalPrice });

  return { itemsPrice, taxPrice, shippingPrice, totalPrice };
}, [orderSummary]);









  
  // Load user data if logged in
  useEffect(() => {
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        email: userInfo.email,
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        address: userInfo.address || '',
        city: userInfo.city || '',
        postalCode: userInfo.postalCode || '',
        phone: userInfo.phone || ''
      }));
    }
  }, [userInfo]);
  
  // Validate shipping form using the service
  const validateShippingForm = () => {
    const shippingAddress = {
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,
      phone: formData.phone
    };
    
    const validation = orderUtils.validateShippingAddress(shippingAddress);
    
    if (!validation.isValid) {
      toast.error(validation.message);
      return false;
    }
    
    // Validate first and last name
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter your first and last name');
      return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle shipping submission
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    
    if (!validateShippingForm()) return;
    
    // Validate stock before proceeding
    const stockCheck = orderUtils.checkStockAvailability(cartItems);
    if (!stockCheck.available) {
      toast.error(`Sorry, the following items are out of stock: ${stockCheck.items.join(', ')}`);
      return;
    }
    
    // Proceed to payment step
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Prepare shipping address for API
  const prepareShippingAddress = () => ({
    address: formData.address,
    city: formData.city,
    postalCode: formData.postalCode,
    country: formData.country,
    phone: formData.phone
  });
  
  // Handle payment submission
  const handlePaymentSubmit = async () => {
    try {
      setIsLoading(true);
      setCheckoutStep('validating');
      
      // Prepare cart items - IMPORTANT: Ensure image is string, not object
      const preparedCartItems = cartItems.map(item => ({
        ...item,
        // Ensure image is a string (thumbnail URL)
        image: typeof item.image === 'object' ? item.image.thumbnail : item.image,
        // Make sure we have the correct field names
        product: item.product || item.productId,
        qty: item.qty || item.quantity,
        price: item.price
      }));
      
      // Start checkout process
      await checkoutService.processCheckout({
        cartItems: preparedCartItems,
        shippingAddress: prepareShippingAddress(),
        paymentMethod: 'Razorpay',
        userInfo: userInfo,
        onStepChange: (step) => {
          setCheckoutStep(step);
          console.log(`Checkout step: ${step}`);
          
          if (step === 'creating_order') {
            toast.info('Creating your order...');
          } else if (step === 'processing_payment') {
            toast.info('Initializing payment...');
          } else if (step === 'completed') {
            toast.success('Payment successful!');
          } else if (step === 'failed') {
            toast.error('Payment failed');
          }
        },
        onSuccess: (completedOrderId) => {
          setOrderId(completedOrderId);
          dispatch(clearCart());
          setIsLoading(false);
          navigate(`/order-success/${completedOrderId}`);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage);
          setIsLoading(false);
        },
      });
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Checkout failed');
      setIsLoading(false);
    }
  };
  
  // Go back to shipping step
  const handleBackToShipping = () => {
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // If cart is empty, redirect
  if (cartItems.length === 0 && currentStep === 0) {
    return (
      <div className="empty-cart-redirect">
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>Add items to your cart before checkout</p>
          <button 
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Header */}
        <header className="checkout-header">
          <h1 className="checkout-title">Checkout</h1>
          <CheckoutSteps currentStep={currentStep} />
          {checkoutStep !== 'ready' && checkoutStep !== 'failed' && (
            <div className="checkout-status">
              <div className="status-spinner"></div>
              <span className="status-text">
                {checkoutStep === 'validating' && 'Validating your information...'}
                {checkoutStep === 'creating_order' && 'Creating your order...'}
                {checkoutStep === 'processing_payment' && 'Opening payment gateway...'}
                {checkoutStep === 'completed' && 'Payment completed successfully!'}
              </span>
            </div>
          )}
        </header>
        
        <div className="checkout-content">
          {/* Left Column - Form */}
          <div className="checkout-form-column">
            {currentStep === 0 ? (
              // Shipping Step
              <form className="shipping-form" onSubmit={handleShippingSubmit}>
                <h2 className="form-section-title">SHIPPING ADDRESS</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">FIRST NAME *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">LAST NAME *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">STREET ADDRESS *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">CITY *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Mumbai"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">POSTAL CODE *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="400001"
                      required
                      minLength="6"
                      maxLength="6"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">COUNTRY *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">PHONE NUMBER *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="9876543210"
                      required
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit phone number"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">EMAIL *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled={!!userInfo?.email}
                  />
                  {userInfo?.email && (
                    <small className="form-note">Logged in as {userInfo.email}</small>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="btn-primary btn-block"
                  disabled={isLoading}
                >
                  Continue to Payment
                </button>
              </form>
            ) : (
              // Payment Step
              <div className="payment-step">
                <h2 className="form-section-title">PAYMENT METHOD</h2>
                
                <div className="payment-method-info">
                  <div className="payment-method selected">
                    <div className="payment-method-header">
                      <div className="payment-method-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="#FF6B8B"/>
                        </svg>
                      </div>
                      <div className="payment-method-details">
                        <h3 className="payment-method-title">Razorpay</h3>
                        <p className="payment-method-desc">Credit/Debit Cards, UPI, Net Banking</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="secure-payment-info">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" fill="#4CAF50"/>
                      <path d="M12 12.5C13.6569 12.5 15 11.1569 15 9.5C15 7.84315 13.6569 6.5 12 6.5C10.3431 6.5 9 7.84315 9 9.5C9 11.1569 10.3431 12.5 12 12.5Z" fill="white"/>
                      <path d="M12 15.5C9.79 15.5 8 16.29 8 17.5V18.5H16V17.5C16 16.29 14.21 15.5 12 15.5Z" fill="white"/>
                    </svg>
                    <span>SECURE SSL ENCRYPTED PAYMENT</span>
                  </div>
                </div>
                
                <div className="shipping-review">
                  <h3 className="review-title">Shipping Address</h3>
                  <div className="review-content">
                    <p><strong>{formData.firstName} {formData.lastName}</strong></p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.postalCode}</p>
                    <p>{formData.country}</p>
                    <p>Phone: {formData.phone}</p>
                    <p>Email: {formData.email}</p>
                  </div>
                  <button
                    onClick={handleBackToShipping}
                    className="btn-edit"
                    disabled={isLoading}
                  >
                    Edit Address
                  </button>
                </div>
                
                <div className="payment-actions">
                  <button
                    onClick={handleBackToShipping}
                    className="btn-secondary"
                    disabled={isLoading}
                  >
                    Back to Shipping
                  </button>
                  
                  <button
                    onClick={handlePaymentSubmit}
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : `Pay ₹${orderTotals.totalPrice.toFixed(2)}`}
                  </button>
                </div>
                
                <div className="payment-disclaimer">
                  <p>• You will be redirected to Razorpay's secure payment gateway</p>
                  <p>• Your payment is protected by 256-bit SSL encryption</p>
                  <p>• No sensitive payment data is stored on our servers</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="checkout-summary-column">
            <div className="order-summary">
              <h2 className="summary-title">ORDER SUMMARY</h2>
              
              {/* Cart Items */}
              <div className="cart-items-summary">
                {cartItems.map((item, index) => {
                  const imageUrl = typeof item.image === 'object' 
                    ? item.image.thumbnail 
                    : item.image;
                  
                  return (
                    <div key={`${item.product || item.productId}-${item.size}-${index}`} className="summary-cart-item">
                      <div className="summary-item-image">
                        <img src={imageUrl} alt={item.name} />
                      </div>
                      
                      <div className="summary-item-details">
                        <h4 className="summary-item-name">{item.name}</h4>
                        <div className="summary-item-variants">
                          <span className="summary-item-size">SIZE: {item.size}</span>
                          <span className="summary-item-qty">QTY: {item.qty || item.quantity}</span>
                        </div>
                        <p className="summary-item-price">₹{(item.price * (item.qty || item.quantity)).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Order Totals */}
              <div className="order-totals">
                <div className="total-row">
                  <span className="total-label">Subtotal</span>
                  <span className="total-value">₹{orderTotals.itemsPrice.toFixed(2)}</span>
                </div>
                
                <div className="total-row">
                  <span className="total-label">Shipping</span>
                  <span className="total-value">
                    {orderTotals.shippingPrice === 0 ? (
                      <span className="free-shipping">FREE</span>
                    ) : (
                      `₹${orderTotals.shippingPrice.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                {/* <div className="total-row">
                  <span className="total-label">Tax (18% GST)</span>
                  <span className="total-value">₹{orderTotals.taxPrice.toFixed(2)}</span>
                </div> */}
                
                {orderTotals.itemsPrice < 1000 && orderTotals.shippingPrice > 0 && (
                  <div className="free-shipping-notice">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#4CAF50" strokeWidth="2"/>
                    </svg>
                    <span>Add ₹{(1000 - orderTotals.itemsPrice).toFixed(2)} more for FREE shipping!</span>
                  </div>
                )}
                
                <div className="total-row grand-total">
                  <span className="total-label">TOTAL AMOUNT</span>
                  <span className="total-value">₹{orderTotals.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Stock Check */}
              {(() => {
                const stockCheck = orderUtils.checkStockAvailability(cartItems);
                if (!stockCheck.available) {
                  return (
                    <div className="stock-warning">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L4.332 16.5c-.77.833.192 2.5 1.732 2.5z" 
                          stroke="#f44336" strokeWidth="2"/>
                      </svg>
                      <span>Some items are out of stock. Please update quantities.</span>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Security Badge */}
              <div className="security-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                    stroke="#4CAF50" strokeWidth="2"/>
                </svg>
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;