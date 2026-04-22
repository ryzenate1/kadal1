'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { fetchJson } from '@/lib/apiClient';

interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
}

type ApiCatalogProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
};

const fallbackCategories: Category[] = [
  { id: 'fresh-fish', name: 'Fresh Fish', image: '/images/fish/vangaram.jpg', href: '/categories' },
  { id: 'seafood', name: 'Seafood', image: '/images/fish/sea-prawn.webp', href: '/categories' },
  { id: 'premium-fish', name: 'Premium Fish', image: '/images/fish/sliced-vangaram.jpg', href: '/categories' },
];

const ShopByCategory = ({ className = '' }: { className?: string }) => {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchJson<{ products: ApiCatalogProduct[] }>('/api/catalog/products?limit=12', { authenticated: false });
        const mapped = (res.products || []).slice(0, 12).map((p) => ({
          id: p.id,
          name: p.name,
          image: p.image || '/images/fish/vangaram.jpg',
          href: `/product/${p.slug}`,
        }));
        if (mapped.length) setCategories(mapped);
      } catch {
        // Keep fallback cards
      }
    };
    void load();
  }, []);

  return (
    <div className={`w-full py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-1">Browse</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-sm text-gray-500 mt-1">Fresh seafood, delivered daily</p>
        </div>
        <Link
          href="/categories"
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 4-column grid on desktop, 3-col on mobile */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
        {categories.map(cat => (
          <Link key={cat.id} href={cat.href} className="group block">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                onError={e => { (e.target as HTMLImageElement).src = '/images/fish/vangaram.jpg'; }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              {/* Name */}
              <div className="absolute bottom-0 inset-x-0 p-2">
                <p className="text-white text-xs sm:text-sm font-semibold text-center leading-tight drop-shadow">
                  {cat.name}
                </p>
              </div>
              {/* Hover tint */}
              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors duration-200 rounded-2xl" />
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile view-all */}
      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 border border-red-200 px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
        >
          View All Categories <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </div>
  );
};

export default ShopByCategory;
