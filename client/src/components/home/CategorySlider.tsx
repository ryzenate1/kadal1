'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Fish, Shell, ShoppingCart, Check } from 'lucide-react';
import { SafeButton } from '@/components/ui/safe-button';
import { SafeHtmlButton } from '@/components/ui/safe-html-button';
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

interface WeightOption {
  value: string;
  label: string;
  multiplier: number;
}

// Animation variants
const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

// Fallback premium fish data
const weightOptions: WeightOption[] = [
  { value: '250g', label: '250g', multiplier: 0.5 },
  { value: '500g', label: '500g', multiplier: 1 },
  { value: '1kg', label: '1kg', multiplier: 2 },
  { value: '2kg', label: '2kg', multiplier: 3.8 }
];

// Premium fish collection
const premiumFishCollection: PremiumFish[] = [
  {
    id: 1,
    name: "Premium Vangaram Fish",
    image: "/images/fish/vangaram.jpg",
    slug: "premium-vangaram-fish",
    type: "Premium Fish",
    description: "Fresh whole Vangaram, premium quality for perfect curry or fry",
    basePrice: 1399,
    discountPrice: 899
  },
  {
    id: 2,
    name: "Vangaram Slices",
    image: "/images/fish/sliced-vangaram.jpg",
    slug: "premium-vangaram-slices",
    type: "Premium Fish",
    description: "Expertly sliced Vangaram, ready to cook, perfect thickness",
    basePrice: 1399,
    discountPrice: 899
  },
  {
    id: 3,
    name: "Big Prawns XL",
    image: "/images/fish/big-prawn.webp",
    slug: "premium-big-prawns",
    type: "Premium Seafood",
    description: "Jumbo-sized prawns, perfect for grilling or special recipes",
    basePrice: 1399,
    discountPrice: 899
  },
  {
    id: 4,
    name: "Blue Crabs Premium",
    image: "/images/fish/blue-crabs.jpg",
    slug: "premium-blue-crabs",
    type: "Premium Seafood",
    description: "Select large blue crabs, packed with rich meat",
    basePrice: 1399,
    discountPrice: 899
  },
  {
    id: 5,
    name: "Fresh Lobster XL",
    image: "/images/fish/lobster.jpg",
    slug: "premium-lobster",
    type: "Premium Seafood",
    description: "Large premium lobster, the ultimate seafood delicacy",
    basePrice: 1399,
    discountPrice: 899
  },
  {
    id: 6,
    name: "Fresh Squid Premium",
    image: "/images/fish/squid.jpg",
    slug: "premium-squid",
    type: "Premium Seafood",
    description: "Premium quality squid, perfect for frying or curry",
    basePrice: 1399,
    discountPrice: 899
  }
];

