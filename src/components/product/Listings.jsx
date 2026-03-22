import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ProductCard from "./ProductCard";
import Loader from "../common/Loader";
import FilterModal from "./filters/FilterModal";
import "./Listings.css";

const Listings = ({
  products = [],
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore = null,
  emptyMessage = "No products found",
  gridColumns = 4,
  showFilters = true,
  title = "Products",
  onFilterChange = null,
}) => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sortBy: "newest",
  });
  const [tempFilters, setTempFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    sortBy: "newest",
  });

  const observerRef = useRef();
  const initialRender = useRef(true);

  // Intersection Observer for infinite scroll
  const lastProductRef = useCallback(
    (node) => {
      if (loading || !hasMore || !onLoadMore) return;
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            onLoadMore();
          }
        },
        { threshold: 0.1, rootMargin: "100px" }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, onLoadMore]
  );

  // Get unique categories
  const categories = useMemo(() => {
    if (!products?.length) return [];
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  // Apply filters function
  const applyFilters = useCallback(() => {
    if (!products?.length) {
      setFilteredProducts([]);
      setActiveFilters({});
      return;
    }

    let result = [...products];
    const active = {};

    // Filter by category
    if (filters.category) {
      result = result.filter(
        (product) => product.category === filters.category
      );
      active.category = filters.category;
    }

    // Filter by price range
    if (filters.minPrice && !isNaN(parseFloat(filters.minPrice))) {
      const min = parseFloat(filters.minPrice);
      result = result.filter((product) => product.price >= min);
      active.minPrice = min;
    }

    if (filters.maxPrice && !isNaN(parseFloat(filters.maxPrice))) {
      const max = parseFloat(filters.maxPrice);
      result = result.filter((product) => product.price <= max);
      active.maxPrice = max;
    }

    // Filter by stock
    if (filters.inStock) {
      result = result.filter((product) => (product.countInStock || 0) > 0);
      active.inStock = true;
    }

    // Sort products
    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        break;
      default:
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
    }

    setFilteredProducts(result);
    setActiveFilters(active);

    if (onFilterChange) {
      onFilterChange({ filters, resultCount: result.length });
    }
  }, [products, filters, onFilterChange]);

  // Initialize filtered products
  useEffect(() => {
    if (products?.length > 0 && initialRender.current) {
      setFilteredProducts(products);
      initialRender.current = false;
    }
  }, [products]);

  // Apply filters when filters change
  useEffect(() => {
    if (!initialRender.current) {
      applyFilters();
    }
  }, [filters, applyFilters]);

  // Open filter modal
  const openFilterModal = () => {
    setTempFilters({ ...filters });
    setIsFilterModalOpen(true);
  };

  // Apply filters from modal
  const applyFilterChanges = () => {
    setFilters({ ...tempFilters });
    setIsFilterModalOpen(false);
  };

  // Handle filter change in modal
  const handleTempFilterChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Remove single filter
  const removeFilter = (key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (key === "minPrice" || key === "maxPrice") {
        newFilters[key] = "";
      } else if (key === "inStock") {
        newFilters[key] = false;
      } else if (key === "category") {
        newFilters[key] = "";
      } else if (key === "sortBy") {
        newFilters[key] = "newest";
      }
      return newFilters;
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      sortBy: "newest",
    });
    setFilteredProducts(products || []);
    setActiveFilters({});
    setIsFilterModalOpen(false);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  // Grid column classes
  const gridClass = useMemo(() => {
    const classes = {
      1: "grid-1",
      2: "grid-2",
      3: "grid-3",
      4: "grid-4",
      5: "grid-5",
      6: "grid-6",
    };
    return classes[gridColumns] || "grid-4";
  }, [gridColumns]);

  // Loading state
  if (loading && (!products?.length)) {
    return (
      <div className="listings-loading">
        <Loader size="large" />
        <p>Loading products...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="listings-error">
        <div className="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-btn"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!filteredProducts?.length) {
    return (
      <div className="listings-empty">
        <div className="empty-icon">📦</div>
        <h3>{emptyMessage}</h3>
        {products?.length > 0 && (
          <>
            <p>Try adjusting your filters</p>
            <button onClick={resetFilters} className="reset-filters-btn">
              Clear All Filters
            </button>
          </>
        )}
        {!products?.length && (
          <p>Check back soon for new arrivals!</p>
        )}
      </div>
    );
  }

  return (
    <div className="listings-container">
      {/* Header Section */}


 {showFilters && (
           
      <div className="listings-header">
        {/* <div className="listings-title-section">
          <h1 className="listings-title">{title}</h1>
          <span className="product-count">
            ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
          </span>
        </div> */}

        {/* Active Filter Chips */}
        {getActiveFilterCount() > 0 && (
          <div className="active-filters">
            {activeFilters.category && (
              <div className="filter-chip">
                <span>Category: {activeFilters.category}</span>
                <button onClick={() => removeFilter("category")}>×</button>
              </div>
            )}
            {activeFilters.minPrice && (
              <div className="filter-chip">
                <span>Min: ${activeFilters.minPrice}</span>
                <button onClick={() => removeFilter("minPrice")}>×</button>
              </div>
            )}
            {activeFilters.maxPrice && (
              <div className="filter-chip">
                <span>Max: ${activeFilters.maxPrice}</span>
                <button onClick={() => removeFilter("maxPrice")}>×</button>
              </div>
            )}
            {activeFilters.inStock && (
              <div className="filter-chip">
                <span>In Stock Only</span>
                <button onClick={() => removeFilter("inStock")}>×</button>
              </div>
            )}
            <button onClick={resetFilters} className="clear-all-btn">
              Clear All
            </button>
          </div>
        )}

        {/* Sort and Filter Bar */}
        <div className="action-bar">



             <div className="sort-wrapper">
            <label htmlFor="sort-select" className="sort-label">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="sort-select"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              {/* <option value="rating">Highest Rated</option> */}
            </select>
          </div>
         

        

          {/* Modern Filter Button */}
          {showFilters && (
            <button 
              className="filter-btn"
              onClick={openFilterModal}
            >
              <svg className="filter-icon" viewBox="0 0 24 24" width="20" height="20">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="6" r="2" fill="currentColor"/>
                <circle cx="8" cy="12" r="2" fill="currentColor"/>
                <circle cx="14" cy="18" r="2" fill="currentColor"/>
              </svg>
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="filter-badge">{getActiveFilterCount()}</span>
              )}
            </button>
          )}
        </div>
      </div>
          )}




      {/* Products Grid */}
      <div className={`products-grid ${gridClass}`}>
        {filteredProducts.map((product, index) => (
          <div
            key={product._id || `product-${index}`}
            ref={index === filteredProducts.length - 1 ? lastProductRef : null}
            className="product-grid-item"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="load-more-container">
          {loading ? (
           <div className="load">
<div className="lloader"></div>
</div>
          ) : (
            <button onClick={onLoadMore} className="load-more-btn">
              Load More Products
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {/* {loading && filteredProducts.length > 0 && (
        <div className="skeleton-grid">
          {[...Array(Math.min(4, gridColumns))].map((_, index) => (
            <div key={`skeleton-${index}`} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          ))}
        </div>

      )} */}

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={tempFilters}
        categories={categories}
        onFilterChange={handleTempFilterChange}
        onApply={applyFilterChanges}
        onReset={resetFilters}
      />
    </div>
  );
};

export default Listings;