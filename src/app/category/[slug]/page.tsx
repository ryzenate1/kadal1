'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { fetchJson } from '@/lib/apiClient';
import { formatPrice } from '@/lib/formatPrice';

type Product = {
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
  stockQuantity?: number;
  lowStockThreshold?: number;
  inStock?: boolean;
};

// Maps URL slug → DB category value (exact match in catalog_products.category)
const CATEGORY_SLUG_MAP: Record<string, string> = {
  'fish': 'Fresh Fish',
  'fresh-fish': 'Fresh Fish',
  'seafood': 'Seafood',
  'dried-fish': 'Dried Fish',
  'fish-combo': 'Fish Combo',
  'premium': 'Premium Fish',
  'premium-fish': 'Premium Fish',
  'freshwater': 'Freshwater Fish',
  'freshwater-fish': 'Freshwater Fish',
};

// Maps URL slug → search query term for name-based lookup
const FISH_SLUG_SEARCH_MAP: Record<string, string> = {
  'vanjaram-fish': 'Vanjaram',
  'vanjaram': 'Vanjaram',
  'tuna': 'Tuna',
  'salmon': 'Salmon',
  'red-snapper': 'Red Snapper',
  'hilsa': 'Hilsa',
  'sea-bass': 'Sea Bass',
  'prawns': 'Prawn',
  'jumbo-prawns': 'Prawn',
  'crabs': 'Crab',
  'lobster': 'Lobster',
  'squid': 'Squid',
  'sardines': 'Sardine',
  'anchovies': 'Anchovy',
  'mackerel': 'Mackerel',
  'pomfret': 'Pomfret',
};

function slugToTitle(slug: string) {
  return slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let url = '';
        let title = '';

        if (CATEGORY_SLUG_MAP[slug]) {
          // Known category — filter by category field
          const cat = CATEGORY_SLUG_MAP[slug];
          url = `/api/catalog/products?category=${encodeURIComponent(cat)}&limit=48`;
          title = cat;
        } else if (FISH_SLUG_SEARCH_MAP[slug]) {
          // Known fish name — search by name
          const q = FISH_SLUG_SEARCH_MAP[slug];
          url = `/api/catalog/products?q=${encodeURIComponent(q)}&limit=48`;
          title = q;
        } else {
          // Unknown slug — try name search with the slug words
          const q = slugToTitle(slug);
          url = `/api/catalog/products?q=${encodeURIComponent(q)}&limit=48`;
          title = q;
        }

        setPageTitle(title);

        const response = await fetchJson<{ products: Product[] }>(url, { authenticated: false });
        setProducts(response?.products || []);
      } catch (error) {
        console.error('Failed to load category:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [slug]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [products, search]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/categories"
            className="rounded-full border border-gray-200 bg-white p-2 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pageTitle || slugToTitle(slug)}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${pageTitle || slugToTitle(slug)}...`}
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-200"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-16 shadow-sm gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <p className="text-gray-500 text-sm">Loading fresh catch...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">🐟</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-sm text-gray-500 mb-6">
              We couldn't find any fish in this category right now.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Browse all categories
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  addToCart,
}: {
  product: Product;
  addToCart: (item: any, qty: number) => void;
}) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    addToCart(
      {
        productId: product.id,
        name: product.name,
        src: product.image,
        image: product.image,
        type: product.type,
        price: product.price,
        omega3: 0,
        protein: 0,
        calories: 0,
        benefits: product.tags,
        bestFor: product.tags,
        rating: product.rating,
        description: product.description,
        quantity: 1,
      },
      1
    );
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/fish/${product.slug}`} className="block">
        <div className="relative h-52 bg-gray-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/fish/vangaram.jpg';
            }}
          />
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-1">{product.type}</p>
        <Link href={`/fish/${product.slug}`}>
          <h2 className="font-semibold text-gray-900 text-base leading-tight hover:text-red-600 transition-colors line-clamp-2 mb-1">
            {product.name}
          </h2>
        </Link>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>

        {/* Stock status */}
        <p
          className={`text-xs font-medium mb-3 ${
            !product.inStock
              ? 'text-red-600'
              : (product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 5)
              ? 'text-amber-600'
              : 'text-emerald-600'
          }`}
        >
          {!product.inStock
            ? 'Out of stock'
            : (product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 5)
            ? `Only ${product.stockQuantity} left`
            : 'In stock'}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <button
            disabled={!product.inStock || adding}
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 transition-colors"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