const CategorySlider = () => {
  const [premiumFish, setPremiumFish] = useState<PremiumFish[]>(premiumFishCollection);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart() || {};
  
  // For each product, store the selected weight
  const [selectedWeights, setSelectedWeights] = useState<{[key: string]: WeightOption}>({});

  // Client-side only media query detection
  useEffect(() => {
    setIsClient(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize selected weights
  useEffect(() => {
    const initialWeights: {[key: string]: WeightOption} = {};
    premiumFish.forEach(fish => {
      initialWeights[fish.id.toString()] = weightOptions[1]; // Default to 500g
    });
    setSelectedWeights(initialWeights);
  }, [premiumFish]);

  // Helper function to get image URL with fallback
  const getImageUrl = (item: PremiumFish): string => {
    if (!item) return "/images/fish/vangaram.jpg";

    if (item.image) {
      if (item.image.startsWith('http')) {
        return item.image;
      } else {
        const localImagePath = item.image.startsWith('/') ? item.image : `/${item.image}`;
        return localImagePath;
      }
    }

    return "/images/fish/vangaram.jpg";
  };

  // Get icon component based on category type
  const getIconComponent = (itemType: string | undefined) => {
    if (!itemType) return <Fish className="w-4 h-4" />;
    
    const type = itemType.toLowerCase();
    if (type.includes('prawn') || type.includes('crab') || type.includes('shell') || type.includes('lobster')) {
      return <Shell className="w-4 h-4" />;
    }
    
    return <Fish className="w-4 h-4" />;
  };

  // Handle weight selection
  const handleWeightChange = (fishId: string | number, option: WeightOption) => {
    setSelectedWeights(prev => ({
      ...prev,
      [fishId.toString()]: option
    }));
  };

  // Calculate price based on weight
  const calculatePrice = (basePrice: number, multiplier: number) => {
    return Math.round(basePrice * multiplier);
  };

  // Add to cart functionality
  const handleAddToCart = (fish: PremiumFish) => {
    if (!addToCart) {
      console.error('addToCart function is not available');
      toast.error('Shopping cart is not available');
      return;
    }
    
    const selectedWeight = selectedWeights[fish.id.toString()] || weightOptions[1];
    const finalPrice = calculatePrice(fish.discountPrice, selectedWeight.multiplier);
    const originalPrice = calculatePrice(fish.basePrice, selectedWeight.multiplier);
    
    try {
      const cartItem = {
        id: fish.id.toString(),
        name: `${fish.name} (${selectedWeight.label})`,
        src: getImageUrl(fish),
        type: fish.type || 'Premium', 
        price: finalPrice,
        originalPrice: originalPrice,
        omega3: 0,
        protein: 0,
        calories: 0,
        benefits: ['Premium', 'Fresh', 'High Quality'],
        bestFor: ['Special Occasions', 'Premium Recipes'],
        rating: 4.9,
        description: fish.description || '',
        quantity: 1,
        addedAt: new Date(),
        netWeight: selectedWeight.label,
        grossWeight: selectedWeight.label
      };
      
      addToCart(cartItem);
      toast.success(`${fish.name} (${selectedWeight.label}) added to cart!`, {
        description: `₹${finalPrice} • ${selectedWeight.label}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Scroll functions for mobile
  const scrollLeft = () => {
    if (sliderRef && sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef && sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Initialize premium fish data
  useEffect(() => {
    // We're using our predefined premium collection, so just simulate loading
    setLoading(true);
    setTimeout(() => {
      setPremiumFish(premiumFishCollection);
      setLoading(false);
    }, 300);
  }, []);

  if (loading) {
    return (
      <div className="w-full py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse flex space-x-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[260px]">
                <div className="bg-gray-200 rounded-xl h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-heading mb-2">
              Premium Collections
            </h2>
            <p className="text-body">
              Explore our premium selection of high-quality seafood
            </p>
          </div>
          
          {/* Navigation Buttons - Hidden on Mobile */}
          {isClient && !isMobile && (
            <div className="flex gap-2">
              <SafeHtmlButton 
                onClick={scrollLeft}
                className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </SafeHtmlButton>
              <SafeHtmlButton 
                onClick={scrollRight}
                className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </SafeHtmlButton>
            </div>
          )}
        </div>
        
        {/* Mobile Navigation Controls */}
        {isClient && isMobile && (
          <div className="flex justify-between items-center mb-4 px-2">
            <SafeHtmlButton 
              onClick={scrollLeft}
              className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </SafeHtmlButton>
            <span className="text-sm text-gray-500">Swipe to explore</span>
            <SafeHtmlButton 
              onClick={scrollRight}
              className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </SafeHtmlButton>
          </div>
        )}
        
        {/* Premium Fish Slider */}
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory gap-4"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory'
          }}
        >
          {premiumFish.map((fish, index) => {
            const selectedWeight = selectedWeights[fish.id.toString()] || weightOptions[1];
            const finalPrice = calculatePrice(fish.discountPrice, selectedWeight.multiplier);
            const originalPrice = calculatePrice(fish.basePrice, selectedWeight.multiplier);
            
            return (
              <motion.div 
                key={fish.id} 
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                custom={index}
                className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="card-base overflow-hidden h-full hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="relative h-40 sm:h-44">
                    <Image 
                      src={getImageUrl(fish)}
                      alt={fish.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform hover:scale-105 duration-300"
                      sizes="(max-width: 640px) 280px, 320px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/fish/vangaram.jpg";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-primary-accent text-white text-xs font-bold px-2 py-1 rounded-md">
                      PREMIUM
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-subheading line-clamp-1">{fish.name}</h3>
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-xs">
                        {getIconComponent(fish.type)}
                        <span>{fish.type || 'Premium'}</span>
                      </div>
                    </div>
                    
                    <p className="text-small line-clamp-2 mb-3">
                      {fish.description || `Premium ${fish.name} selection`}
                    </p>
                    
                    {/* Weight Options */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex gap-1">
                        {weightOptions.map((option) => (
                          <SafeHtmlButton
                            key={option.value}
                            onClick={() => handleWeightChange(fish.id, option)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              selectedWeight.value === option.value
                                ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-400'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {option.label}
                          </SafeHtmlButton>
                        ))}
                      </div>
                    </div>
                    
                    {/* Price Display - Enhanced */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-success text-lg sm:text-xl">₹{finalPrice}</span>
                        <span className="text-xs text-muted line-through">₹{originalPrice}</span>
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        {Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}% OFF
                      </span>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <SafeButton
                      onClick={() => handleAddToCart(fish)}
                      className="btn-base btn-primary w-full text-sm py-2"
                      size="sm"
                      variant="default"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      Add to Cart
                    </SafeButton>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;
