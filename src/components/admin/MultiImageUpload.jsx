// src/components/admin/MultiImageUpload.jsx
import React, { useRef, useState } from 'react';
import './MultiImageUpload.css';

const MultiImageUpload = ({ 
  images = [], 
  onImagesSelect, 
  onImageRemove,
  maxImages = 10,
  uploading = false 
}) => {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const remainingSlots = maxImages - images.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      if (filesToAdd.length > 0) {
        onImagesSelect(filesToAdd);
      } else {
        alert(`Maximum ${maxImages} images allowed`);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const remainingSlots = maxImages - images.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      if (filesToAdd.length > 0) {
        onImagesSelect(filesToAdd);
      } else {
        alert(`Maximum ${maxImages} images allowed`);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const triggerFileInput = () => {
    if (!uploading && images.length < maxImages) {
      fileInputRef.current.click();
    }
  };

  const isImageObject = (img) => {
    return img && typeof img === 'object' && img.original;
  };

  return (
    <div className="multi-image-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="file-input"
        disabled={uploading || images.length >= maxImages}
      />
      
      <div className="upload-header">
        <h4>Product Images</h4>
        <span className="image-count">
          {images.length} / {maxImages} images
        </span>
      </div>
      
      <div 
        className={`drop-zone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        {uploading ? (
          <div className="uploading-state">
            <div className="upload-spinner"></div>
            <p>Uploading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="empty-drop-zone">
            <svg className="upload-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <p>Drag & drop images here, or click to select</p>
            <small>Supports: JPEG, PNG, WebP (Max 5MB each)</small>
            <small>Up to {maxImages} images per product</small>
          </div>
        ) : (
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={index} className="image-item">
                <div className="image-wrapper">
                  <img 
                    src={isImageObject(image) ? image.thumbnail : URL.createObjectURL(image)} 
                    alt={`Product ${index + 1}`}
                    className="image-preview"
                  />
                  <div className="image-overlay">
                    <span className="image-number">{index + 1}</span>
                    {index === 0 && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageRemove(index);
                    }}
                    disabled={uploading}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
                {index === 0 && (
                  <small className="featured-label">Main image</small>
                )}
              </div>
            ))}
            
            {images.length < maxImages && (
              <div className="add-more" onClick={triggerFileInput}>
                <div className="add-icon">+</div>
                <p>Add more images</p>
                <small>{maxImages - images.length} remaining</small>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="upload-info">
        <p>
          <strong>Tips:</strong>
        </p>
        <ul>
          <li>First image will be the featured/main product image</li>
          <li>Add multiple angles, details, and variations</li>
          <li>Recommended size: 1200x1200px minimum</li>
          <li>Images are optimized and converted to WebP automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiImageUpload;