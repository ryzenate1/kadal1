'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Share2, Star, Minus, Plus, ShoppingCart, Clock, Zap, ShieldCheck, Loader2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAnimatedInView, fadeInUp, fadeIn, slideInLeft, slideInRight } from '@/hooks/useAnimatedInView';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { AnimatedElement, AnimatedHeading, AnimatedCard } from '@/components/ui/animated-element';
import MacroCalculator from '@/components/fish/MacroCalculator';

// Define the Fish interface
export interface Fish {
  id: string;
  name: string;
  src: string;
  type: string;
  price: number;
  omega3: number;
  protein: number;
  calories: number;
  benefits: string[];
  bestFor: string[];
  rating: number;
  description?: string;
  isPopular?: boolean;
  serves?: string;
  netWeight?: string;
  grossWeight?: string;
  originalPrice?: number;
}

interface FishDetailPageProps {
  fish: Fish;
  backLink?: string;
  backLinkText?: string;
}

const FishDetailPage: React.FC<FishDetailPageProps> = ({ 
  fish, 
  backLink = "/category/fish-combo", 
  backLinkText = "Back to Fish Combos" 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMacroCalculator, setShowMacroCalculator] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();

  // Show macro calculator toast on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.info('💪 Try our macro calculator to track your nutrition goals!', {
        duration: 5000,
        action: {
          label: 'Open Calculator',
          onClick: () => setShowMacroCalculator(true),
        },
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const increment = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    // Create a cart item with all required properties
    const cartItem = {
      ...fish,
      id: fish.id.toString(),
      quantity,
      addedAt: new Date(),
      price: fish.price,
      name: fish.name,
      // Ensure all required CartItem properties are included
      type: fish.type || 'fish',
      omega3: fish.omega3 || 0,
      protein: fish.protein || 0,
      calories: fish.calories || 0,
      benefits: fish.benefits || [],
      bestFor: fish.bestFor || [],
      rating: fish.rating || 0,
      src: fish.src || ''
    };
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      addToCart(cartItem);
      toast.success(`${fish.name} added to cart`);
      setIsAddingToCart(false);
    }, 600);
  };

  // Helper to render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const totalPrice = fish.price * quantity;
  const originalTotalPrice = fish.originalPrice ? fish.originalPrice * quantity : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link 
              href={backLink}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{backLinkText}</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 hover:bg-red-50 hover:border-red-300"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.share?.({
                    title: fish.name,
                    text: `Check out this fresh ${fish.name}!`,
                    url: window.location.href
                  });
                }}
                className="p-2 hover:bg-red-50 hover:border-red-300"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="aspect-square relative max-w-sm mx-auto">
                <Image
                  src={fish.src}
                  alt={fish.name}
                  fill
                  className="object-cover rounded-2xl"
                  priority
                  quality={90}
                  sizes="(max-width: 768px) 80vw, 35vw"
                />
                
                {/* Enhanced Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {fish.isPopular && (
                    <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      ⭐ POPULAR
                    </span>
                  )}
                  {fish.originalPrice && (
                    <span className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      💰 SAVE ₹{(fish.originalPrice - fish.price) * quantity}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Nutrition Quick Facts - Mobile */}
            <div className="lg:hidden bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Nutrition Facts</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{fish.omega3}g</div>
                  <div className="text-xs text-gray-600">Omega-3</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{fish.protein}g</div>
                  <div className="text-xs text-gray-600">Protein</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{fish.calories}</div>
                  <div className="text-xs text-gray-600">Calories</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Product Info */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {fish.name}
                  </h1>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {renderStars(fish.rating)}
                    </div>
                    <span className="text-sm text-gray-600">({fish.rating}/5)</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{fish.type}</p>
                  {fish.serves && (
                    <p className="text-sm text-gray-600">Serves: {fish.serves}</p>
                  )}
                </div>
              </div>

              {/* Price - Enhanced */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-bold text-green-600">₹{fish.price}</span>
                  {originalTotalPrice && (
                    <span className="text-lg text-gray-400 line-through">₹{fish.originalPrice}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {fish.netWeight ? `Net Weight: ${fish.netWeight}` : 'Price per 500g'}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrement}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  
                  <button
                    onClick={increment}
                    disabled={quantity >= 10}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isAddingToCart ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                {isAddingToCart ? 'Adding...' : `Add to Cart - ₹${totalPrice}`}
              </Button>
            </div>

            {/* Benefits & Best For */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-red-600" />
                    Health Benefits
                  </h3>
                  <div className="space-y-2">
                    {fish.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-red-600" />
                    Best For
                  </h3>
                  <div className="space-y-2">
                    {fish.bestFor.map((use, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span className="text-sm text-gray-700">{use}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Nutrition Facts - Desktop */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Nutrition Facts (per 100g)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{fish.omega3}g</div>
                  <div className="text-sm text-gray-600">Omega-3</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{fish.protein}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{fish.calories}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
              </div>
            </div>

            {/* Macro Calculator CTA */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 sm:p-6 border border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Track Your Nutrition Goals
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    Use our macro calculator to plan your daily nutrition intake
                  </p>
                </div>
                <Calculator className="w-8 h-8 text-red-600 flex-shrink-0" />
              </div>
              <Button
                onClick={() => setShowMacroCalculator(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Open Macro Calculator
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Description */}
        {fish.description && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 bg-white rounded-xl shadow-sm p-4 sm:p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-3">About This Fish</h3>
            <p className="text-gray-700 leading-relaxed">{fish.description}</p>
          </motion.div>
        )}
      </div>

      {/* Macro Calculator Modal */}
      {showMacroCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Macro Calculator</h2>
              <button
                onClick={() => setShowMacroCalculator(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <MacroCalculator 
                omega3Per100g={fish.omega3.toString()}
                proteinPer100g={fish.protein.toString()}
                caloriesPer100g={fish.calories.toString()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishDetailPage;
