import React, { useState } from 'react';

export default function ProductCard({ product }) {
  const IMAGE_BASE_URL = 'http://localhost:5000';
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.old_price) || 0;
  const discountPercent = Number(product.discount_percent) || 0;
  const details = product.details || product.description || 'More information will be added soon.';
  const imageSrc = product.image ? `${IMAGE_BASE_URL}${product.image}` : '/placeholder.png';
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <style>{`
        .shop-card {
          position: relative;
          border-radius: 16px;
          background: #ffffff;
          box-shadow: 0 10px 25px rgba(0,0,0,0.06);
          padding: 1.1rem 1.1rem 1.25rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid #e5e7eb;
        }

        .shop-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          min-height: 1.9rem;
        }

        .shop-card-ribbon {
          background: #f97316;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
        }

        .shop-card-rating {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          background: #fef9c3;
          border-radius: 999px;
          padding: 0.15rem 0.5rem;
          font-size: 0.7rem;
          color: #92400e;
          margin-left: auto;
        }

        .shop-card-heart {
          position: absolute;
          top: 0.8rem;
          right: 0.9rem;
          font-size: 1rem;
          color: #f97373;
        }

        .shop-card-image {
          width: 100%;
          height: 170px;
          object-fit: contain;
          margin: 0.2rem 0 0.8rem;
        }

        .shop-card-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.35rem;
          color: #111827;
        }

        .shop-card-spec {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        .shop-card-price-row {
          margin-top: 0.8rem;
          font-size: 0.9rem;
        }

        .shop-card-price-label {
          color: #111827;
        }

        .shop-card-price {
          color: #ef4444;
          font-weight: 700;
          margin-left: 0.2rem;
        }

        .shop-card-old-price {
          text-decoration: line-through;
          color: #9ca3af;
          margin-left: 0.5rem;
          font-size: 0.8rem;
        }

        .shop-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }

        .shop-card-link {
          font-size: 0.8rem;
          color: #ef4444;
          text-decoration: none;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        .shop-card-link:hover {
          text-decoration: underline;
        }

        .shop-card-buy {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #111827;
          color: #fff;
          border-radius: 999px;
          padding: 0.45rem 0.9rem;
          font-size: 0.8rem;
          border: none;
          cursor: pointer;
        }

        .shop-card-buy-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          color: #111827;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
        }

        .product-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.58);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 50;
        }

        .product-modal {
          width: min(560px, 100%);
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
          color: #111827;
          overflow: hidden;
        }

        .product-modal-image {
          width: 100%;
          height: 240px;
          object-fit: contain;
          background: #f8fafc;
        }

        .product-modal-body {
          padding: 1.2rem;
        }

        .product-modal-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 0.7rem;
        }

        .product-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: #003366;
        }

        .product-modal-close {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #111827;
          border-radius: 999px;
          width: 32px;
          height: 32px;
          cursor: pointer;
          line-height: 1;
        }

        .product-modal-details {
          color: #4b5563;
          font-size: 0.92rem;
          line-height: 1.6;
          white-space: pre-wrap;
          margin: 0 0 1rem;
        }

        .product-modal-price {
          color: #ef4444;
          font-weight: 800;
        }

        @media (max-width: 480px) {
          .shop-card-image {
            height: 150px;
          }

          .product-modal-image {
            height: 190px;
          }
        }
      `}</style>

      <div className="shop-card">
        <div className="shop-card-header">
          {discountPercent > 0 && (
            <span className="shop-card-ribbon">{discountPercent}% Off</span>
          )}
          <span className="shop-card-rating">Star 4.4</span>
        </div>
        <span className="shop-card-heart">♡</span>

        <img
          src={imageSrc}
          alt={product.name}
          className="shop-card-image"
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />

        <h3 className="shop-card-title">{product.name}</h3>
        <p className="shop-card-spec">{product.description}</p>

        <div className="shop-card-price-row">
          <span className="shop-card-price-label">Price:</span>
          <span className="shop-card-price">RWF {price.toFixed(2)}</span>
          {oldPrice > 0 && (
            <span className="shop-card-old-price">RWF {oldPrice.toFixed(2)}</span>
          )}
        </div>

        <div className="shop-card-footer">
          <button
            type="button"
            className="shop-card-link"
            onClick={() => setDetailsOpen(true)}
          >
            View Details
          </button>
          <button type="button" className="shop-card-buy">
            Buy Now
            <span className="shop-card-buy-icon">Cart</span>
          </button>
        </div>
      </div>

      {detailsOpen && (
        <div className="product-modal-backdrop" onClick={() => setDetailsOpen(false)}>
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`product-title-${product.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageSrc}
              alt={product.name}
              className="product-modal-image"
              onError={(e) => {
                e.target.src = '/placeholder.png';
              }}
            />
            <div className="product-modal-body">
              <div className="product-modal-header">
                <h2 className="product-modal-title" id={`product-title-${product.id}`}>
                  {product.name}
                </h2>
                <button
                  type="button"
                  className="product-modal-close"
                  aria-label="Close product details"
                  onClick={() => setDetailsOpen(false)}
                >
                  X
                </button>
              </div>
              <p className="product-modal-details">{details}</p>
              <div>
                Price: <span className="product-modal-price">RWF {price.toFixed(2)}</span>
                {oldPrice > 0 && (
                  <span className="shop-card-old-price">RWF {oldPrice.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
