// src/pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import Listings from '../../components/product/Listings';
import './Home.css';

const Home = () => {
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchProducts = async (pageNum = 1, category = '') => {
  try {
    setLoading(true);
    let data;

    if (category && category !== 'all') {
      data = await productApi.getProductsByCategory(category, pageNum);
      console.log("datas: ",data);
      
    } else {
      data = await productApi.getProducts('', pageNum);
    }

    if (pageNum === 1) {
      setProducts(data.products);
    } else {
      setProducts(prev => [...prev, ...data.products]);
    }

    setHasMore(data.page < data.pages);
    setError(null);
  } catch (err) {
    setError(err.message || 'Failed to load products');
  } finally {
    setLoading(false);
  }
};


  const fetchCategories = async () => {
    try {
      const data = await productApi.getProducts();
      const uniqueCategories = [...new Set(data.products.map(p => p.category))].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
  setPage(1);
  fetchProducts(1, activeCategory);
  console.log('Active category changed:', activeCategory);
}, [activeCategory]);

useEffect(() => {
  fetchCategories();
}, []);


  // useEffect(() => {
  //   fetchProducts(1, activeCategory);
  //   fetchCategories();
  // }, [activeCategory]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, activeCategory);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setPage(1);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay">
            <div className="hero-content">
              <span className="hero-badge">Exclusive Comfort</span>
              <h1 className="hero-title">Serene Evenings</h1>
              <p className="hero-subtitle">
                Rediscover relaxation with our premium sage-inspired lounge collection.
              </p>  
              <div className="hero-buttons">
                <button className="btn-primary">Shop Now</button>
                <button className="btn-secondary">Our Story</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {/* <div className="category-scroll">
        <div className="category-list">
          <button 
            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            All Sets
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div> */}

      {/* Editor's Choice */}
      <div className="editors-choice-section">
        <div className="section-header">
          <span className="section-title">Our Collections</span>
          {/* <a href="#" className="section-link">Explore All ↗</a> */}
         
        </div>

        {/* <div className="featured-products-grid">
          {loading && products.length === 0 ? (
            // Loading skeleton
            [...Array(4)].map((_, index) => (
              <div key={index} className="product-card-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))
          ) : (
            // Featured products (first 4)
            products.slice(0, 4).map(product => (
              <div key={product._id} className="featured-product-card">
                <div className="product-image-wrapper">
                  <img 
                    src={product.image.thumbnail} 
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                  />
                  <button className="wishlist-btn">
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                  {product.category === 'Silk' && (
                    <span className="product-badge bestseller">Bestseller</span>
                  )}
                  {product.category === 'Rayon' && (
                    <span className="product-badge new">New Arrival</span>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">
                    <span className="current-price">${product.price.toFixed(2)}</span>
                    {product.price < 50 && (
                      <span className="original-price">${(product.price * 1.25).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div> */}
          <Listings
          products={products} // Skip first 4 featured products
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          gridColumns={2}
          showFilters={false}
          emptyMessage="No products found in this category"
        />
      </div>

      {/* Value Propositions */}
      <div className="value-propositions">
        <div className="value-card">
          <span className="value-icon">🚚</span>
          <p className="value-title">Conscious Shipping</p>
        </div>
        <div className="value-divider"></div>
        <div className="value-card">
          <span className="value-icon">🌿</span>
          <p className="value-title">Pure Botanicals</p>
        </div>
        <div className="value-divider"></div>
        <div className="value-card">
          <span className="value-icon">✅</span>
          <p className="value-title">Premium Quality</p>
        </div>
      </div>

      {/* All Products Section */}
      {/* <div className="all-products-section">
        <div className="section-header">
          <h2 className="section-title">All Collections</h2>
        </div>
        
        <Listings
          products={products} // Skip first 4 featured products
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          gridColumns={2}
          showFilters={false}
          emptyMessage="No products found in this category"
        />
      </div> */}

      {/* Footer */}
      {/* <footer className="home-footer">
        <div className="footer-columns">
          <div className="footer-column">
            <h4 className="footer-title">Atelier</h4>
            <a href="#" className="footer-link">Heritage</a>
            <a href="#" className="footer-link">Sustainability</a>
            <a href="#" className="footer-link">Press</a>
          </div>
          <div className="footer-column">
            <h4 className="footer-title">Concierge</h4>
            <a href="#" className="footer-link">Orders</a>
            <a href="#" className="footer-link">Care Guide</a>
            <a href="#" className="footer-link">Shipping</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-brand">
            <h3 className="brand-name">Nighty Sale</h3>
            <span className="brand-tagline">Timeless Comfort</span>
          </div>
          <div className="social-links">
            <a href="#" className="social-link">📸</a>
            <a href="#" className="social-link">🎯</a>
          </div>
        </div>
        
        <p className="footer-copyright">© 2024 Nighty Sale. Theme #A3D48F.</p>
      </footer> */}
    </div>
  );
};

export default Home;