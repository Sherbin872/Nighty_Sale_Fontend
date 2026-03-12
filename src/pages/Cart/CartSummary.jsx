import React, { memo } from 'react';
import './CartSummary.css';

const CartSummary = memo(({ 
  subtotal, 
  shipping, 
  tax, 
  discount,
  total, 
  itemCount,
  onCheckout,
  promoApplied 
}) => {
  return (
    <div className="cart-summary">
      <h2 className="summary-title">ORDER SUMMARY</h2>
      
      <div className="summary-details">
        <div className="summary-row">
          <span className="row-label">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="row-value">₹{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="summary-row">
          <span className="row-label">Shipping</span>
          <span className={`row-value ${shipping === 0 ? 'free' : ''}`}>
            {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
          </span>
        </div>
        
        {promoApplied && discount > 0 && (
          <div className="summary-row discount-row">
            <span className="row-label">Discount (10%)</span>
            <span className="row-value discount">-₹{discount.toFixed(2)}</span>
          </div>
        )}
        
        {/* <div className="summary-row">
          <span className="row-label">Tax</span>
          <span className="row-value">₹{tax.toFixed(2)}</span>
        </div> */}
        
        <div className="total-row">
          <span className="total-label">TOTAL AMOUNT</span>
          <span className="total-value">₹{total.toFixed(2)}</span>
        </div>
      </div>
      
      <button
        onClick={onCheckout}
        className="checkout-btn"
      >
        PROCEED TO CHECKOUT
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className="payment-info">
        <p className="payment-note">Secure checkout • Free returns</p>
        <div className="payment-icons">
          <span className="payment-icon">VISA</span>
          <span className="payment-icon">MC</span>
          <span className="payment-icon">AMEX</span>
          <span className="payment-icon">PP</span>
        </div>
      </div>
    </div>
  );
});

CartSummary.displayName = 'CartSummary';
export default CartSummary;