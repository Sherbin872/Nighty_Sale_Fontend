// src/components/admin/ProductTable.jsx
import React, { memo, useCallback } from "react";
import "./ProductTable.css";

/* ---------- Utils ---------- */

const formatPrice = (price = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(price);

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (isNaN(date)) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ---------- Component ---------- */

const ProductTable = ({ products = [], onEdit, onDelete }) => {
  const handleEdit = useCallback(
    (id) => onEdit?.(id),
    [onEdit]
  );

  const handleDelete = useCallback(
    (id, name) => onDelete?.(id, name),
    [onDelete]
  );

  if (!products.length) {
    return <div className="empty-state">No products found</div>;
  }

  return (
    <div className="product-table-container">
      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Details</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const {
                _id,
                name,
                brand,
                description,
                category,
                price,
                countInStock,
                sizes,
                image,
                updatedAt,
                createdAt,
              } = product;

              const inStock = countInStock > 0;

              return (
                <tr key={_id} className="product-row">
                  {/* Image */}
                  <td>
                    {image?.thumbnail ? (
                      <img
                        src={image.thumbnail}
                        alt={name}
                        className="product-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </td>

                  {/* Details */}
                  <td>
                    <strong className="product-name">{name}</strong>
                    <div className="product-meta">
                      <span className="product-brand">{brand}</span>

                      {description && (
                        <p className="product-description-truncated">
                          {description.length > 80
                            ? `${description.slice(0, 80)}…`
                            : description}
                        </p>
                      )}

                      <div className="product-sizes">
                        Sizes: {sizes?.length ? sizes.join(", ") : "N/A"}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <span className="category-badge">{category}</span>
                  </td>

                  {/* Price */}
                  <td className="price-cell">
                    {formatPrice(price)}
                  </td>

                  {/* Stock */}
                  <td>
                    <span
                      className={`stock-badge ${
                        countInStock > 10
                          ? "in-stock"
                          : countInStock > 0
                          ? "low-stock"
                          : "out-of-stock"
                      }`}
                    >
                      {countInStock} units
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`status ${inStock ? "active" : "inactive"}`}>
                      {inStock ? "Active" : "Out of Stock"}
                    </span>
                  </td>

                  {/* Date */}
                  <td>
                    {formatDate(updatedAt || createdAt)}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="action-buttons">
                      {/* <button
                        className="btn-action edit"
                        onClick={() => handleEdit(_id)}
                        title="Edit"
                      >
                        ✏️
                      </button> */}

                      <button
                        className="btn-action delete"
                        onClick={() => handleDelete(_id, name)}
                        title="Delete"
                      >
                        🗑
                      </button>

                      <button
                        className="btn-action view"
                        onClick={() =>
                          window.open(`/products/${_id}`, "_blank")
                        }
                        title="View"
                      >
                        👁
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(ProductTable);
