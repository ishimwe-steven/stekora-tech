import React from 'react';

export default function ProductCard({ product }) {
  const IMAGE_BASE_URL = 'http://localhost:5000';

  return (
    <div style={{
      border: '1px solid #003366',
      borderRadius: '12px',
      padding: '1rem',
      background: '#fff'
    }}>
      {/* Image */}
      <img
        src={`${IMAGE_BASE_URL}${product.image}`}
        alt={product.name}
        style={{
          width: '100%',
          height: '180px',
          objectFit: 'cover',
          borderRadius: '8px',
          marginBottom: '0.75rem'
        }}
        onError={(e) => {
          e.target.src = '/placeholder.png';
        }}
      />

      <h3>{product.name}</h3>
      <p style={{ color: '#6b7280' }}>{product.description}</p>
      <strong>RWF  {product.price}</strong>
    </div>
  );
}
