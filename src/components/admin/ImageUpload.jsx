// src/components/admin/ImageUpload.jsx
import React, { useRef } from 'react';
// import './ImageUpload.css';

const ImageUpload = ({ imagePreview, onImageSelect, currentImage, uploading = false }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !uploading) {
      onImageSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && !uploading) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    if (!uploading) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="file-input"
        disabled={uploading}
      />
      
      <div 
        className={`upload-area ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFileInput}
      >
        {uploading ? (
          <div className="upload-placeholder">
            <div className="upload-spinner"></div>
            <p>Uploading image to Cloudinary...</p>
          </div>
        ) : imagePreview ? (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <div className="image-overlay">
              <span>Click to change image</span>
            </div>
          </div>
        ) : currentImage ? (
          <div className="current-image">
            <img src={currentImage} alt="Current" />
            <div className="image-overlay">
              <span>Click to change image</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <svg className="upload-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <p>Drag & drop an image here, or click to select</p>
            <small>Supports: JPEG, PNG, WebP (Max 5MB)</small>
            <small>Images are optimized and stored in Cloudinary</small>
          </div>
        )}
      </div>
      
      {!uploading && (
        <div className="upload-actions">
          <button 
            type="button" 
            className="btn-outline" 
            onClick={triggerFileInput}
            disabled={uploading}
          >
            Select Image
          </button>
          {imagePreview && (
            <button 
              type="button" 
              className="btn-text"
              onClick={() => {
                setImagePreview('');
                onImageSelect(null);
              }}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;