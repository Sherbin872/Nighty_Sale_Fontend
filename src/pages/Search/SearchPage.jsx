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
          <div style={{ 
            textAlign: 'center', 
            marginTop: '60px', 
            padding: '40px 20px',
            backgroundColor: '#f9fafb',
            borderRadius: '16px',
            maxWidth: '600px',
            margin: '60px auto 0'
          }}>
            {/* Decorative Icon */}
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#b116165e', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#550000'
            }}>
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <h2 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '10px', fontWeight: '600' }}>
              What are you looking for?
            </h2>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '30px' }}>
              Type above to instantly search our inventory, or try one of these popular categories:
            </p>

            {/* Quick Search Pills */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Cotton', 'Satin', 'XL', 'Floral'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    executeSearch(term, 1);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '20px',
                    color: '#374151',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#550000';
                    e.target.style.color = '#550000';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.color = '#374151';
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
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