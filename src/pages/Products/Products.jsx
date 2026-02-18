// src/pages/Products/Products.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import Listings from '../../components/product/Listings';
import './Products.css';

const Products = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const keyword = searchParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let data;
      
      if (category) {
        data = await productApi.getProductsByCategory(category);
      } else {
        data = await productApi.getProducts(keyword);
      }
      
      setProducts(data.products);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, keyword]);

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1>
            {category ? `${category} Nightwear` : 'All Products'}
            {keyword && `: "${keyword}"`}
          </h1>
          {category && (
            <p className="page-subtitle">
              Explore our exclusive {category.toLowerCase()} collection
            </p>
          )}
        </div>
        
        <Listings
          products={products}
          loading={loading}
          error={error}
          hasMore={false}
          gridColumns={4}
          showFilters={true}
          emptyMessage={
            category 
              ? `No ${category.toLowerCase()} products found`
              : keyword
              ? `No products found for "${keyword}"`
              : "No products available"
          }
        />
      </div>
    </div>
  );
};

export default Products;