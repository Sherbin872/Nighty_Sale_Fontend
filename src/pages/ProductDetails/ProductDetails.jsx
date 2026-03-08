// src/pages/ProductDetails/ProductDetails.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { productApi } from "../../api/productApi";
import { addToCart } from "../../redux/slices/cartSlice";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Loader from "../../components/common/Loader";
import Alert from "../../components/common/Alert/Alert";
import ProductCard from "../../components/product/ProductCard";
// import Listings from '../../components/product/Listings';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
import "./ProductDetails.css";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const splideRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [splideInstance, setSplideInstance] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  // Get cart items for stock validation
  const cartItems = useSelector((state) => state.cart.items);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await productApi.getProductById(id);
        setProduct(data);

        // Fetch related products by category
        if (data.category) {
          const relatedData = await productApi.getProductsByCategory(
            data.category,
          );
          // Filter out current product and limit to 4
          const filtered = relatedData.products
            .filter((p) => p._id !== id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Reset selection when product changes
  useEffect(() => {
    if (product) {
      // Set default size if available
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      setQuantity(1);
      setSelectedImageIndex(0);
    }
  }, [product]);

  // Sync Splide with thumbnail selection
  useEffect(() => {
    if (splideInstance && splideInstance.go) {
      splideInstance.go(selectedImageIndex);
    }
  }, [selectedImageIndex, splideInstance]);

  // Get all images (main + additional)
  const getAllImages = () => {
    if (!product) return [];
    return [product.image, ...(product.additionalImages || [])].filter(
      (img) => img?.original,
    );
  };

  // Get available stock for selected size
  const getAvailableStock = useCallback(() => {
    if (!product) return 0;

    // In a real app, you might have per-size inventory
    // For now, using overall stock
    return product.countInStock;
  }, [product]);

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const availableStock = getAvailableStock();
    const newQuantity = quantity + change;

    if (newQuantity < 1) return;
    if (newQuantity > availableStock) {
      setQuantity(availableStock);
      return;
    }

    setQuantity(newQuantity);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedSize) {
      Alert("Please select a size");
      return;
    }

    if (product.countInStock === 0) {
      Alert("This product is out of stock");
      return;
    }

    try {
      setAddingToCart(true);

      const cartItem = {
        productId: product._id,
        name: product.name,
        image: product.image.thumbnail,
        price: product.price,
        countInStock: product.countInStock,
        size: selectedSize,
        quantity: quantity,
        maxQuantity: getAvailableStock(),
      };

      dispatch(addToCart(cartItem));

      setSuccessMessage(`Added ${quantity} × ${product.name} to cart!`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!selectedSize) {
      Alert("Please select a size");
      return;
    }

    // Add to cart first
    const cartItem = {
      productId: product._id,
      name: product.name,
      image: product.image.thumbnail,
      price: product.price,
      countInStock: product.countInStock,
      size: selectedSize,
      quantity: quantity,
      maxQuantity: getAvailableStock(),
    };

    dispatch(addToCart(cartItem));

    // Navigate to checkout
    navigate("/cart");
  };

  // Handle image gallery navigation
  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
    splideRef.current?.splide?.go(index);
  };

  // Handle splide mount
  const handleSplideMount = (splide) => {
    setSplideInstance(splide);
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <Loader />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-error">
        <div className="error-content">
          <h2>Product Not Found</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-error">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  const images = getAllImages();
  const availableStock = getAvailableStock();

  return (
    <div className="product-details-page">
      {/* Success Message */}
      {successMessage && (
        <div className="cart-success-message">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage("")}>×</button>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <div className="container">
          <a href="/">Home</a>
          <span className="sspan"> › </span>
          <a href="/products">Products</a>
          <span className="sspan"> › </span>
          <a href={`/products?category=${product.category}`}>
            {product.category}
          </a>
          <span className="sspan"> › </span>
          <span className="current">{product.name}</span>
        </div>
      </nav>

      <div className="container">
        <div className="product-details-content">
          {/* Left Column - Images */}
          <div className="product-images">
            {/* Main Image Carousel */}
            <div className="main-image-container">
              <Splide
                ref={splideRef}
                options={{
                  type: "fade",
                  rewind: true,
                  pagination: false,
                  arrows: images.length > 1,
                  speed: 400,
                }}
              >
                {images.map((image, index) => (
                  <SplideSlide key={image.public_id}>
                    <div className="image-slide">
                      <Zoom>
  <img
    src={image.original}
    alt={`${product.name} - View ${index + 1}`}
    className="main-image"
  />
</Zoom>
                    </div>
                  </SplideSlide>
                ))}
              </Splide>

              {/* Product Badges */}
              <div className="product-badges">
                {product.countInStock === 0 && (
                  <span className="badge out-of-stock">Out of Stock</span>
                )}
                {product.category && (
                  <span className="badge category">{product.category}</span>
                )}
                {product.rating >= 4.5 && (
                  <span className="badge bestseller">🔥 Bestseller</span>
                )}
              </div>
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={image.public_id}
                    className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                    onClick={() => handleThumbnailClick(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <LazyLoadImage
                      src={image.thumbnail}
                      alt={`Thumbnail ${index + 1}`}
                      effect="blur"
                      placeholderSrc={image.placeholder}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Share & Wishlist */}
            {/* <div className="product-actions-secondary">
              <button className="action-btn wishlist">
                ♡ Add to Wishlist
              </button>
              <button className="action-btn share">
                ↗ Share
              </button>
            </div> */}
          </div>

          {/* Right Column - Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-meta">
                <span className="product-brand">By {product.brand}</span>
                <span className="product-sku">
                  SKU: {product._id.slice(-8)}
                </span>
              </div>

              {/* Rating */}
              {/* <div className="product-rating">
                <div className="stars">
                  {"★".repeat(Math.floor(product.rating))}
                  {"☆".repeat(5 - Math.floor(product.rating))}
                  <span className="rating-value">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="reviews-count">
                    ({product.numReviews} reviews)
                  </span>
                </div>
                <a href="#reviews" className="write-review">
                  Write a review
                </a>
              </div> */}
            </div>

            {/* Price */}
            <div className="product-price-section">
              <div className="current-price">
                <span className="price">{formatPrice(product.price)}</span>
                <span className="price-note">(Inclusive of all taxes)</span>
              </div>

              {/* Original price if on sale */}
              {/* <div className="original-price">
                <span className="strike">₹3,999</span>
                <span className="discount">25% OFF</span>
              </div> */}
            </div>

            {/* Description */}
            <div className="product-description">
              <h3>Description</h3>

              <div
                className={`description-content ${
                  showFullDescription ? "expanded" : "collapsed"
                }`}
              >
                {product.description.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {product.description.length > 200 && (
                <button
                  className="see-more-btn"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? "See Less" : "See More"}
                </button>
              )}
            </div>

            {/* Key Features */}
            {/* <div className="product-features">
              <h3>Key Features</h3>
              <ul>
                <li>Premium {product.category.toLowerCase()} fabric</li>
                <li>Comfortable and breathable</li>
                <li>Easy to wash and maintain</li>
                <li>Perfect for a good night's sleep</li>
                {product.category === 'Maternity' && (
                  <li>Specially designed for expecting mothers</li>
                )}
              </ul>
            </div> */}

            {/* Size Selection */}
            <div className="product-size">
              {/* <div className="size-header">
                <h3>Select Size</h3>
                <a href="/size-guide" className="size-guide">Size Guide</a>
              </div> */}

              <div className="size-options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? "selected" : ""} ${
                      availableStock === 0 ? "out-of-stock" : ""
                    }`}
                    onClick={() => handleSizeSelect(size)}
                    disabled={availableStock === 0}
                    title={
                      availableStock === 0
                        ? "Out of stock"
                        : `Select size ${size}`
                    }
                  >
                    {size}
                    {selectedSize === size && (
                      <span className="checkmark">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {availableStock > 0 && selectedSize && (
                <div className="size-info">
                  <span className="selected-size">Size: {selectedSize}</span>
                  <span className="stock-info">
                    {availableStock > 10
                      ? "In Stock"
                      : availableStock > 3
                        ? `Only ${availableStock} left`
                        : `🔥 Hurry! Only ${availableStock} left`}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="product-actions">
              <div className="quantity-selector">
                <button
                  className="quantity-btn minus"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || availableStock === 0}
                >
                  −
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  min="1"
                  max={availableStock}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (value >= 1 && value <= availableStock) {
                      setQuantity(value);
                    }
                  }}
                  disabled={availableStock === 0}
                />
                <button
                  className="quantity-btn plus"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= availableStock || availableStock === 0}
                >
                  +
                </button>
                <div className="quantity-info">Max: {availableStock} units</div>
              </div>

              <div className="action-buttons">
                <button
                  className={`btn-cart ${availableStock === 0 ? "disabled" : ""}`}
                  onClick={handleAddToCart}
                  disabled={availableStock === 0 || addingToCart}
                >
                  {addingToCart ? (
                    <>
                      <span className="spinner"></span>
                      Adding...
                    </>
                  ) : availableStock === 0 ? (
                    "Out of Stock"
                  ) : (
                    "Add to Cart"
                  )}
                </button>

                <button
                  className="btn-buy"
                  onClick={handleBuyNow}
                  disabled={availableStock === 0}
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="delivery-info">
              {/* <div className="delivery-item"> */}
              {/* <span className="icon">🚚</span>
                <div>
                  <strong>Free Delivery</strong>
                  <p>Order above ₹999 | 3-7 business days</p>
                </div>
              </div> */}
              {/* <div className="delivery-item">
                <span className="icon">🔄</span>
                <div>
                  <strong>Easy Returns</strong>
                  <p>15 days return policy</p>
                </div>
              </div> */}
              <div className="delivery-item">
                <span className="icon">🔒</span>
                <div>
                  <strong>Secure Payment</strong>
                  <p>100% secure payment</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {/* <div className="additional-info">
              <div className="info-section">
                <h4>Material & Care</h4>
                <p>
                  Made from premium {product.category.toLowerCase()} fabric. 
                  Machine wash cold, gentle cycle. Do not bleach. 
                  Tumble dry low or hang dry. Iron on low heat if needed.
                </p>
              </div>
              
              <div className="info-section">
                <h4>Shipping & Returns</h4>
                <p>
                  Free shipping on orders above ₹999. 
                  Returns accepted within 15 days of delivery. 
                  Items must be unused with original tags.
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <div className="section-header">
              <h2>You May Also Like</h2>
              <p>Similar products you might love</p>
            </div>

            <div className="related-grid">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {/* <div className="reviews-section" id="reviews">
          <div className="section-header">
            <h2>Customer Reviews</h2>
            <div className="review-summary">
              <div className="overall-rating">
                <span className="rating-number">{product.rating.toFixed(1)}</span>
                <div className="rating-stars">
                  {'★'.repeat(Math.floor(product.rating))}
                  {'☆'.repeat(5 - Math.floor(product.rating))}
                </div>
                <span className="total-reviews">
                  Based on {product.numReviews} reviews
                </span>
              </div>
              
              <button className="btn-write-review">
                Write a Review
              </button>
            </div>
          </div>
          
          
          <div className="reviews-placeholder">
            <p>Be the first to review this product!</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ProductDetails;
