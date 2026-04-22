'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  Image as ImageIcon,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  type: string;
  description?: string;
  base_price: number;
  image_url: string;
  is_active: boolean;
  is_featured?: boolean;
  is_popular?: boolean;
  is_premium?: boolean;
  catalog_inventory?: {
    stock_quantity: number;
    low_stock_threshold: number;
  };
};

type ProductForm = {
  name: string;
  slug: string;
  category: string;
  type: string;
  description: string;
  image_url: string;
  base_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  is_featured: boolean;
  is_popular: boolean;
  is_premium: boolean;
  is_active: boolean;
};

const emptyForm: ProductForm = {
  name: '',
  slug: '',
  category: '',
  type: '',
  description: '',
  image_url: '',
  base_price: '',
  stock_quantity: '0',
  low_stock_threshold: '5',
  is_featured: false,
  is_popular: false,
  is_premium: false,
  is_active: true,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const getAdminKey = () => localStorage.getItem('kadal_admin_key') || '';

  const fetchProducts = async () => {
    const adminKey = getAdminKey();
    if (!adminKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'x-admin-key': adminKey },
      });

      if (!res.ok) {
        throw new Error('Failed to load products');
      }

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      slug: product.slug || '',
      category: product.category || '',
      type: product.type || '',
      description: product.description || '',
      image_url: product.image_url || '',
      base_price: String(product.base_price || ''),
      stock_quantity: String(product.catalog_inventory?.stock_quantity ?? 0),
      low_stock_threshold: String(product.catalog_inventory?.low_stock_threshold ?? 5),
      is_featured: Boolean(product.is_featured),
      is_popular: Boolean(product.is_popular),
      is_premium: Boolean(product.is_premium),
      is_active: Boolean(product.is_active),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (formLoading) return;
    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const updateForm = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'name' && !editingProduct) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  };

  const handleSave = async () => {
    const adminKey = getAdminKey();
    if (!adminKey) {
      toast.error('Admin authentication is missing');
      return;
    }

    if (!form.name.trim() || !form.slug.trim() || !form.category.trim() || !form.type.trim()) {
      toast.error('Name, slug, category, and type are required');
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      category: form.category.trim(),
      type: form.type.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      base_price: Number(form.base_price || 0),
      stock_quantity: Number(form.stock_quantity || 0),
      low_stock_threshold: Number(form.low_stock_threshold || 5),
      is_featured: form.is_featured,
      is_popular: form.is_popular,
      is_premium: form.is_premium,
      is_active: form.is_active,
    };

    if (Number.isNaN(payload.base_price) || payload.base_price < 0) {
      toast.error('Enter a valid price');
      return;
    }

    if (Number.isNaN(payload.stock_quantity) || payload.stock_quantity < 0) {
      toast.error('Enter a valid stock quantity');
      return;
    }

    setFormLoading(true);
    try {
      const endpoint = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PATCH' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save product');
      }

      toast.success(editingProduct ? 'Product updated' : 'Product created');
      closeModal();
      await fetchProducts();
    } catch (error) {
      console.error('Save product error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const adminKey = getAdminKey();
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete product');
      }

      toast.success('Product deleted');
      await fetchProducts();
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.slug.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Product Catalog</h1>
          <p className="mt-1 text-slate-500">Create, edit, stock, and publish products from the live catalog.</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="rounded-2xl bg-red-600 px-6 py-6 font-semibold text-white shadow-lg shadow-red-600/20 transition-all active:scale-95 hover:bg-red-700"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Product
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="group relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, slug, or category..."
            className="rounded-2xl border-slate-200 bg-white py-6 pl-11 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        <Button variant="outline" className="rounded-2xl border-slate-200 bg-white py-6">
          <Filter className="mr-2 h-4 w-4 text-slate-400" /> Live Catalog
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <p className="font-medium">Fetching your products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-slate-400">
            <Package className="h-16 w-16 opacity-20" />
            <p className="font-medium">No products found</p>
            <Button variant="link" onClick={() => setSearch('')} className="text-red-600">
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none text-slate-900">{product.name}</p>
                          <p className="mt-1 text-xs text-slate-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">Rs. {Number(product.base_price).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-700">
                          {product.catalog_inventory?.stock_quantity || 0} units
                        </p>
                        <div className="mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              (product.catalog_inventory?.stock_quantity || 0) < 5 ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((product.catalog_inventory?.stock_quantity || 0) * 4, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          product.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.is_active ? 'bg-green-600' : 'bg-slate-400'
                          }`}
                        />
                        {product.is_active ? 'Active' : 'Draft'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h2>
              <button onClick={closeModal} className="rounded-xl p-2 transition-colors hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="grid gap-4 overflow-y-auto p-6 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Product Name</label>
                <Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} className="rounded-xl py-6" />
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Slug</label>
                <Input value={form.slug} onChange={(e) => updateForm('slug', slugify(e.target.value))} className="rounded-xl py-6" />
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
                <Input value={form.category} onChange={(e) => updateForm('category', e.target.value)} className="rounded-xl py-6" />
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Type</label>
                <Input value={form.type} onChange={(e) => updateForm('type', e.target.value)} className="rounded-xl py-6" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Image URL</label>
                <Input value={form.image_url} onChange={(e) => updateForm('image_url', e.target.value)} className="rounded-xl py-6" />
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Price (Rs.)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.base_price}
                  onChange={(e) => updateForm('base_price', e.target.value)}
                  className="rounded-xl py-6"
                />
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Stock Quantity</label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={(e) => updateForm('stock_quantity', e.target.value)}
                  className="rounded-xl py-6"
                />
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">Low Stock Threshold</label>
                <Input
                  type="number"
                  min="0"
                  value={form.low_stock_threshold}
                  onChange={(e) => updateForm('low_stock_threshold', e.target.value)}
                  className="rounded-xl py-6"
                />
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 md:col-span-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Flags</p>
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    ['is_active', 'Active'],
                    ['is_featured', 'Featured'],
                    ['is_popular', 'Popular'],
                    ['is_premium', 'Premium'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form[key as keyof ProductForm] as boolean}
                        onChange={(e) => updateForm(key as keyof ProductForm, e.target.checked as never)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 p-6">
              <Button variant="ghost" onClick={closeModal} className="rounded-xl px-6">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={formLoading}
                className="rounded-xl bg-red-600 px-8 font-bold text-white hover:bg-red-700"
              >
                {formLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  'Save Product'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
