// src/pages/admin/AddEditProduct.jsx - Updated for multiple images
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  createProduct, 
  updateProduct, 
  uploadProductImages,
  clearProductState 
} from '../../redux/slices/adminProductSlice';
import Alert from '../../components/common/Alert/Alert';
import Loader from '../../components/common/Loader';
import MultiImageUpload from '../../components/admin/MultiImageUpload';
import './AddEditProduct.css';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = !!id;

  const { loading, error, success, product } = useSelector((state) => state.adminProducts);
  const { user } = useSelector((state) => state.auth);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    brand: '',
    category: 'Cotton',
    countInStock: 0,
    sizes: ['L'],
    image: {
      public_id: '',
      original: '',
      thumbnail: '',
      medium: '',
      large: '',
      placeholder: ''
    },
    additionalImages: [] // Array of image objects
  });

  const [imageFiles, setImageFiles] = useState([]); // Temporary files before upload
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Categories and sizes
  const categories = ['Cotton', 'Satin', 'Silk', 'Rayon', 'Maternity'];
  const sizeOptions = ['M', 'L', 'XL', 'XXL', '3XL'];

  // Initialize form data if editing
  useEffect(() => {
    if (isEditMode && product && product._id === id) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        description: product.description || '',
        brand: product.brand || '',
        category: product.category || 'Cotton',
        countInStock: product.countInStock || 0,
        sizes: product.sizes || ['L'],
        image: product.image || {
          public_id: '',
          original: '',
          thumbnail: '',
          medium: '',
          large: '',
          placeholder: ''
        },
        additionalImages: product.additionalImages || []
      });
    }
  }, [isEditMode, product, id]);

  // Handle success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearProductState());
        navigate('/admin/products');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate, dispatch]);

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(clearProductState());
      // Clean up blob URLs
      imageFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [dispatch, imageFiles]);

  // Handle image selection
  const handleImagesSelect = useCallback(async (files) => {
    // Create preview URLs
    const filesWithPreview = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false
    }));
    
    setImageFiles(prev => [...prev, ...filesWithPreview]);
    
    // Upload images immediately
    await uploadImagesToCloudinary(filesWithPreview);
  }, []);

  // Upload images to Cloudinary
  const uploadImagesToCloudinary = async (filesToUpload) => {
    setUploadingImages(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      console.log('FILES TO UPLOAD:', filesToUpload);

      filesToUpload.forEach((item, index) => {
        formData.append('images', item.file);
      });
        
      const result = await dispatch(uploadProductImages(formData)).unwrap();
      
      if (result.images && result.images.length > 0) {
        // Process uploaded images
        const uploadedImages = result.images;
        
        // First image becomes main image
        const mainImage = uploadedImages[0];
        const additionalImages = uploadedImages.slice(1);
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          image: mainImage,
          additionalImages: [...prev.additionalImages, ...additionalImages]
        }));
        
        // Update file states
        setImageFiles(prev => 
          prev.map((item, index) => ({
            ...item,
            uploading: false,
            uploaded: true,
            cloudinaryData: uploadedImages[index] || null
          }))
        );
      }
      
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(`Failed to upload images: ${error.message || 'Unknown error'}`);
      
      // Reset failed uploads
      setImageFiles(prev => 
        prev.map(item => ({
          ...item,
          uploading: false,
          uploaded: false
        }))
      );
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image
  const handleImageRemove = useCallback((index) => {
    if (index === 0) {
      // Removing main image
      const newMainImage = formData.additionalImages[0] || null;
      const newAdditionalImages = formData.additionalImages.slice(1);
      
      setFormData(prev => ({
        ...prev,
        image: newMainImage || {
          public_id: '',
          original: '',
          thumbnail: '',
          medium: '',
          large: '',
          placeholder: ''
        },
        additionalImages: newAdditionalImages
      }));
    } else {
      // Removing additional image (adjust index since 0 is main image)
      const adjustedIndex = index - 1;
      setFormData(prev => ({
        ...prev,
        additionalImages: prev.additionalImages.filter((_, i) => i !== adjustedIndex)
      }));
    }
    
    // Clean up blob URL
    if (imageFiles[index]?.preview) {
      URL.revokeObjectURL(imageFiles[index].preview);
    }
    
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }, [formData, imageFiles]);

  // Combine all images for display
  const allImages = [
    formData.image,
    ...formData.additionalImages
  ].filter(img => img && img.original);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'sizes') {
      const options = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        sizes: options
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = [];
    if (!formData.name.trim()) errors.push('Product name is required');
    if (formData.price <= 0) errors.push('Price must be greater than 0');
    if (!formData.image.original) errors.push('Please upload at least one product image');
    if (!formData.brand.trim()) errors.push('Brand is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (formData.sizes.length === 0) errors.push('Select at least one size');
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    // Prepare data for submission
    const productData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      description: formData.description.trim(),
      brand: formData.brand.trim(),
      category: formData.category,
      countInStock: parseInt(formData.countInStock),
      sizes: formData.sizes,
      image: formData.image,
      additionalImages: formData.additionalImages
    };

    try {
      if (isEditMode) {
        await dispatch(updateProduct({ id, productData })).unwrap();
      } else {
        const productWithUser = {
          ...productData,
          user: user?._id
        };
        await dispatch(createProduct(productWithUser)).unwrap();
      }
    } catch (error) {
      console.error('Product save failed:', error);
    }
  };

  return (
    <div className="add-edit-product">
      <div className="admin-header-row">
        <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
        <button 
          type="button"
          className="btn-secondary" 
          onClick={() => navigate('/admin/products')}
          disabled={loading || uploadingImages}
        >
          ← Back to Products
        </button>
      </div>

      {error && (
        <Alert type="error" message={error} />
      )}

      {success && (
        <Alert 
          type="success" 
          message={`Product ${isEditMode ? 'updated' : 'created'} successfully! Redirecting...`}
        />
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Left Column - Image Upload */}
          <div className="form-section">
            <h3 className="form-section-title">
              Product Images
              {uploadingImages && (
                <span className="uploading-indicator">
                  Uploading... {uploadProgress}%
                </span>
              )}
            </h3>
            
            <MultiImageUpload
              images={allImages}
              onImagesSelect={handleImagesSelect}
              onImageRemove={handleImageRemove}
              maxImages={10}
              uploading={uploadingImages}
            />
            
            {formData.image?.original && (
              <div className="image-info">
                <p>
                  <strong>✓ {allImages.length} image(s) uploaded to Cloudinary</strong>
                </p>
                <div className="upload-stats">
                  <span>Main image: {formData.image.original.split('/').pop()}</span>
                  <span>Additional: {formData.additionalImages.length} images</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
         <div className="form-section">
            <h3 className="form-section-title">Product Details</h3>
            
            <div className="form-group">
              <label htmlFor="name">
                Product Name *
                {!formData.name.trim() && <span className="validation-error"> (Required)</span>}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Silk Comfort Nighty"
                className={!formData.name.trim() ? 'input-error' : ''}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">
                  Price ($) *
                  {formData.price <= 0 && <span className="validation-error"> (Must be greater than 0)</span>}
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="29.99"
                  className={formData.price <= 0 ? 'input-error' : ''}
                />
              </div>

              <div className="form-group">
                <label htmlFor="countInStock">Stock Quantity *</label>
                <input
                  type="number"
                  id="countInStock"
                  name="countInStock"
                  value={formData.countInStock}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">
                  Brand *
                  {!formData.brand.trim() && <span className="validation-error"> (Required)</span>}
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Victoria's Secret"
                  className={!formData.brand.trim() ? 'input-error' : ''}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sizes">
                Available Sizes *
                {formData.sizes.length === 0 && <span className="validation-error"> (Select at least one)</span>}
              </label>
              <select
                id="sizes"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                multiple
                required
                className={`multi-select ${formData.sizes.length === 0 ? 'input-error' : ''}`}
                size={Math.min(5, sizeOptions.length)}
              >
                {sizeOptions.map(size => (
                  <option key={size} value={size}>Size {size}</option>
                ))}
              </select>
              <small className="form-help">
                Hold Ctrl/Cmd to select multiple. Selected: {formData.sizes.join(', ') || 'None'}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description *
                {!formData.description.trim() && <span className="validation-error"> (Required)</span>}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Describe the material, comfort, features, care instructions..."
                className={!formData.description.trim() ? 'input-error' : ''}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/admin/products')}
            disabled={loading || uploadingImages}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || uploadingImages}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </span>
            ) : uploadingImages ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Uploading Images...
              </span>
            ) : (
              isEditMode ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;