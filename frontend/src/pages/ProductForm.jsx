import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ProductForm({ initial, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name || '');
      setDescription(initial.description || '');
      setPrice(initial.price || '');
      setOldPrice(initial.old_price || '');
      setDiscountPercent(initial.discount_percent || '');
      setDetails(initial.details || '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setOldPrice('');
      setDiscountPercent('');
      setDetails('');
    }
  }, [initial]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('description', description);
      form.append('price', price);
      form.append('old_price', oldPrice);
      form.append('discount_percent', discountPercent);
      form.append('details', details);
      if (image) form.append('image', image);

      if (initial && initial.id) {
        await api.put(`/products/${initial.id}`, form);
      } else {
        await api.post('/products', form);
      }
      setName('');
      setDescription('');
      setPrice('');
      setOldPrice('');
      setDiscountPercent('');
      setDetails('');
      setImage(null);
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Error saving product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded" required />
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
      <input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="w-full p-2 border rounded" required />
      <input type="number" min="0" step="0.01" value={oldPrice} onChange={e=>setOldPrice(e.target.value)} placeholder="Old price / discount price, e.g. 7500" className="w-full p-2 border rounded" />
      <input type="number" min="0" max="100" step="1" value={discountPercent} onChange={e=>setDiscountPercent(e.target.value)} placeholder="Discount percent, e.g. 58" className="w-full p-2 border rounded" />
      <textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="View details information for customers" className="w-full p-2 border rounded" rows="4" />
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0] || null)} />
      <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
