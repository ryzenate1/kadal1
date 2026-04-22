'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface FeaturedProduct {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  slug: string;
  type: string;
  description: string;
  featured: boolean;
  price: number;
  weight: string;
  discount: number;
  tag?: string;
  isActive?: boolean;
  rating?: number;
}

const FALLBACK: FeaturedProduct[] = [
  { id: 'variety-fishes', name: 'Variety Fish Combo', image: '/images/fish/vareity-fishes.jpg', slug: 'variety-fishes', type: 'Combo', description: 'Curated selection of premium fish', featured: true, price: 999, weight: '1.2kg', discount: 10, tag: 'Best Value', rating: 4.8 },
  { id: 'vanjaram-whole', name: 'Vanjaram Fish', image: '/images/fish/vangaram.jpg', slug: 'vanjaram', type: 'Premium', description: 'Fresh Vanjaram, ideal for fry or curry', featured: true, price: 899, weight: '500g', discount: 15, tag: 'Popular', rating: 4.9 },
  { id: 'tuna-slices', name: 'Tuna Slices', image: '/images/fish/tuna-fish.jpg', slug: 'tuna-slices', type: 'Premium', description: 'Pre-cut tuna steaks, quick cooking', featured: true, price: 1199, weight: '500g', discount: 0, tag: 'New', rating: 4.6 },
  { id: 'big-prawns', name: 'Big Prawns', image: '/images/fish/big-prawn.webp', slug: 'big-prawns', type: 'Seafood', description: 'Jumbo prawns perfect for grilling', featured: true, price: 799, weight: '500g', discount: 8, tag: 'Fresh', rating: 4.7 },
  { id: 'fresh-lobster', name: 'Fresh Lobster', image: '/images/fish/lobster.jpg', slug: 'fresh-lobster', type: 'Seafood', description: 'Live lobster — the ultimate seafood', featured: true, price: 1299, weight: '1 pc', discount: 12, tag: 'Luxury', rating: 4.9 },
  { id: 'salmon', name: 'Salmon', image: '/images/fish/salmon.jpg', slug: 'salmon', type: 'Premium', description: 'Atlantic salmon rich in omega-3', featured: true, price: 1299, weight: '500g', discount: 5, tag: 'Healthy', rating: 4.9 },
];

const WEIGHTS = [
  { value: '250g', multiplier: 0.5 },
  { value: '500g', multiplier: 1 },
  { value: '1kg', multiplier: 2 },
];

const CARD_W = 220; // px — consistent on all viewports
const CARD_GAP = 16; // px

const FeaturedProducts = ({ adminData }: { adminData?: { title?: string; subtitle?: string } }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const [products, setProducts] = useState<FeaturedProduct[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [selWeights, setSelWeights] = useState<Record<string, string>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // init weight state from fallback
  useEffect(() => {
    const init: Record<string, string> = {};
    FALLBACK.forEach(p => { init[p.id] = '500g'; });
    setSelWeights(init);
  }, []);

  // fetch live products
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/featured-fish', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const items: FeaturedProduct[] = Array.isArray(data) ? data : (data.products ?? []);
          const active = items.filter(p => p.isActive !== false && p.featured !== false);
          if (active.length > 0) {
            setProducts(active);
            const init: Record<string, string> = {};
            active.forEach(p => { init[p.id] = '500g'; });
            setSelWeights(init);
          }
        }
      } catch { /* keep fallback */ }
      finally { setLoading(false); }
    })();
  }, []);

  // track scroll position to show/hide nav arrows
  const updateScrollState = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [products]);

  const scroll = (dir: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    // scroll by one card width + gap
    el.scrollBy({ left: dir === 'left' ? -(CARD_W + CARD_GAP) : (CARD_W + CARD_GAP), behavior: 'smooth' });
  };

  const getImage = (p: FeaturedProduct) =>
    p.imageUrl || p.image || '/images/fish/vangaram.jpg';

  const getPrice = (base: number, w: string) => {
    const opt = WEIGHTS.find(x => x.value === w);
    return Math.round(base * (opt?.multiplier ?? 1));
  };

  const handleAdd = (e: React.MouseEvent, p: FeaturedProduct) => {
    e.preventDefault(); e.stopPropagation();
    const w = selWeights[p.id] ?? '500g';
    addToCart({
      productId: p.id,
      name: p.name, src: getImage(p), image: getImage(p), type: p.type,
      price: getPrice(p.price, w),
      omega3: 0, protein: 0, calories: 0, benefits: [], bestFor: [],
      rating: p.rating ?? 4.5, quantity: 1,
      netWeight: w, grossWeight: w,
    }, 1);
    toast.success(`${p.name} added to cart!`);
  };

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  if (loading) {
    return (
      <section className="py-8 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-7 bg-gray-200 rounded-lg w-44 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-64 mb-6 animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[220px] h-[300px] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-0.5">Featured</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {adminData?.title ?? "Today's Fresh Catch"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {adminData?.subtitle ?? 'Freshest seafood, delivered within hours of catch'}
            </p>
          </div>

          {/* Arrow buttons — only show when there's overflow */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slider — consistent horizontal scroll on ALL viewport sizes */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-3"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
          }}
          onScroll={updateScrollState}
        >
          {products.map(p => {
            const w = selWeights[p.id] ?? '500g';
            const price = getPrice(p.price, w);
            const original = p.discount > 0 ? Math.round(price / (1 - p.discount / 100)) : null;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex-shrink-0"
                style={{ width: CARD_W, scrollSnapAlign: 'start' }}
              >
                {/* Image */}
                <Link href={`/product/${p.slug}`} className="block relative overflow-hidden"
                  style={{ height: 160 }}>
                  <Image
                    src={getImage(p)}
                    alt={p.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="220px"
                    priority={products.indexOf(p) < 3}
                    onError={e => { (e.target as HTMLImageElement).src = '/images/fish/vangaram.jpg'; }}
                  />
                  {p.tag && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {p.tag}
                    </span>
                  )}
                  {p.discount > 0 && (
                    <span className="absolute bottom-2 left-2 bg-green-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {p.discount}% OFF
                    </span>
                  )}
                  <button
                    onClick={e => toggleWishlist(e, p.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlist.has(p.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                  </button>
                </Link>

                {/* Body */}
                <div className="p-3 space-y-2">
                  <div>
                    <Link href={`/product/${p.slug}`}>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1 hover:text-red-600 transition-colors">
                        {p.name}
                      </h3>
                    </Link>
                    {p.rating && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-400">{p.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Weight selector */}
                  <select
                    value={w}
                    onChange={e => setSelWeights(prev => ({ ...prev, [p.id]: e.target.value }))}
                    onClick={e => e.stopPropagation()}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-400"
                  >
                    {WEIGHTS.map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
                  </select>

                  {/* Price + add */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-gray-900">₹{price}</span>
                      {original && <span className="text-xs text-gray-400 line-through">₹{original}</span>}
                    </div>
                    <button
                      onClick={e => handleAdd(e, p)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors shadow-sm"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
