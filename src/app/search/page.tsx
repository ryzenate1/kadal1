'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { fetchJson } from '@/lib/apiClient';
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
  stockQuantity?: number;
  lowStockThreshold?: number;
  inStock?: boolean;
};

function SearchPageInner() {
  const params = useSearchParams();
  const query = params.get('q')?.trim() || '';
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchJson<{ products: CatalogProduct[] }>(
          `/api/catalog/products?limit=48${query ? `&q=${encodeURIComponent(query)}` : ''}`,
          { authenticated: false }
        );
        setProducts(data.products);
      } catch (error) {
        console.error('Search failed:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, [query]);

  const emptyMessage = useMemo(() => {
    if (query) return `No products matched "${query}".`;
    return 'No products available right now.';
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {query ? `Search results for "${query}"` : 'Browse products'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {loading ? 'Searching catalog...' : `${products.length} product${products.length === 1 ? '' : 's'} found`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl bg-white p-16 shadow-sm">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
            <Search className="mx-auto mb-4 h-10 w-10 text-gray-300" />
            <p className="text-gray-700">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <Link href={`/fish/${product.slug}`} className="block">
                  <div className="relative h-56 bg-gray-100">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                    {product.category}
                  </p>
                  <Link href={`/fish/${product.slug}`} className="mt-1 block">
                    <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">{product.name}</h2>
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                  <p
                    className={`mt-2 text-xs font-medium ${
                      product.inStock
                        ? (product.stockQuantity || 0) <= (product.lowStockThreshold || 5)
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                        : 'text-red-700'
                    }`}
                  >
                    {!product.inStock
                      ? 'Out of stock'
                      : (product.stockQuantity || 0) <= (product.lowStockThreshold || 5)
                        ? `Low stock: ${product.stockQuantity} left`
                        : 'In stock'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="mr-1 h-4 w-4 fill-current text-amber-400" />
                        {product.rating.toFixed(1)}
                      </div>
                    </div>
                    <Button
                      disabled={!product.inStock}
                      onClick={() => {
                        addToCart(
                          {
                            productId: product.id,
                            name: product.name,
                            src: product.image,
                            image: product.image,
                            type: product.type,
                            price: product.price,
                            quantity: 1,
                            omega3: 0,
                            protein: 0,
                            calories: 0,
                            benefits: product.tags,
                            bestFor: product.tags,
                            rating: product.rating,
                          },
                          1
                        );
                        toast.success(`${product.name} added to cart`);
                      }}
                      className="disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading search...
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
