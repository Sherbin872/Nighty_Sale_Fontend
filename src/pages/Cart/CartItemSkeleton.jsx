import React from 'react';
import './CartItemSkeleton.css';

const CartItemSkeleton = () => {
  return (
    <div className="cart-item-skeleton">
      <div className="skeleton-image"></div>
      
      <div className="skeleton-content">
        <div className="skeleton-header">
          <div className="skeleton-texts">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
            <div className="skeleton-tags">
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag"></div>
            </div>
          </div>
          
          <div className="skeleton-price">
            <div className="skeleton-price-main"></div>
            <div className="skeleton-price-sub"></div>
          </div>
        </div>
        
        <div className="skeleton-controls">
          <div className="skeleton-buttons">
            <div className="skeleton-button"></div>
            <div className="skeleton-input"></div>
            <div className="skeleton-button"></div>
          </div>
          
          <div className="skeleton-actions">
            <div className="skeleton-action"></div>
            <div className="skeleton-action"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemSkeleton;