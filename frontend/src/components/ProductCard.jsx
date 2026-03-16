import React from 'react';

export default function ProductCard({ product }) {
  const IMAGE_BASE_URL = 'http://localhost:5000';
  const price = Number(product.price) || 0;
  const oldPrice = price ? (price * 1.5).toFixed(2) : '';

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

        @media (max-width: 480px) {
          .shop-card-image {
            height: 150px;
          }
        }
      `}</style>

      <div className="shop-card">
        <div className="shop-card-header">
          <span className="shop-card-ribbon">56% Off</span>
          <span className="shop-card-rating">
            ⭐ 4.4
          </span>
        </div>
        <span className="shop-card-heart">♡</span>

        <img
          src={`${IMAGE_BASE_URL}${product.image}`}
          alt={product.name}
          className="shop-card-image"
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />

        <h3 className="shop-card-title">{product.name}</h3>
        <p className="shop-card-spec">
          {product.description}
        </p>

        <div className="shop-card-price-row">
          <span className="shop-card-price-label">Price:</span>
          <span className="shop-card-price">RWF {price.toFixed(2)}</span>
          {oldPrice && (
            <span className="shop-card-old-price">RWF {oldPrice}</span>
          )}
        </div>

        <div className="shop-card-footer">
          <a href="#" className="shop-card-link">
            View Details
          </a>
          <button type="button" className="shop-card-buy">
            Buy Now
            <span className="shop-card-buy-icon">🛒</span>
          </button>
        </div>
      </div>
    </>
  );
}
