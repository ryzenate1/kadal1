'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Search, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';

import { fetchJson } from '@/lib/apiClient';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  type: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  tags: string[];
  featured?: boolean;
  premium?: boolean;
  inStock?: boolean;
};

export default function CategoriesPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchJson<{ products: CatalogProduct[] }>('/api/catalog/products?limit=300', { authenticated: false });
        setProducts(res.products || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const categories = useMemo(() => {
    const uniq = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ['all', ...uniq];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (!q) return true;
      return [p.name, p.type, p.description, ...(p.tags || [])].join(' ').toLowerCase().includes(q);
    });
  }, [products, search, categoryFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Fresh Seafood Collection</h1>
          <p className="text-sm text-gray-500 mt-1">Live catalog data from admin fish cards.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-6">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fish..."
              className="w-full h-11 pl-10 pr-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  categoryFilter === c ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            <p className="text-sm text-gray-500">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
            No fish cards found for this filter.
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} products</p>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <div key={product.id} className="group rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <Link href={`/fish/${product.slug}`} className="block relative h-52 bg-gray-100">
                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-red-600 font-semibold uppercase">{product.type}</p>
                    <Link href={`/fish/${product.slug}`} className="block">
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                      <button
                        onClick={() => {
                          addToCart(
                            {
                              name: product.name,
                              src: product.image,
                              image: product.image,
                              type: product.type,
                              price: product.price,
                              omega3: 0,
                              protein: 0,
                              calories: 0,
                              benefits: product.tags || [],
                              bestFor: product.tags || [],
                              rating: product.rating || 4,
                              quantity: 1,
                            },
                            1
                          );
                          toast.success(`${product.name} added to cart`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
