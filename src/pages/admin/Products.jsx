// src/pages/admin/Products.jsx - Updated
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, deleteProduct, setPage } from '../../redux/slices/adminProductSlice';
import ProductTable from '../../components/admin/ProductTable';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert/Alert';
import Loader from '../../components/common/Loader';
import './admin.css';

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
    <div className="admin-page">
      <div className="admin-header-row">
        <div>
          <h2>Product Management</h2>
          <p className="admin-subtitle">
            {loading ? 'Loading...' : `Total Products: ${total} | Page ${page} of ${pages}`}
          </p>
        </div>
        <div className="admin-actions">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search by name, brand, category..."
            disabled={loading}
          />
          <button 
            className="btn-primary" 
            onClick={handleAddProduct}
            disabled={loading}
          >
            + Add Product
          </button>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} />
      )}

      {loading && page === 1 ? (
        <div className="loader-container">
          <Loader />
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>{keyword ? 'Try a different search term.' : 'Start by adding your first product.'}</p>
              {keyword && (
                <button 
                  className="btn-secondary" 
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
              <ProductTable
                products={products}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              
              {pages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={pages}
                  onPageChange={handlePageChange}
                  disabled={loading}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;