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
  const { user } = useSelector((state) => state.auth); // NEW: Pull the logged-in user's details
  console.log('Logged-in user:', user); // Debugging line to check user details
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

    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity, 
      0
    );

    // ==========================================
    // NEW: DYNAMIC SHIPPING CALCULATION
    // ==========================================
    let shipping = 0;
    
    // Check if total quantity is less than 3 (if 3 or more, shipping is free based on your previous logic)
    if (totalQuantity < 3) {
      // Safely check user's state. Make it lowercase and remove spaces for accurate comparison.
      const userState = user?.address?.state?.toLowerCase().replace(/\s/g, '') || '';
      
      if (userState === 'tamilnadu') {
        shipping = 50; // In-state shipping
      } else {
        shipping = 100; // Out-of-state shipping
      }
    }
    // ==========================================
    
    const tax = 0;
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
  }, [cartItems, promoApplied, user]); // Added user to dependencies

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
    
    if (updateTimeouts.current[key]) {
      clearTimeout(updateTimeouts.current[key]);
    }
    
    updateTimeouts.current[key] = setTimeout(() => {
      setIsUpdating(prev => ({ ...prev, [key]: true }));
      
      dispatch(updateQuantity({ 
        productId, 
        size, 
        quantity 
      }));
      
      setTimeout(() => {
        setIsUpdating(prev => ({ ...prev, [key]: false }));
      }, 300);
    }, 500);
  }, [dispatch]);

  // Handle quantity change
  const handleQuantityChange = useCallback((productId, size, newQuantity) => {
    const key = `${productId}-${size}`;
    
    if (newQuantity < 1) newQuantity = 1;
    
    const cartItem = cartItems.find(
      item => item.productId === productId && item.size === size
    );
    
    const maxStock = cartItem.maxQuantity !== undefined ? cartItem.maxQuantity : cartItem.countInStock;
    
    if (cartItem && newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in this size`);
      newQuantity = maxStock;
    }
    
    setLocalQuantities(prev => ({
      ...prev,
      [key]: newQuantity
    }));
    
    debouncedUpdate(productId, size, newQuantity);
  }, [cartItems, debouncedUpdate]);

  // Handle remove item
  const handleRemoveItem = useCallback((productId, size) => {
    dispatch(removeFromCart({ productId, size }));
    toast.success('Item removed from cart');
  }, [dispatch]);

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  }, [cartItems, navigate]);

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <p className="cart-subtitle">
            {cartTotals.itemCount} {cartTotals.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="cart-grid">
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