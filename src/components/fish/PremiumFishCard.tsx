'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { FishProduct } from '@/data/additionalFishData';
import { getTamilNameForFish } from '@/data/fishNames';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface PremiumFishCardProps {
  fish: FishProduct;
  className?: string;
}

const PremiumFishCard: React.FC<PremiumFishCardProps> = ({ fish, className = '' }) => {
  const [selectedWeight, setSelectedWeight] = useState(
    fish.availableWeights.find(w => w.value === '500g') ?? fish.availableWeights[1] ?? fish.availableWeights[0]
  );
  const { addToCart } = useCart();
  const tamilName = getTamilNameForFish(fish.englishName, fish.tanglishName);

  const finalPrice = Math.round(fish.basePrice * selectedWeight.multiplier);

  const handleAddToCart = () => {
    addToCart({
      productId: fish.id,
      name: `${fish.tanglishName} (${fish.englishName})`,
      src: fish.imagePath,
      image: fish.imagePath,
      type: fish.type,
      price: finalPrice,
      omega3: parseFloat(fish.omega3.replace(/[^\d.]/g, '')) || 0,
      protein: parseFloat(fish.protein.replace(/[^\d.]/g, '')) || 0,
      calories: parseFloat(fish.calories.replace(/[^\d.]/g, '')) || 0,
      benefits: fish.tags,
      bestFor: fish.tags,
      rating: fish.rating,
      quantity: 1,
      netWeight: selectedWeight.label,
      grossWeight: selectedWeight.label,
    }, 1);
    toast.success(`${fish.tanglishName} added to cart!`);
  };

  return (
    <div className={`product-card flex flex-col h-full ${className}`}>
      {/* Image */}
      <Link href={`/product/${fish.slug}`} className="block relative h-44 sm:h-48 overflow-hidden rounded-t-2xl">
        <Image
          src={fish.imagePath}
          alt={`${fish.tanglishName} – ${fish.englishName}`}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
          quality={85}
          onError={e => { (e.target as HTMLImageElement).src = '/images/fish/vangaram.jpg'; }}
        />
        {(fish.isPremium || fish.isPopular) && (
          <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {fish.isPremium ? '⭐ Premium' : '🔥 Popular'}
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">

        {/* Name */}
        <Link href={`/product/${fish.slug}`} className="block mb-2.5">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug hover:text-red-600 transition-colors line-clamp-1">
            {fish.tanglishName}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">{fish.englishName}</p>
          {tamilName && tamilName !== fish.tanglishName && (
            <p className="text-[11px] text-gray-400 line-clamp-1">Tamil: {tamilName}</p>
          )}
        </Link>

        {/* Nutrition */}
        <div className="grid grid-cols-3 gap-1 mb-3">
          {[
            { label: 'Ω-3', value: fish.omega3 },
            { label: 'Protein', value: fish.protein },
            { label: 'Kcal', value: fish.calories.replace(' kcal', '') },
          ].map(n => (
            <div key={n.label} className="bg-red-50 rounded-xl p-1.5 text-center">
              <p className="text-xs font-bold text-red-600 leading-none">{n.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{n.label}</p>
            </div>
          ))}
        </div>

        {/* Rating + price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-3 h-3 ${i <= Math.round(fish.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
            <span className="text-xs text-gray-400 ml-1">({fish.rating})</span>
          </div>
          <span className="font-bold text-gray-900 text-base">₹{finalPrice}</span>
        </div>

        {/* Weight chips */}
        <div className="flex gap-1 flex-wrap mb-3">
          {fish.availableWeights.slice(0, 4).map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedWeight(opt)}
              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
                selectedWeight.value === opt.value
                  ? 'border-red-600 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-600 hover:border-red-300 bg-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default PremiumFishCard;
