import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductForm from './ProductForm';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);
  async function load() {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) { console.error(err); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete product?')) return;
    await api.delete(`/products/${id}`);
    load();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-4">
        <ProductForm onSuccess={() => { setEditing(null); load(); }} initial={editing} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map(p => (
          <div key={p.id} className="border p-3 rounded">
            <h3 className="font-semibold">{p.name}</h3>
            <div className="mt-2">
              <button onClick={() => setEditing(p)} className="mr-2 px-2 py-1 bg-yellow-400 rounded">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
