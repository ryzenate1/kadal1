'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingCart, Fish, Shell } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

interface FeaturedFish {
  id: string | number;
  name: string;
  slug: string;
  image: string;
  type?: string;
  description?: string;
  price?: number;
  weight?: string;
  discount?: number;
  isActive?: boolean;
}

const FALLBACK: FeaturedFish[] = [
  { id: 101, name: 'Premium Fish Combo', image: '/images/fish/vareity-fishes.jpg', slug: 'variety-fishes',  type: 'Combo',   description: 'Curated selection of premium varieties', price: 999,  weight: '1.2kg', discount: 10 },
  { id: 102, name: 'Vanjaram Fish',       image: '/images/fish/vangaram.jpg',       slug: 'vanjaram',       type: 'Premium', description: 'Fresh Vanjaram, perfect for fry or curry', price: 899,  weight: '500g',  discount: 15 },
  { id: 103, name: 'Tuna Slices',         image: '/images/fish/tuna-fish.jpg',       slug: 'tuna-slices',   type: 'Premium', description: 'Pre-cut tuna steaks, quick cooking',      price: 1199, weight: '500g',  discount: 0  },
  { id: 104, name: 'Big Prawns',          image: '/images/fish/big-prawn.webp',      slug: 'big-prawns',    type: 'Seafood', description: 'Jumbo prawns, perfect for grilling',     price: 799,  weight: '500g',  discount: 8  },
  { id: 105, name: 'Fresh Lobster',       image: '/images/fish/lobster.jpg',         slug: 'fresh-lobster', type: 'Seafood', description: 'Live lobster — the ultimate delicacy',   price: 1299, weight: '1 pc',  discount: 12 },
];

const CARD_W  = 220;
const CARD_GAP = 16;

interface CategoriesProps {
  adminData?: { title?: string; subtitle?: string; categories?: unknown[] };
}

const Categories: React.FC<CategoriesProps> = ({ adminData }) => {
  const [featured, setFeatured] = useState<FeaturedFish[]>(FALLBACK);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart() || {};
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/featured-fish', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const items: FeaturedFish[] = Array.isArray(data) ? data : (data.products ?? []);
        const active = items.filter(f => (f as any).isActive !== false);
        if (active.length > 0) setFeatured(active);
      } catch { /* keep fallback */ }
    })();
  }, []);

  const updateNav = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateNav();
    el.addEventListener('scroll', updateNav, { passive: true });
    return () => el.removeEventListener('scroll', updateNav);
  }, [featured]);

  const scroll = (dir: 'left' | 'right') => {
    sliderRef.current?.scrollBy({
      left: dir === 'left' ? -(CARD_W + CARD_GAP) : (CARD_W + CARD_GAP),
      behavior: 'smooth',
    });
  };

  const handleAdd = (fish: FeaturedFish) => {
    if (!addToCart) return;
    addToCart({
      name: fish.name, src: fish.image,
      type: fish.type ?? 'Fish', price: fish.price ?? 0,
      omega3: 0, protein: 0, calories: 0, benefits: [], bestFor: [],
      rating: 4.5, quantity: 1,
      netWeight: fish.weight ?? '500g', grossWeight: fish.weight ?? '500g',
    }, 1);
    toast.success(`${fish.name} added to cart!`);
  };

  const title    = adminData?.title    ?? "Today's Fresh Catch";
  const subtitle = adminData?.subtitle ?? 'Premium seafood delivered within hours of catch';

  return (
    <section className="py-8 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-0.5">Fresh Daily</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5 max-w-sm">{subtitle}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => scroll('left')} disabled={!canLeft}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll left">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll('right')} disabled={!canRight}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll right">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-3"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
          }}
          onScroll={updateNav}
        >
          {featured.map(fish => (
            <div
              key={fish.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex-shrink-0 group"
              style={{ width: CARD_W, scrollSnapAlign: 'start' }}
            >
              <Link href={`/product/${fish.slug}`} className="block relative overflow-hidden" style={{ height: 150 }}>
                <Image
                  src={fish.image} alt={fish.name} fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="220px"
                  onError={e => { (e.target as HTMLImageElement).src = '/images/fish/vangaram.jpg'; }}
                />
                {fish.discount && fish.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {fish.discount}% OFF
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-gray-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  {fish.type?.toLowerCase().includes('seafood') || fish.type?.toLowerCase().includes('prawn')
                    ? <Shell className="w-2.5 h-2.5" />
                    : <Fish className="w-2.5 h-2.5" />}
                  {fish.type}
                </span>
              </Link>

              <div className="p-3 space-y-2">
                <Link href={`/product/${fish.slug}`}>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-red-600 transition-colors">
                    {fish.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{fish.description}</p>
                <div className="flex items-center justify-between pt-0.5">
                  <div>
                    <span className="font-bold text-gray-900">₹{fish.price}</span>
                    {fish.weight && <span className="text-xs text-gray-400 ml-1">/{fish.weight}</span>}
                  </div>
                  <button
                    onClick={() => handleAdd(fish)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
