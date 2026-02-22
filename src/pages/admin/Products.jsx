import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, deleteProduct, setPage } from '../../redux/slices/adminProductSlice';
import ProductTable from '../../components/admin/ProductTable';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert/Alert';
import Loader from '../../components/common/Loader';
import './admin.css'; // Renamed for namespace clarity

const AdminProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const {
    products,
    loading,
    error,
    page,
    pages,
    total
  } = useSelector((state) => state.adminProducts);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchProducts({ keyword, pageNumber: page }));
  }, [dispatch, page]);

  // Debounced search
  const handleSearch = (searchTerm) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    setSearchTimeout(
      setTimeout(() => {
        setKeyword(searchTerm);
        dispatch(setPage(1));
        dispatch(fetchProducts({ keyword: searchTerm, pageNumber: 1 }));
      }, 500)
    );
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await dispatch(deleteProduct(id));
      // Refresh the list
      dispatch(fetchProducts({ keyword, pageNumber: page }));
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  const handleAddProduct = () => {
    navigate('/admin/products/add');
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    dispatch(fetchProducts({ keyword, pageNumber: newPage }));
  };

  return (
    <div className="ns-products-wrapper">
      
      {/* Header Section */}
      <div className="ns-products-header-row">
        <div className="ns-products-header-text">
          <h2 className="ns-products-title">Product Management</h2>
          <p className="ns-products-subtitle">
            {loading ? 'Loading inventory data...' : `Showing ${products.length} of ${total} products | Page ${page} of ${pages}`}
          </p>
        </div>
        
        <div className="ns-products-actions">
          <div className="ns-products-search-wrapper">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search products..."
              disabled={loading}
            />
          </div>
          <button 
            className="ns-products-btn-primary" 
            onClick={handleAddProduct}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="ns-products-alert-wrapper">
          <Alert type="error" message={error} />
        </div>
      )}

      {/* Main Content Area */}
      {loading && page === 1 ? (
        <div className="ns-products-loader-container">
          <Loader />
          <p>Loading your inventory...</p>
        </div>
      ) : (
        <div className="ns-products-content-card">
          {products.length === 0 ? (
            <div className="ns-products-empty-state">
              <div className="ns-products-empty-icon">📦</div>
              <h3>No products found</h3>
              <p>{keyword ? `We couldn't find anything matching "${keyword}".` : 'Your store is currently empty. Start by adding your first product.'}</p>
              {keyword && (
                <button 
                  className="ns-products-btn-secondary" 
                  onClick={() => {
                    setKeyword('');
                    dispatch(fetchProducts({ keyword: '', pageNumber: 1 }));
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Product Table Wrapper */}
              <div className="ns-products-table-wrapper">
                <ProductTable
                  products={products}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
              
              {/* Pagination Wrapper */}
              {pages > 1 && (
                <div className="ns-products-pagination-wrapper">
                  <Pagination
                    currentPage={page}
                    totalPages={pages}
                    onPageChange={handlePageChange}
                    disabled={loading}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;