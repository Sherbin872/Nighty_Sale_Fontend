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
    category: '',
    countInStock: 0,
    sizes: [],
    image: {
      public_id: '',
      original: '',
      thumbnail: '',
      medium: '',
      large: '',
      placeholder: ''
    },
    additionalImages: []
  });

  const [imageFiles, setImageFiles] = useState([]); 
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Available size options for the checkboxes
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

  // Get all images for display
  const allImages = [formData.image, ...formData.additionalImages].filter(img => img && img.original);

  // Initialize form data if editing
  useEffect(() => {
    if (isEditMode && product && product._id === id) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        description: product.description || '',
        brand: product.brand || '',
        category: product.category || '',
        countInStock: product.countInStock || 0,
        sizes: product.sizes || [],
        image: product.image || {
          public_id: '', original: '', thumbnail: '', medium: '', large: '', placeholder: ''
        },
        additionalImages: product.additionalImages || []
      });

      // Create preview entries for existing images
      const existingImages = [];
      if (product.image?.original) {
        existingImages.push({
          preview: product.image.original,
          uploaded: true,
          uploading: false,
          isMain: true,
          cloudinaryData: product.image
        });
      }
      
      if (product.additionalImages?.length > 0) {
        product.additionalImages.forEach((img, index) => {
          existingImages.push({
            preview: img.original,
            uploaded: true,
            uploading: false,
            isMain: false,
            cloudinaryData: img
          });
        });
      }
      
      if (existingImages.length > 0) {
        setImageFiles(existingImages);
      }
    }
  }, [isEditMode, product, id]);

  // Handle success redirect
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearProductState());
        navigate('/admin/products');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, navigate, dispatch]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      dispatch(clearProductState());
      imageFiles.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [dispatch, imageFiles]);

  // Image Handlers
  const handleImagesSelect = useCallback(async (files) => {
    // Create previews for new files
    const filesWithPreview = files.map(file => ({
      file, 
      preview: URL.createObjectURL(file), 
      uploading: false, 
      uploaded: false,
      isMain: false
    }));
    
    setImageFiles(prev => [...prev, ...filesWithPreview]);
    
    // Check if this is the first image being added
    const currentImagesCount = allImages.length;
    const isFirstImage = currentImagesCount === 0;
    
    await uploadImagesToCloudinary(filesWithPreview, isFirstImage);
  }, [allImages.length]);

  const uploadImagesToCloudinary = async (filesToUpload, isFirstImage = false) => {
    setUploadingImages(true);
    setUploadProgress(0);
    
    try {
      const uploadData = new FormData();
      filesToUpload.forEach(item => uploadData.append('images', item.file));
        
      const result = await dispatch(uploadProductImages(uploadData)).unwrap();
      
      if (result.images && result.images.length > 0) {
        const uploadedImages = result.images;
        
        setFormData(prev => {
          const newFormData = { ...prev };
          
          // Handle main image assignment
          if (isFirstImage || !prev.image.original) {
            // If this is the first image, set as main
            newFormData.image = uploadedImages[0];
            newFormData.additionalImages = [
              ...prev.additionalImages,
              ...uploadedImages.slice(1)
            ];
          } else {
            // Otherwise add all as additional images
            newFormData.additionalImages = [
              ...prev.additionalImages,
              ...uploadedImages
            ];
          }
          
          return newFormData;
        });
        
        // Update imageFiles state with cloudinary data
        setImageFiles(prev => {
          const updated = [...prev];
          let uploadedIndex = 0;
          
          // Find the files that were just uploaded (those without cloudinaryData)
          for (let i = 0; i < updated.length; i++) {
            if (!updated[i].cloudinaryData && uploadedIndex < uploadedImages.length) {
              updated[i] = {
                ...updated[i],
                uploading: false,
                uploaded: true,
                cloudinaryData: uploadedImages[uploadedIndex],
                isMain: isFirstImage && uploadedIndex === 0
              };
              uploadedIndex++;
            }
          }
          
          return updated;
        });
        
        setUploadProgress(100);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Failed to upload images: ${error.message || 'Unknown error'}`);
      setImageFiles(prev => prev.map(item => ({...item, uploading: false, uploaded: false})));
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle image removal
  const handleImageRemove = useCallback((indexToRemove) => {
    const allCurrentImages = [formData.image, ...formData.additionalImages].filter(img => img?.original);
    
    if (indexToRemove < 0 || indexToRemove >= allCurrentImages.length) return;
    
    const imageToRemove = allCurrentImages[indexToRemove];
    
    // Revoke object URL if it's a blob URL
    if (imageFiles[indexToRemove]?.preview && imageFiles[indexToRemove].preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageFiles[indexToRemove].preview);
    }
    
    // Remove from imageFiles
    setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    
    // Update formData
    setFormData(prev => {
      // Check if removing the main image
      if (imageToRemove === prev.image) {
        // Main image is being removed, promote the first additional image to main
        const newMainImage = prev.additionalImages[0] || null;
        const newAdditionalImages = prev.additionalImages.slice(1);
        
        // Update isMain flag in imageFiles for the new main image
        if (newMainImage) {
          setImageFiles(current => 
            current.map((file, idx) => ({
              ...file,
              isMain: idx === 0 // The first remaining image becomes main
            }))
          );
        }
        
        return {
          ...prev,
          image: newMainImage || { 
            public_id: '', original: '', thumbnail: '', medium: '', large: '', placeholder: '' 
          },
          additionalImages: newAdditionalImages
        };
      } else {
        // Removing an additional image
        return {
          ...prev,
          additionalImages: prev.additionalImages.filter(img => img !== imageToRemove)
        };
      }
    });
  }, [formData, imageFiles]);

  // Handle setting an image as main
  const handleSetAsMain = useCallback((index) => {
    const allCurrentImages = [formData.image, ...formData.additionalImages].filter(img => img?.original);
    
    if (index < 0 || index >= allCurrentImages.length) return;
    if (index === 0) return; // Already main image
    
    const newMainImage = allCurrentImages[index];
    const remainingImages = allCurrentImages.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      image: newMainImage,
      additionalImages: remainingImages
    });
    
    // Update imageFiles to reflect main image status
    setImageFiles(prev => {
      // Reorder the files array to put the new main image first
      const newFileOrder = [...prev];
      const [movedFile] = newFileOrder.splice(index, 1);
      newFileOrder.unshift(movedFile);
      
      // Update isMain flags
      return newFileOrder.map((file, i) => ({
        ...file,
        isMain: i === 0
      }));
    });
  }, [formData]);

  // NEW: Handle image reordering
  const handleImageReorder = useCallback((dragIndex, dropIndex) => {
    if (dragIndex === dropIndex) return;

    // Get all current images
    const allCurrentImages = [formData.image, ...formData.additionalImages].filter(img => img?.original);
    
    // Create a new array with the reordered items
    const reorderedImages = [...allCurrentImages];
    const [draggedImage] = reorderedImages.splice(dragIndex, 1);
    reorderedImages.splice(dropIndex, 0, draggedImage);
    
    // Update formData with new order
    setFormData({
      ...formData,
      image: reorderedImages[0] || formData.image,
      additionalImages: reorderedImages.slice(1)
    });
    
    // Also update imageFiles to maintain consistency
    setImageFiles(prev => {
      const newFileOrder = [...prev];
      const [draggedFile] = newFileOrder.splice(dragIndex, 1);
      newFileOrder.splice(dropIndex, 0, draggedFile);
      
      // Update isMain flags
      return newFileOrder.map((file, idx) => ({
        ...file,
        isMain: idx === 0
      }));
    });
  }, [formData]);

  // Input Handlers
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Custom Handler for Size Checkboxes
  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = [];
    if (!formData.name.trim()) errors.push('Product name is required');
    if (formData.price <= 0) errors.push('Price must be greater than 0');
    if (!formData.image.original) errors.push('Please upload at least one product image');
    if (!formData.brand.trim()) errors.push('Brand is required');
    if (!formData.category.trim()) errors.push('Category is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (formData.sizes.length === 0) errors.push('Select at least one size');
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const productData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      description: formData.description.trim(),
      brand: formData.brand.trim(),
      category: formData.category.trim(),
      countInStock: parseInt(formData.countInStock),
      sizes: formData.sizes,
      image: formData.image,
      additionalImages: formData.additionalImages
    };

    try {
      if (isEditMode) {
        await dispatch(updateProduct({ id, productData })).unwrap();
      } else {
        await dispatch(createProduct({ ...productData, user: user?._id })).unwrap();
      }
    } catch (error) {
      console.error('Product save failed:', error);
    }
  };

  return (
    <div className="ns-product-form-wrapper">
      
      {/* Header */}
      <div className="ns-product-form-header">
        <div>
          <h2 className="ns-product-form-title">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
          <p className="ns-product-form-subtitle">Fill in the details below to publish to your store.</p>
        </div>
        <button 
          type="button"
          className="ns-product-form-btn-back" 
          onClick={() => navigate('/admin/products')}
          disabled={loading || uploadingImages}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
      </div>

      {error && <div className="ns-product-form-alert"><Alert type="error" message={error} /></div>}
      
      {success && (
        <div className="ns-product-form-alert success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Product {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="ns-product-form">
        <div className="ns-product-form-grid">
          
          {/* Left Column - Image Upload */}
          <div className="ns-product-form-card">
            <div className="ns-product-form-card-header">
              <h3>Media</h3>
              {uploadingImages && (
                <div className="upload-progress">
                  <span className="upload-badge">Uploading... {uploadProgress}%</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Custom Image Upload Display with Main Image Indicator */}
            <div className="custom-image-upload-container">
              {/* Main Image Indicator */}
              {allImages.length > 0 && (
                <div className="main-image-badge">
                  <span className="badge">Main Image</span>
                </div>
              )}
              
              <MultiImageUpload
                images={allImages}
                onImagesSelect={handleImagesSelect}
                onImageRemove={handleImageRemove}
                onSetAsMain={handleSetAsMain}
                onImageReorder={handleImageReorder}  // This is now defined
                maxImages={10}
                uploading={uploadingImages}
                showMainIndicator={true}
              />
              
              {formData.image?.original && (
                <div className="ns-product-form-image-stats">
                  <p className="success-text">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {allImages.length} image(s) ready • First image is main
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="ns-product-form-card">
            <div className="ns-product-form-card-header">
              <h3>Product Information</h3>
            </div>
            
            {/* Title */}
            <div className="ns-product-form-group">
              <label>Product Name <span className="req">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Premium Silk Comfort Nighty"
                className="ns-product-form-input"
                required
              />
            </div>

            {/* Price & Stock Row */}
            <div className="ns-product-form-row">
              <div className="ns-product-form-group">
                <label>Price (₹) <span className="req">*</span></label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="ns-product-form-input"
                  required
                />
              </div>
              <div className="ns-product-form-group">
                <label>Stock Quantity <span className="req">*</span></label>
                <input
                  type="number"
                  name="countInStock"
                  value={formData.countInStock}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 50"
                  className="ns-product-form-input"
                  required
                />
              </div>
            </div>

            {/* Brand & Category Row */}
            <div className="ns-product-form-row">
              <div className="ns-product-form-group">
                <label>Brand <span className="req">*</span></label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Nighty Sale Originals"
                  className="ns-product-form-input"
                  required
                />
              </div>
              
              <div className="ns-product-form-group">
                <label>Category <span className="req">*</span></label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Cotton, Silk, Maternity..."
                  className="ns-product-form-input"
                  required
                />
              </div>
            </div>

            {/* Size Checkboxes */}
            <div className="ns-product-form-group">
              <label>Available Sizes <span className="req">*</span></label>
              <div className="ns-product-form-sizes">
                {sizeOptions.map(size => {
                  const isChecked = formData.sizes.includes(size);
                  return (
                    <label key={size} className={`ns-size-pill ${isChecked ? 'active' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => handleSizeToggle(size)} 
                        hidden
                      />
                      {size}
                    </label>
                  );
                })}
              </div>
              {formData.sizes.length === 0 && (
                <small className="ns-error-text">Please select at least one size.</small>
              )}
            </div>

            {/* Description */}
            <div className="ns-product-form-group">
              <label>Description <span className="req">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Describe the material, comfort, features, and care instructions..."
                className="ns-product-form-input"
                required
              />
            </div>

          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="ns-product-form-actions">
          <button
            type="button"
            className="ns-product-form-btn-cancel"
            onClick={() => navigate('/admin/products')}
            disabled={loading || uploadingImages}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="ns-product-form-btn-save"
            disabled={loading || uploadingImages || !formData.image.original}
          >
            {loading ? (
              <>
                <div className="ns-spinner-small"></div>
                {isEditMode ? 'Saving Changes...' : 'Publishing...'}
              </>
            ) : uploadingImages ? (
              <>
                <div className="ns-spinner-small"></div>
                Uploading Media...
              </>
            ) : (
              isEditMode ? 'Update Product' : 'Publish Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;