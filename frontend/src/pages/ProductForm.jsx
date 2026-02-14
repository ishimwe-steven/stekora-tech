import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ProductForm({ initial, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setDescription(initial.description || '');
      setPrice(initial.price || '');
    }
  }, [initial]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('description', description);
      form.append('price', price);
      if (image) form.append('image', image);

      if (initial && initial.id) {
        await api.put(`/products/${initial.id}`, form);
      } else {
        await api.post('/products', form);
      }
      setName(''); setDescription(''); setPrice(''); setImage(null);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded" required />
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
      <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="w-full p-2 border rounded" required />
      <input type="file" onChange={e => setImage(e.target.files[0])} />
      <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
    </form>
  );
}
