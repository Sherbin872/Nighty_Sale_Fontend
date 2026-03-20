import React, { useEffect } from "react";
import "./FilterModal.css";

const FilterModal = ({
  isOpen,
  onClose,
  filters,
  categories,
  onFilterChange,
  onApply,
  onReset,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h2>Filters</h2>
          <button className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="filter-modal-content">
          {/* Category Filter */}
          <div className="filter-section">
            <h3 className="filter-section-title">Category</h3>
            <div className="category-options">
              <button
                className={`category-chip ${!filters.category ? "active" : ""}`}
                onClick={() => onFilterChange("category", "")}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-chip ${filters.category === category ? "active" : ""}`}
                  onClick={() => onFilterChange("category", category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h3 className="filter-section-title">Price Range</h3>
            <div className="price-range-inputs">
              <div className="price-input-group">
                <label htmlFor="min-price">Min (₹)</label>
                <input
                  id="min-price"
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => onFilterChange("minPrice", e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="price-input-group">
                <label htmlFor="max-price">Max (₹)</label>
                <input
                  id="max-price"
                  type="number"
                  placeholder="Any"
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Quick Price Options */}
          <div className="filter-section">
            <h3 className="filter-section-title">Quick Price</h3>
            <div className="quick-price-options">
              {["Under ₹25", "₹25 - ₹50", "₹50 - ₹100", "Over ₹100"].map((range) => (
                <button
                  key={range}
                  className="quick-price-btn"
                  onClick={() => {
                    switch(range) {
                      case "Under ₹25":
                        onFilterChange("minPrice", "");
                        onFilterChange("maxPrice", "25");
                        break;
                      case "₹25 - ₹50":
                        onFilterChange("minPrice", "25");
                        onFilterChange("maxPrice", "50");
                        break;
                      case "₹50 - ₹100":
                        onFilterChange("minPrice", "50");
                        onFilterChange("maxPrice", "100");
                        break;
                      case "Over ₹100":
                        onFilterChange("minPrice", "100");
                        onFilterChange("maxPrice", "");
                        break;
                      default:
                        break;
                    }
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Filter */}
          <div className="filter-section">
            <label className="stock-checkbox">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => onFilterChange("inStock", e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="reset-filters-modal-btn" onClick={onReset}>
            Reset All
          </button>
          <button className="apply-filters-btn" onClick={onApply}>
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;