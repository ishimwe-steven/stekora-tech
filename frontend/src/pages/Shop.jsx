import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // ✅ NEW

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const response = await api.get('/products');

        const productList = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];

        setProducts(productList);
      } catch (err) {
        console.error(err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // ✅ FILTER PRODUCTS AS USER TYPES
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Internal CSS */}
      <style>
        {`
          :root {
            --richblue: #003366;
            --palegray: #f5f5f5;
            --lightgray: #9ca3af;
            --yellow: #facc15;
          }

          body {
            font-family: 'Inter', sans-serif;
            background-color: var(--palegray);
            color: var(--richblue);
            margin: 0;
            padding: 0;
          }

          .shop-container {
            max-width: 72rem;
            margin: 0 auto;
            padding: 2.5rem 1rem;
          }

          h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
          }

          /* SEARCH BAR WRAPPER */
          .shop-search-row {
            background: #111827;
            padding: 1rem;
            border-radius: 999px;
            display: flex;
            align-items: center;
            max-width: 520px;
            margin-bottom: 2rem;
          }

          .shop-search-input {
            flex: 1;
            padding: 0.6rem 0.9rem;
            border-radius: 999px 0 0 999px;
            border: 1px solid #4b5563;
            background: transparent;
            color: #e5e7eb;
            font-size: 0.9rem;
            outline: none;
          }

          .shop-search-input::placeholder {
            color: #9ca3af;
          }

          .shop-search-button {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            border: none;
            margin-left: 0.5rem;
            background: #f59e0b;
            color: #111827;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            cursor: pointer;
          }

          .products-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          @media(min-width: 640px) {
            .products-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media(min-width: 768px) {
            .products-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          .status-text {
            font-size: 0.9rem;
            color: var(--lightgray);
            text-align: center;
            margin-top: 2rem;
          }
        `}
      </style>

      {/* Shop JSX */}
      <div className="shop-container">
        <h1>Shop</h1>

        {/* 🔍 SEARCH BAR */}
        <div className="shop-search-row">
          <input
            type="text"
            className="shop-search-input"
            placeholder="Search For Product......"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="button"
            className="shop-search-button"
            aria-label="Search"
          >
            🔍
          </button>
        </div>

        {/* Loading */}
        {loading && <p className="status-text">Loading products…</p>}

        {/* Error */}
        {error && <p className="status-text">{error}</p>}

        {/* Products */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredProducts.length === 0 && (
          <p className="status-text">
            No products found for "<span style={{ color: '#facc15' }}>{searchTerm}</span>"
          </p>
        )}
      </div>
    </>
  );
}
