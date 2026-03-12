import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  removeFromCart,
  updateQuantity,
  clearCart
} from '../../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Cart.css';

// Components
import CartItem from './CartItem';
import CartSummary from './CartSummary';

// Empty cart component
const EmptyCart = () => {
  const navigate = useNavigate();
  
  return (
    <div className="empty-cart">
      <div className="empty-cart-content">
        <div className="empty-cart-icon">
          <svg 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
        </div>
        <h2 className="empty-cart-title">Your cart is empty</h2>
        <p className="empty-cart-message">
          Looks like you haven't added any items to your cart yet.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="continue-shopping-btn"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const cartItems = useSelector((state) => state.cart.items);
  const [localQuantities, setLocalQuantities] = useState({});
  const [isUpdating, setIsUpdating] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const updateTimeouts = useRef({});

  // Initialize local quantities from cart
  useEffect(() => {
    if (cartItems.length > 0) {
      const initialQuantities = {};
      cartItems.forEach(item => {
        const key = `${item.productId}-${item.size}`;
        initialQuantities[key] = item.quantity;
      });
      setLocalQuantities(initialQuantities);
    }
  }, [cartItems]);

  // Cart calculations
 const cartTotals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // NEW: Calculate the total physical quantity of items in the cart
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity, 
      0
    );

    // Free shipping over $50, else $5.99
    // const shipping = subtotal > 50 ? 0 : 0;
    const shipping = totalQuantity >= 3 ? 0 : 50;
    
    // Calculate tax (2% of subtotal based on your example)
    const tax = 0;
    // const tax = subtotal * 0.02;
    
    // Apply promo discount (10% off)
    const discount = promoApplied ? subtotal * 0.1 : 0;
    
    const total = subtotal + shipping + tax - discount;
    
    return { 
      subtotal, 
      shipping, 
      tax, 
      discount,
      total,
      itemCount: totalQuantity
    };
  }, [cartItems, promoApplied]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Debounced quantity update
  const debouncedUpdate = useCallback((productId, size, quantity) => {
    const key = `${productId}-${size}`;
    
    // Clear existing timeout
    if (updateTimeouts.current[key]) {
      clearTimeout(updateTimeouts.current[key]);
    }
    
    // Set new timeout
    updateTimeouts.current[key] = setTimeout(() => {
      setIsUpdating(prev => ({ ...prev, [key]: true }));
      
      dispatch(updateQuantity({ 
        productId, 
        size, 
        quantity 
      }));
      
      // Clear updating state after a delay
      setTimeout(() => {
        setIsUpdating(prev => ({ ...prev, [key]: false }));
      }, 300);
    }, 500);
  }, [dispatch]);

  // Handle quantity change
// Handle quantity change
  const handleQuantityChange = useCallback((productId, size, newQuantity) => {
    const key = `${productId}-${size}`;
    
    // Validate quantity
    if (newQuantity < 1) newQuantity = 1;
    
    // Find cart item to check stock
    const cartItem = cartItems.find(
      item => item.productId === productId && item.size === size
    );
    
    // FIX: Use maxQuantity (per-size stock) instead of countInStock (total stock)
    const maxStock = cartItem.maxQuantity !== undefined ? cartItem.maxQuantity : cartItem.countInStock;
    
    if (cartItem && newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in this size`);
      newQuantity = maxStock;
    }
    
    // Optimistic local update
    setLocalQuantities(prev => ({
      ...prev,
      [key]: newQuantity
    }));
    
    // Debounced Redux update
    debouncedUpdate(productId, size, newQuantity);
  }, [cartItems, debouncedUpdate]);

  // Handle remove item
  const handleRemoveItem = useCallback((productId, size) => {
    dispatch(removeFromCart({ productId, size }));
    toast.success('Item removed from cart');
  }, [dispatch]);

  // Handle promo code
  const handleApplyPromo = () => {
    if (promoCode.trim() === '') {
      toast.error('Please enter a promo code');
      return;
    }
    
    // For demo, accept any code
    setPromoApplied(true);
    toast.success('Promo code applied!');
    setPromoCode('');
  };

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Navigate to checkout
    navigate('/checkout');
  }, [cartItems, navigate]);

  // Show empty cart
  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
       {/* Header */}
        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">
            {cartTotals.itemCount} {cartTotals.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="cart-grid">
          {/* Cart Items */}
          <div className="cart-items-column">
            <div className="cart-items-container">
              <AnimatePresence>
                {cartItems.map((item, index) => {
                  const key = `${item.productId}-${item.size}`;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`cart-item-wrapper ${isUpdating[key] ? 'updating' : ''}`}
                    >
                      <CartItem
                        item={item}
                        localQuantity={localQuantities[key] || item.quantity}
                        maxStock={item.maxQuantity !== undefined ? item.maxQuantity : item.countInStock}
                        onQuantityChange={(newQty) =>
                          handleQuantityChange(item.productId, item.size, newQty)
                        }
                        onRemove={() =>
                          handleRemoveItem(item.productId, item.size)
                        }
                        isUpdating={isUpdating[key]}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Promo Code Section */}
            {/* <div className="promo-section">
              <div className="promo-input-group">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="promo-input"
                  disabled={promoApplied}
                />
                <button
                  onClick={handleApplyPromo}
                  className="promo-btn"
                  disabled={promoApplied}
                >
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {promoApplied && (
                <div className="promo-success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                      stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Promo code applied! 10% discount</span>
                </div>
              )}
            </div> */}

            {/* Continue Shopping */}
            <div className="continue-shopping">
              <button
                onClick={() => navigate('/products')}
                className="continue-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-summary-column">
            <CartSummary
              subtotal={cartTotals.subtotal}
              shipping={cartTotals.shipping}
              tax={cartTotals.tax}
              discount={cartTotals.discount}
              total={cartTotals.total}
              itemCount={cartTotals.itemCount}
              onCheckout={handleCheckout}
              promoApplied={promoApplied}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;