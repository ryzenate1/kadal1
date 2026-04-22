'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Heart, Share2, Star, Minus, Plus, ShoppingCart, Loader2, Shield, Clock, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { fishProducts } from '@/data/additionalFishData';
import { getTamilNameForFish } from '@/data/fishNames';
import MacroCalculator from '@/components/fish/MacroCalculator';

type WeightOption = { value: string; label: string; multiplier: number };

const SLUG_ALIASES: Record<string, string> = {
  squid: 'fresh-squid',
  kanava: 'fresh-squid',
};

function slugToQuery(slug: string) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeKey(value: string) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

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
  omega3?: string | null;
  protein?: string | null;
  calories?: string | null;
  tags: string[];
  availableWeights?: WeightOption[];
  popular?: boolean;
  premium?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  inStock?: boolean;
};

// ── Fallback: resolve the product directly from the bundled data ──────────────
// This fires when the API is unreachable or returns an error, so the page
// still works even without a DB connection.
function resolveFromLocal(slug: string): CatalogProduct | null {
  const p = fishProducts.find(f => f.slug === slug || f.id === slug);
  if (!p) return null;
  return {
    id: p.id,
    slug: p.slug,
    name: `${p.tanglishName} (${p.englishName})`,
    category: p.type,
    type: p.type,
    description: p.description,
    image: p.imagePath,
    price: p.basePrice,
    rating: p.rating,
    omega3: p.omega3,
    protein: p.protein,
    calories: p.calories,
    tags: p.tags,
    availableWeights: p.availableWeights,
    popular: p.isPopular,
    premium: p.isPremium,
    stockQuantity: 25,
    lowStockThreshold: 5,
    inStock: true,
  };
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const resolvedSlug = SLUG_ALIASES[slug] || slug;
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const [gymPromptShown, setGymPromptShown] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    // 1️⃣ Try the API first
    try {
      const slugCandidates = Array.from(new Set([resolvedSlug, slug]));
      for (const candidate of slugCandidates) {
        const res = await fetch(
          `/api/catalog/products?slug=${encodeURIComponent(candidate)}&limit=1`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          const data = await res.json() as { products: CatalogProduct[] };
          const p = data.products[0] ?? null;
          if (p) {
            setProduct(p);
            if (p.availableWeights?.length) {
              const def = p.availableWeights.find(w => w.value === '500g') ?? p.availableWeights[0];
              setSelectedWeight(def);
            }
            setLoading(false);
            return;
          }
        }
      }

      // 2️⃣ Generic fallback for renamed/alternate slugs:
      // Search by slug words and pick best matching card from DB.
      const query = slugToQuery(slug);
      if (query) {
        const searchRes = await fetch(
          `/api/catalog/products?q=${encodeURIComponent(query)}&limit=12`,
          { cache: 'no-store' }
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json() as { products: CatalogProduct[] };
          const candidates = searchData.products || [];
          if (candidates.length) {
            const target = normalizeKey(slug);
            const best =
              candidates.find((item) => normalizeKey(item.slug) === target) ||
              candidates.find((item) => normalizeKey(item.id) === target) ||
              candidates.find((item) => normalizeKey(item.name).includes(target)) ||
              candidates[0];

            setProduct(best);
            if (best.availableWeights?.length) {
              const def = best.availableWeights.find(w => w.value === '500g') ?? best.availableWeights[0];
              setSelectedWeight(def);
            }
            setLoading(false);
            return;
          }
        }
      }
    } catch (networkErr) {
      console.error('[ProductDetailPage] fetch failed:', networkErr);
      setApiError('Network error — could not reach server');
    }

    // 2️⃣ Fallback: serve directly from bundled JS data
    const local = resolveFromLocal(resolvedSlug);
    if (local) {
      setProduct(local);
      if (local.availableWeights?.length) {
        const def = local.availableWeights.find(w => w.value === '500g') ?? local.availableWeights[0];
        setSelectedWeight(def);
      }
    } else {
      setProduct(null);
    }
    setLoading(false);
  }, [resolvedSlug]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!product || gymPromptShown) return;
    const timer = window.setTimeout(() => {
      toast.message('Are you a gym bro ordering?', {
        description: 'We have a macro calculator to make your day easier, bro.',
        action: {
          label: 'View Macro Calculator',
          onClick: () => {
            const el = document.getElementById('macro-calculator-section');
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          },
        },
      });
      setGymPromptShown(true);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [product, gymPromptShown]);

  const currentPrice = product
    ? Math.round(product.price * (selectedWeight?.multiplier ?? 1))
    : 0;

  const handleAddToCart = () => {
    if (!product) return;
    setIsAddingToCart(true);
    setTimeout(() => {
      addToCart({
        productId: product.id,
        name: product.name,
        src: product.image,
        image: product.image,
        type: product.type || product.category,
        price: currentPrice,
        omega3: Number.parseFloat(String(product.omega3 ?? '0').replace(/[^\d.]/g, '')) || 0,
        protein: Number.parseFloat(String(product.protein ?? '0').replace(/[^\d.]/g, '')) || 0,
        calories: Number.parseFloat(String(product.calories ?? '0').replace(/[^\d.]/g, '')) || 0,
        benefits: product.tags || [],
        bestFor: product.tags || [],
        rating: product.rating || 4.5,
        quantity,
        netWeight: selectedWeight?.label ?? '500g',
        grossWeight: selectedWeight?.label ?? '500g',
      }, quantity);
      toast.success(`${product.name} added to cart`);
      setIsAddingToCart(false);
    }, 500);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefbfb]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div className="bg-gray-200 rounded-3xl aspect-square" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-xl w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-12 bg-gray-200 rounded-xl w-1/3" />
              <div className="h-24 bg-gray-200 rounded-2xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-[#fefbfb] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🐟</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          {apiError && (
            <p className="text-xs text-red-500 mb-2 font-mono bg-red-50 rounded px-3 py-1 inline-block">
              {apiError}
            </p>
          )}
          <p className="text-gray-500 mb-6">This product may be temporarily unavailable.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-5 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = !product.inStock
    ? { label: 'Out of stock', cls: 'bg-red-100 text-red-700' }
    : (product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 5)
      ? { label: `Only ${product.stockQuantity} left`, cls: 'bg-amber-100 text-amber-700' }
      : { label: 'In stock', cls: 'bg-emerald-100 text-emerald-700' };
  const tamilName = getTamilNameForFish(product.name, product.name.split('(')[0]?.trim());

  return (
    <div className="min-h-screen bg-[#fefbfb]">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/categories"
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center transition-colors"
            >
              <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            </button>
            <button
              onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 flex items-center justify-center transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* API error banner — visible when we fell back to local data */}
      {apiError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-xs text-amber-700">
            ⚠️ Showing cached data — {apiError}.{' '}
            <button onClick={() => void load()} className="underline font-medium">Retry</button>
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">

          {/* ── IMAGE ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-lg border border-gray-100 aspect-square max-w-lg mx-auto">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain bg-white"
                priority
                quality={100}
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.premium && (
                  <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    ⭐ Premium
                  </span>
                )}
                {product.popular && (
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    🔥 Popular
                  </span>
                )}
              </div>
              <div className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full ${stockStatus.cls}`}>
                {stockStatus.label}
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: <Shield className="w-4 h-4 text-red-600" />, label: 'Fresh Guarantee' },
                { icon: <Clock className="w-4 h-4 text-red-600" />, label: '45 min Delivery' },
                { icon: <Zap className="w-4 h-4 text-red-600" />, label: 'Daily Catch' },
              ].map(b => (
                <div key={b.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center gap-1 text-center">
                  {b.icon}
                  <span className="text-xs text-gray-600 font-medium leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── DETAILS ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-5"
          >
            <div>
              <p className="text-sm font-medium text-red-600 uppercase tracking-wide mb-1">{product.category}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              {tamilName && (
                <p className="text-sm font-medium text-gray-600 mt-1">{tamilName}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{product.rating.toFixed(1)} / 5</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">₹{currentPrice}</span>
                <span className="text-sm text-gray-400">/ {selectedWeight?.label ?? '500g'}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes • Free delivery above ₹499</p>
            </div>

            {/* Weight selector */}
            {product.availableWeights && product.availableWeights.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Select Weight</p>
                <div className="flex flex-wrap gap-2">
                  {product.availableWeights.map(w => (
                    <button
                      key={w.value}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        selectedWeight?.value === w.value
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-red-400 transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="w-8 text-center text-lg font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-red-400 transition-colors disabled:opacity-40"
                  disabled={quantity >= 10}
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm text-gray-500 ml-2">Total: ₹{currentPrice * quantity}</span>
              </div>
            </div>

            {/* Add to cart */}
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.inStock === false}
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isAddingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {isAddingToCart
                ? 'Adding…'
                : product.inStock !== false
                  ? `Add to Cart — ₹${currentPrice * quantity}`
                  : 'Out of Stock'}
            </Button>

            {/* Nutrition */}
            <div id="macro-calculator-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Nutrition per 100g</p>
                <p className="text-xs text-gray-500 mt-0.5">Use the calculator below for your serving size.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Omega-3', value: product.omega3 },
                  { label: 'Protein', value: product.protein },
                  { label: 'Calories', value: product.calories },
                ].map((n) => (
                  <div key={n.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-base font-bold text-gray-900">{n.value || '—'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{n.label}</div>
                  </div>
                ))}
              </div>

              <MacroCalculator
                omega3Per100g={String(product.omega3 || '0')}
                proteinPer100g={String(product.protein || '0')}
                caloriesPer100g={String(product.calories || '0')}
              />
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Description */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3">About This Product</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </motion.div>
        )}
      </div>

    </div>
  );
}
