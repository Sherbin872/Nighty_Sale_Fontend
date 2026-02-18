import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import './CartItem.css';

const CartItem = memo(({ item, localQuantity, onQuantityChange, onRemove, isUpdating }) => {
  const { name, price, image, size, productId } = item;
  
  // Extract color from name (following your UI pattern)
  const extractColor = () => {
    const colorMatch = name.match(/•\s*([^•]+)$/);
    return colorMatch ? colorMatch[1].trim() : '';
  };

  const productColor = extractColor();
  const productName = name.replace(/•\s*[^•]+$/, '').trim();

  const handleIncrement = () => {
    onQuantityChange(localQuantity + 1);
  };
  
  const handleDecrement = () => {
    if (localQuantity > 1) {
      onQuantityChange(localQuantity - 1);
    }
  };
  
  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    onQuantityChange(value);
  };

  return (
    <div className={`cart-item ${isUpdating ? 'updating' : ''}`}>
      {/* Product Image */}
      <div className="cart-item-image">
        <img
          src={image}
          alt={productName}
          className="product-image"
          loading="lazy"
        />
      </div>
      
      {/* Product Details */}
      <div className="cart-item-details">
        <div className="product-info">
          <h3 className="product-name">{productName}</h3>
          <div className="product-variants">
            <span className="product-color">{productColor}</span>
            <span className="divider">•</span>
            <span className="product-size">{size}</span>
          </div>
        </div>
        
        {/* Quantity Controls */}
        <div className="quantity-section">
          <div className="quantity-controls">
            <button
              onClick={handleDecrement}
              disabled={localQuantity <= 1 || isUpdating}
              className="quantity-btn decrement"
              aria-label="Decrease quantity"
            >
              <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
                <path d="M1 1H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            
            <span className="quantity-display">{localQuantity}</span>
            
            <button
              onClick={handleIncrement}
              disabled={isUpdating}
              className="quantity-btn increment"
              aria-label="Increase quantity"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          
          {isUpdating && (
            <div className="updating-indicator">
              <svg className="spinner" width="16" height="16" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                  fill="currentColor" opacity="0.75"/>
              </svg>
            </div>
          )}
        </div>
        
        {/* Price and Remove */}
        <div className="price-section">
          <div className="price-info">
            <p className="item-price">${(price * localQuantity).toFixed(2)}</p>
            <button
              onClick={onRemove}
              disabled={isUpdating}
              className="remove-btn"
              aria-label="Remove item"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';
export default CartItem;