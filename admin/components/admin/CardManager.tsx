"use client";
import React, { useEffect, useState } from 'react';

export function CardManager({ section, title }: { section: string; title: string }) {
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', image: null, imageUrl: '', editingId: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    const res = await fetch(`/api/cards?section=${section}`);
    const data = await res.json();
    setCards(data);
  }

  function handleChange(e: any) {
    const { name, value, files } = e.target;
    if (name === 'image') setForm(f => ({ ...f, image: files[0] }));
    else setForm(f => ({ ...f, [name]: value }));
  }

  async function handleImageUpload(file: File) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    let imageUrl = form.imageUrl;
    if (form.image) imageUrl = await handleImageUpload(form.image);
    const payload = { title: form.title, description: form.description, imageUrl, section };
    if (form.editingId) {
      await fetch(`/api/cards/${form.editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
        body: JSON.stringify(payload)
      });
    }
    setForm({ title: '', description: '', image: null, imageUrl: '', editingId: null });
    fetchCards();
    setLoading(false);
  }

  function handleEdit(card: any) {
    setForm({ title: card.title, description: card.description, image: null, imageUrl: card.imageUrl, editingId: card._id });
  }

  async function handleDelete(id: string) {
    setLoading(true);
    await fetch(`/api/cards/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer admin-token' } });
    fetchCards();
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border p-2 w-full" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 w-full" required />
        <input name="image" type="file" accept="image/*" onChange={handleChange} className="border p-2 w-full" />
        {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="h-24" />}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{form.editingId ? 'Update' : 'Add'} Card</button>
        {form.editingId && <button type="button" onClick={() => setForm({ title: '', description: '', image: null, imageUrl: '', editingId: null })} className="ml-2 px-4 py-2 border rounded">Cancel</button>}
      </form>
      <div>
        {loading ? <div>Loading...</div> : cards.length === 0 ? <div>No cards found.</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card: any) => (
              <div key={card._id} className="bg-white rounded shadow p-4 flex flex-col">
                <img src={card.imageUrl} alt={card.title} className="h-32 w-full object-cover rounded mb-2" />
                <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                <p className="text-gray-600 mb-2">{card.description}</p>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => handleEdit(card)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(card._id)} className="text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 