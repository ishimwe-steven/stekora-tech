import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <style>
        {`
          :root {
            --richblue: #003366;
            --palegray: #f5f5f5;
            --lightgray: #9ca3af;
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

          .shop-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 1rem;
          }

          .shop-search-input {
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid var(--lightgray);
            background: #ffffff;
            color: var(--richblue);
            font-size: 0.85rem;
            outline: none;
            width: 100%;
            max-width: 400px;
            margin-bottom: 2rem;
          }

          .shop-search-input:focus {
            border-color: var(--richblue);
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

          .shop-empty-panel {
            background: #dfe4ea;
            border: 1px dashed var(--richblue);
            border-radius: 0.75rem;
            padding: 2rem;
            color: var(--richblue);
            margin-top: 0.25rem;
          }

          .shop-empty-panel h2 {
            font-size: 1.15rem;
            font-weight: 700;
            margin: 0 0 0.6rem;
          }

          .shop-empty-panel p {
            color: var(--lightgray);
            font-size: 0.95rem;
            margin: 0;
          }

          .shop-empty-contact {
            color: var(--richblue);
            display: inline-block;
            font-size: 0.9rem;
            margin-top: 1.25rem;
          }

          .shop-no-results {
            font-size: 0.9rem;
            color: var(--lightgray);
            margin-top: 1rem;
          }

          @media(max-width: 480px) {
            .shop-empty-panel {
              padding: 1.5rem;
            }

            .shop-search-input {
              max-width: 100%;
            }
          }
        `}
      </style>

      <div className="shop-container">
        <h1 className="shop-title">Shop</h1>

        <input
          type="text"
          className="shop-search-input"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading && <p className="status-text">Loading products...</p>}

        {error && <p className="status-text">{error}</p>}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="shop-empty-panel">
            <h2>No product posted yet</h2>
            <p>
              We're preparing products and services for the shop. Please check back soon.
            </p>
            <span className="shop-empty-contact">Email: info@stekoratech.com</span>
          </div>
        )}

        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
          <p className="shop-no-results">
            No matching products found for "<span style={{ color: '#003366' }}>{searchTerm}</span>"
          </p>
        )}
      </div>
    </>
  );
}
