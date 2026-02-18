// src/pages/Category/Category.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import Listings from '../../components/product/Listings';
// import './Category.css';

const Category = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getProductsByCategory(category);
        setProducts(data.products);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category]);

  return (
    <div className="category-page">
      <div className="category-header">
        <div className="container">
          <h1 className="category-title">
            {category} Nightwear
          </h1>
          <p className="category-description">
            Discover our premium collection of {category.toLowerCase()} nightwear
          </p>
        </div>
      </div>
      
      <div className="container">
        <Listings
          products={products}
          loading={loading}
          error={error}
          gridColumns={4}
          showFilters={false}
          emptyMessage={`No ${category.toLowerCase()} products found`}
        />
      </div>
    </div>
  );
};

export default Category;