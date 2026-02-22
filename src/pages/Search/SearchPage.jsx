// src/pages/Search/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from "../../api/productApi";
import Listings from '../../components/product/Listings';
import './SearchPage.css'; // You can simplify your CSS now

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const navigate = useNavigate();

  // The Search Function
  const executeSearch = async (searchTerm, pageNum = 1) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const data = await productApi.getProducts(searchTerm, pageNum);
      
      if (pageNum === 1) {
        setSearchResults(data.products || []);
      } else {
        setSearchResults(prev => [...prev, ...(data.products || [])]);
      }
      
      setHasMore(data.page < data.pages);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when the user stops typing (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        executeSearch(query, 1);
      } else {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 500); // Waits 500ms after they stop typing to search

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle manual submit (pressing Enter)
  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch(query, 1);
  };

  const handleLoadMore = () => {
    executeSearch(query, page + 1);
  };

  return (
    <div className="search-page-simple">
      {/* 1. Simple Search Bar Header */}
      <div className="search-header-simple" style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', gap: '15px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}
        >
          ←
        </button>
        
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }}>
          <input
            type="text"
            placeholder="Search by name, category, size (e.g., XL), or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{ 
              width: '100%', 
              padding: '12px 20px', 
              fontSize: '16px', 
              borderRadius: '8px',
              border: '1px solid #ccc'
            }}
          />
        </form>
      </div>

      {/* 2. Direct Results Grid */}
      <div className="search-results-container" style={{ padding: '20px' }}>
        
        {!hasSearched && !loading && (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
            <h2>What are you looking for?</h2>
            <p>Type above to instantly search our inventory.</p>
          </div>
        )}

        {hasSearched && (
          <>
            <h3 style={{ marginBottom: '20px' }}>
              Results for "{query}"
            </h3>
            <Listings
              products={searchResults}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              gridColumns={4}
              showFilters={true}
              emptyMessage={`No matching products found for "${query}"`}
            />
          </>
        )}
        
      </div>
    </div>
  );
};

export default SearchPage;