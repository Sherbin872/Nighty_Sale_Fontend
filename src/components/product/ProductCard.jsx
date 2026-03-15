// src/components/product/ProductCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Get main image (thumbnail)
  const mainImage = product.image?.thumbnail || product.image;

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handle quick view
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement quick view modal here
    console.log("Quick view:", product._id);
  };

  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement add to cart logic here
    console.log("Add to cart:", product._id);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product._id}`} className="product-link">
        {/* Product Image */}
        <div className="product-image-container">
          {/* Main Image with Lazy Loading */}
          <LazyLoadImage
            src={mainImage}
            alt={product.name}
            effect="blur"
            threshold={100}
            className="product-image"
            wrapperClassName="lazy-image-wrapper"
          />

          {/* Image Badges */}
          <div className="product-badges">
            {product.countInStock === 0 && (
              <span className="badge out-of-stock">Out of Stock</span>
            )}
            {product.isNew && <span className="badge new">New</span>}
            {product.discount && (
              <span className="badge sale">{product.discount}% OFF</span>
            )}
          </div>

          {/* Quick Actions */}
          {/* <div className={`quick-actions ${isHovered ? "visible" : ""}`}>
            <button
              className="quick-action-btn quick-view"
              onClick={handleQuickView}
              title="Quick View"
            >
              👁️
            </button>
            <button
              className="quick-action-btn add-to-cart"
              onClick={handleAddToCart}
              title="Add to Cart"
              disabled={product.countInStock === 0}
            >
              {product.countInStock === 0 ? "🚫" : "🛒"}
            </button>
          </div> */}
        </div>

        {/* Product Info */}
        <div className="pproduct-info">
          <span className="pcproduct-name" title={product.name}>
            {product.name}
          </span>

          <span className="ccurrent-price">{formatPrice(product.price)}</span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
