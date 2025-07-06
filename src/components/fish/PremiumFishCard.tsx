'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, StarHalf } from 'lucide-react';
import { FishProduct } from '@/data/additionalFishData';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface PremiumFishCardProps {
  fish: FishProduct;
  className?: string;
}

const PremiumFishCard: React.FC<PremiumFishCardProps> = ({ fish, className = '' }) => {
  const [selectedWeight, setSelectedWeight] = useState(fish.availableWeights[1]); // Default to 500g
  const { addToCart } = useCart();

  const calculatePrice = (basePrice: number, multiplier: number) => {
    return Math.round(basePrice * multiplier);
  };

  const finalPrice = calculatePrice(fish.basePrice, selectedWeight.multiplier);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  const handleAddToCart = () => {
    const cartItem = {
      name: `${fish.tanglishName} (${fish.englishName})`,
      src: fish.imagePath,
      type: fish.type,
      price: finalPrice,
      omega3: parseFloat(fish.omega3.replace('g', '')),
      protein: parseFloat(fish.protein.replace('g', '')),
      calories: parseFloat(fish.calories.replace(' kcal', '')),
      benefits: fish.tags,
      bestFor: fish.tags,
      rating: fish.rating,
      description: fish.description,
      isPopular: fish.isPopular,
      serves: selectedWeight.value,
      quantity: 1,
      image: fish.imagePath
    };

    addToCart(cartItem);
    toast.success(`Added ${fish.tanglishName} to cart!`);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-300 transform hover:scale-[1.02] h-full flex flex-col ${className}`}>
      {/* Image Container - Larger and Higher Quality */}
      <Link href={`/product/${fish.slug}`} className="block">
        <div className="relative h-48 sm:h-52 overflow-hidden rounded-xl">
          <Image
            src={fish.imagePath}
            alt={`${fish.tanglishName} - ${fish.englishName}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            priority={false}
            quality={90}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/fish/vangaram.jpg'; // Fallback image
            }}
          />
          {/* Enhanced Badge - Premium styling */}
          {(fish.isPremium || fish.isPopular) && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              {fish.isPremium ? '⭐ PREMIUM' : '🔥 POPULAR'}
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Fish Names - Enhanced with more details */}
        <Link href={`/product/${fish.slug}`} className="block mb-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 line-clamp-1 hover:text-red-600 transition-colors">
            {fish.tanglishName}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
            ({fish.englishName})
          </p>
        </Link>

        {/* Nutritional Info Grid - Enhanced with more details */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="text-center p-1.5 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
            <div className="text-xs font-bold text-red-700">{fish.omega3}</div>
            <div className="text-xs text-gray-600">Ω-3</div>
          </div>
          <div className="text-center p-1.5 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
            <div className="text-xs font-bold text-red-700">{fish.protein}</div>
            <div className="text-xs text-gray-600">Protein</div>
          </div>
          <div className="text-center p-1.5 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
            <div className="text-xs font-bold text-red-700">{fish.calories}</div>
            <div className="text-xs text-gray-600">Cal</div>
          </div>
        </div>

        {/* Rating and Price - Enhanced Layout with prominent price */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1">
            {renderStars(fish.rating)}
            <span className="text-xs text-gray-600">({fish.rating})</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-green-600 text-lg sm:text-xl">₹{finalPrice}</span>
          </div>
        </div>

        {/* Weight Options - Enhanced and more prominent */}
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1.5">Weight Options:</p>
          <div className="flex gap-1.5 flex-wrap">
            {fish.availableWeights.slice(0, 3).map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedWeight(option)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  selectedWeight.value === option.value
                    ? 'bg-red-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Cart Button - Enhanced with more details */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm mt-auto transform hover:scale-[1.02]"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default PremiumFishCard;
