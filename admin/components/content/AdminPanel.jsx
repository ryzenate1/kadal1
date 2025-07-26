import React, { useEffect, useState } from 'react';

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', image: null, imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(f => ({ ...f, image: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  async function handleImageUpload(file) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    let imageUrl = form.imageUrl;
    if (form.image) {
      imageUrl = await handleImageUpload(form.image);
    }
    const payload = { ...form, image: undefined, imageUrl, price: parseFloat(form.price), stock: parseInt(form.stock) };
    let res;
    if (editing) {
      res = await fetch(`/api/products/${editing._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    if (res.ok) {
      setForm({ name: '', description: '', price: '', stock: '', image: null, imageUrl: '' });
      setEditing(null);
      fetchProducts();
    } else {
      setError('Failed to save product');
    }
    setLoading(false);
  }

  function handleEdit(product) {
    setEditing(product);
    setForm({ name: product.name, description: product.description, price: product.price, stock: product.stock, image: null, imageUrl: product.imageUrl });
  }

  async function handleDelete(id) {
    setLoading(true);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Products</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 w-full" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 w-full" required />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" className="border p-2 w-full" required />
        <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" className="border p-2 w-full" required />
        <input name="image" type="file" accept="image/*" onChange={handleChange} className="border p-2 w-full" />
        {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="h-24" />}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{editing ? 'Update' : 'Add'} Product</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', stock: '', image: null, imageUrl: '' }); }} className="ml-2 px-4 py-2 border rounded">Cancel</button>}
      </form>
      <div>
        {loading ? <div>Loading...</div> : products.length === 0 ? <div>No products found.</div> : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Image</th>
                <th className="p-2">Name</th>
                <th className="p-2">Description</th>
                <th className="p-2">Price</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="border-t">
                  <td className="p-2"><img src={product.imageUrl} alt={product.name} className="h-12 w-12 object-cover" /></td>
                  <td className="p-2">{product.name}</td>
                  <td className="p-2">{product.description}</td>
                  <td className="p-2">₹{product.price}</td>
                  <td className="p-2">{product.stock}</td>
                  <td className="p-2">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 mr-2">Edit</button>
                    <button onClick={() => handleDelete(product._id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
} 