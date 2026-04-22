'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Fish, Shell, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';

interface PremiumFish {
  id: string | number;
  name: string;
  slug: string;
  image: string;
  type?: string;
  description?: string;
  basePrice: number;
  discountPrice: number;
}

interface WeightOption { value: string; label: string; multiplier: number; }

const WEIGHTS: WeightOption[] = [
  { value: '250g', label: '250g', multiplier: 0.5 },
  { value: '500g', label: '500g', multiplier: 1 },
  { value: '1kg',  label: '1kg',  multiplier: 2 },
  { value: '2kg',  label: '2kg',  multiplier: 3.8 },
];

const FISH_LIST: PremiumFish[] = [
  { id: 1, name: 'Vanjaram Fish',       image: '/images/fish/vangaram.jpg',       slug: 'vanjaram',       type: 'Premium Fish',  description: 'Fresh whole Vanjaram, perfect for curry or fry',     basePrice: 1399, discountPrice: 899  },
  { id: 2, name: 'Vanjaram Slices',     image: '/images/fish/sliced-vangaram.jpg', slug: 'sliced-vanjaram', type: 'Premium Fish',  description: 'Pre-sliced Vanjaram, ready to cook',                 basePrice: 1399, discountPrice: 949  },
  { id: 3, name: 'Tuna Slices',         image: '/images/fish/tuna-fish.jpg',       slug: 'tuna-slices',    type: 'Premium Fish',  description: 'Pre-cut tuna steaks, quick cooking',                  basePrice: 1499, discountPrice: 1199 },
  { id: 4, name: 'Big Prawns XL',       image: '/images/fish/big-prawn.webp',      slug: 'big-prawns',     type: 'Seafood',       description: 'Jumbo prawns, perfect for grilling',                 basePrice: 1399, discountPrice: 899  },
  { id: 5, name: 'Blue Crabs',          image: '/images/fish/blue-crabs.jpg',      slug: 'blue-crabs',     type: 'Seafood',       description: 'Large blue crabs packed with rich meat',              basePrice: 1399, discountPrice: 899  },
  { id: 6, name: 'Fresh Lobster',       image: '/images/fish/lobster.jpg',         slug: 'fresh-lobster',  type: 'Seafood',       description: 'Premium whole lobster, the ultimate delicacy',       basePrice: 2599, discountPrice: 1899 },
  { id: 7, name: 'Salmon',              image: '/images/fish/salmon.jpg',          slug: 'salmon',         type: 'Premium Fish',  description: 'Atlantic salmon, rich in omega-3',                   basePrice: 1599, discountPrice: 1299 },
  { id: 8, name: 'Fresh Squid',         image: '/images/fish/squid.jpg',           slug: 'squid',          type: 'Seafood',       description: 'Premium quality squid, perfect for fry or curry',    basePrice: 1199, discountPrice: 899  },
];

const CARD_W = 240;
const CARD_GAP = 16;

const CategorySlider = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart() || {};
  const [selWeights, setSelWeights] = useState<Record<string, WeightOption>>({});
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    const init: Record<string, WeightOption> = {};
    FISH_LIST.forEach(f => { init[String(f.id)] = WEIGHTS[1]; });
    setSelWeights(init);
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
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    sliderRef.current?.scrollBy({
      left: dir === 'left' ? -(CARD_W + CARD_GAP) : (CARD_W + CARD_GAP),
      behavior: 'smooth',
    });
  };

  const calcPrice = (base: number, m: number) => Math.round(base * m);

  const handleAdd = (fish: PremiumFish) => {
    if (!addToCart) return;
    const w = selWeights[String(fish.id)] ?? WEIGHTS[1];
    const price = calcPrice(fish.discountPrice, w.multiplier);
    try {
      addToCart({
        name: `${fish.name} (${w.label})`,
        src: fish.image,
        type: fish.type ?? 'Premium',
        price,
        originalPrice: calcPrice(fish.basePrice, w.multiplier),
        omega3: 0, protein: 0, calories: 0,
        benefits: ['Premium', 'Fresh'],
        bestFor: ['Special Occasions'],
        rating: 4.9,
        quantity: 1,
        netWeight: w.label, grossWeight: w.label,
      }, 1);
      toast.success(`${fish.name} (${w.label}) added to cart!`);
    } catch { toast.error('Failed to add item to cart'); }
  };

  return (
    <div className="w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-0.5">Our Best</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Premium Collections</h2>
            <p className="text-sm text-gray-500 mt-0.5">Hand-picked, freshest seafood daily</p>
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

        {/* Slider — same behaviour on all viewports */}
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
          {FISH_LIST.map(fish => {
            const w = selWeights[String(fish.id)] ?? WEIGHTS[1];
            const price    = calcPrice(fish.discountPrice, w.multiplier);
            const original = calcPrice(fish.basePrice, w.multiplier);
            const discount = Math.round(((original - price) / original) * 100);
            const isSeafood = fish.type?.toLowerCase().includes('seafood');

            return (
              <div
                key={fish.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex-shrink-0"
                style={{ width: CARD_W, scrollSnapAlign: 'start' }}
              >
                {/* Image */}
                <Link href={`/product/${fish.slug}`} className="block relative overflow-hidden" style={{ height: 160 }}>
                  <Image
                    src={fish.image} alt={fish.name} fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="240px"
                    onError={e => { (e.target as HTMLImageElement).src = '/images/fish/vangaram.jpg'; }}
                  />
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {discount}% OFF
                    </span>
                  )}
                  <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-gray-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    {isSeafood ? <Shell className="w-2.5 h-2.5" /> : <Fish className="w-2.5 h-2.5" />}
                    {fish.type}
                  </span>
                </Link>

                {/* Body */}
                <div className="p-3 space-y-2.5">
                  <Link href={`/product/${fish.slug}`}>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1 hover:text-red-600 transition-colors">
                      {fish.name}
                    </h3>
                  </Link>

                  {/* Weight chips */}
                  <div className="flex gap-1">
                    {WEIGHTS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelWeights(prev => ({ ...prev, [String(fish.id)]: opt }))}
                        className={`px-1.5 py-0.5 rounded-lg text-[10px] font-medium border transition-all ${
                          w.value === opt.value
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Price + cart */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">₹{price}</span>
                      <span className="text-xs text-gray-400 line-through ml-1">₹{original}</span>
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;
