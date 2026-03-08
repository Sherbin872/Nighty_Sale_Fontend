// src/components/admin/MultiImageUpload.jsx
import React, { useRef, useState } from 'react';
import './MultiImageUpload.css';

const MultiImageUpload = ({ 
  images = [], 
  onImagesSelect, 
  onImageRemove,
  onSetAsMain,
  onImageReorder, // New prop for reordering images
  maxImages = 10,
  uploading = false,
  showMainIndicator = true
}) => {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

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
    
    // Reset file input value so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  // New drag and drop handlers for reordering
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox
    e.dataTransfer.setData('text/plain', index);
    // Add a class to the dragged item
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    setDraggedItem(null);
    setDragOverIndex(null);
    e.target.classList.remove('dragging');
  };

  const handleDragOverItem = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem === null || draggedItem === index) return;
    setDragOverIndex(index);
  };

  const handleDropOnItem = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    // Call the reorder callback
    if (onImageReorder) {
      onImageReorder(draggedItem, dropIndex);
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const triggerFileInput = () => {
    if (!uploading && images.length < maxImages) {
      fileInputRef.current.click();
    }
  };

  const handleSetAsMain = (e, index) => {
    e.stopPropagation();
    if (onSetAsMain && index !== 0) {
      onSetAsMain(index);
    }
  };

  const handleRemove = (e, index) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this image?')) {
      onImageRemove(index);
    }
  };

  const isImageObject = (img) => {
    return img && typeof img === 'object' && (img.original || img.thumbnail || img.preview);
  };

  const getImageUrl = (image) => {
    if (!image) return '';
    
    // Handle cloudinary image objects
    if (image.thumbnail) return image.thumbnail;
    if (image.original) return image.original;
    if (image.medium) return image.medium;
    
    // Handle File objects or objects with preview
    if (image.preview) return image.preview;
    
    return '';
  };

  return (
    <div className="multi-image-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
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
            <small>Supports: JPEG, PNG, WebP, GIF (Max 5MB each)</small>
            <small>Up to {maxImages} images per product</small>
          </div>
        ) : (
          <div className="images-grid">
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`image-item ${index === 0 ? 'main-image' : ''} 
                  ${dragOverIndex === index ? 'drag-over' : ''} 
                  ${draggedItem === index ? 'dragging' : ''}`}
                onClick={(e) => e.stopPropagation()}
                draggable={!uploading}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOverItem(e, index)}
                onDrop={(e) => handleDropOnItem(e, index)}
              >
                <div className="image-wrapper">
                  <img 
                    src={getImageUrl(image)} 
                    alt={`Product ${index + 1}`}
                    className="image-preview"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300?text=Image+Error';
                    }}
                  />
                  
                  {/* Image overlay with badges */}
                  <div className="image-overlay">
                    <span className="image-number">{index + 1}</span>
                    {index === 0 && showMainIndicator && (
                      <span className="featured-badge">Main</span>
                    )}
                  </div>

                  {/* Drag handle */}
                  {!uploading && (
                    <div className="drag-handle" title="Drag to reorder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="9" cy="18" r="1" />
                        <circle cx="15" cy="18" r="1" />
                        <circle cx="9" cy="6" r="1" />
                        <circle cx="15" cy="6" r="1" />
                      </svg>
                    </div>
                  )}

                  {/* Set as main button (only show for non-main images) */}
                  {index !== 0 && onSetAsMain && !uploading && (
                    <button
                      type="button"
                      className="set-main-btn"
                      onClick={(e) => handleSetAsMain(e, index)}
                      title="Set as main image"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  )}

                  {/* Remove button */}
                  {!uploading && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={(e) => handleRemove(e, index)}
                      title="Remove image"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Image labels */}
                <div className="image-labels">
                  {index === 0 && showMainIndicator && (
                    <small className="featured-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Main image
                    </small>
                  )}
                  {image.uploading && (
                    <small className="uploading-label">Uploading...</small>
                  )}
                  {!uploading && index !== 0 && (
                    <small className="drag-hint">Drag to reorder</small>
                  )}
                </div>
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
          <li>Click the star icon on any image to make it the main image</li>
          <li>Drag images to reorder them</li>
          <li>Add multiple angles, details, and variations</li>
          <li>Recommended size: 1200x1200px minimum</li>
          <li>Images are optimized and converted to WebP automatically</li>
        </ul>
      </div>
    </div>
  );
};

export default MultiImageUpload;