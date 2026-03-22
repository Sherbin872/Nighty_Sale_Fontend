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
  const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async (pageNum = 1) => {
  try {
    setLoading(true);
    let data;

    if (category) {
      data = await productApi.getProductsByCategory(category, pageNum);
    } else {
      data = await productApi.getProducts(keyword, pageNum);
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

useEffect(() => {
  setPage(1);
  fetchProducts(1);
}, [category, keyword]);

const handleLoadMore = () => {
  const nextPage = page + 1;
  setPage(nextPage);
  fetchProducts(nextPage);
};


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
  hasMore={hasMore}         
  onLoadMore={handleLoadMore}
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