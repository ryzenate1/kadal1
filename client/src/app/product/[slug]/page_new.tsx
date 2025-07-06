'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Star, 
  StarHalf, 
  ShoppingCart, 
  Heart, 
  Share2,
  Zap,
  ShieldCheck,
  Clock,
  Calculator,
  Eye,
  Loader2,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { fishProducts, FishProduct } from '@/data/additionalFishData';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import MacroCalculator from '@/components/fish/MacroCalculator';

interface ProductPageProps {
  params: { slug: string };
}

const ProductPage: React.FC<ProductPageProps> = ({ params }) => {
  const { slug } = params;
  const [fish, setFish] = useState<FishProduct | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<{ value: string; label: string; multiplier: number } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showMacroCalculator, setShowMacroCalculator] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Find the fish by slug
    const foundFish = fishProducts.find(f => f.slug === slug);
    if (foundFish) {
      setFish(foundFish);
      setSelectedWeight(foundFish.availableWeights[1]); // Default to 500g
    }
    setLoading(false);
  }, [slug]);

  // Show macro calculator toast after 3 seconds
  useEffect(() => {
    if (!fish) return;
    
    const timer = setTimeout(() => {
      toast.info('💪 Try our macro calculator to track your nutrition goals!', {
        duration: 6000,
        action: {
          label: 'Open Calculator',
          onClick: () => setShowMacroCalculator(true),
        },
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [fish]);

  const increment = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));

  const calculatePrice = (basePrice: number, multiplier: number) => {
    return Math.round(basePrice * multiplier);
  };

  const finalPrice = selectedWeight ? calculatePrice(fish?.basePrice || 0, selectedWeight.multiplier) : fish?.basePrice || 0;
  const totalPrice = finalPrice * quantity;

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
    if (!selectedWeight || !fish) return;
    
    setIsAddingToCart(true);
    
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
      quantity: quantity,
      image: fish.imagePath
    };

    // Simulate loading for better UX
    setTimeout(() => {
      addToCart(cartItem);
      toast.success(`Added ${quantity}x ${fish.tanglishName} to cart!`, {
        description: `Total: ₹${totalPrice}`,
      });
      setIsAddingToCart(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading fish details...</p>
        </div>
      </div>
    );
  }

  if (!fish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Fish not found</h1>
          <p className="text-gray-600 mb-6">The fish you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/categories')} className="bg-red-600 hover:bg-red-700">
            Browse All Fish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/categories')}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Back to Categories</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 rounded-full hover:bg-red-50 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
              
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: fish.tanglishName,
                      text: `Check out this fresh ${fish.tanglishName}!`,
                      url: window.location.href
                    });
                  }
                }}
                className="p-2 rounded-full hover:bg-red-50 transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
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
            <div className="relative bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={fish.imagePath}
                  alt={`${fish.tanglishName} - ${fish.englishName}`}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/fish/vangaram.jpg';
                  }}
                />
                
                {/* Clean Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {fish.isPopular && (
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  )}
                  {fish.isPremium && (
                    <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                      PREMIUM
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
                  <div className="text-lg font-bold text-red-600">{fish.omega3}</div>
                  <div className="text-xs text-gray-600">Omega-3</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-600">{fish.protein}</div>
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
              <div className="mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {fish.tanglishName}
                </h1>
                <p className="text-lg text-gray-600 mb-3">
                  ({fish.englishName})
                </p>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(fish.rating)}
                    <span className="text-sm text-gray-600 ml-1">({fish.rating})</span>
                  </div>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{fish.origin}</span>
                </div>
                <p className="text-sm text-gray-600">{fish.type}</p>
              </div>

              {/* Price Display */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600">₹{finalPrice}</span>
                  <span className="text-sm text-gray-600">
                    per {selectedWeight?.label || '500g'}
                  </span>
                </div>
                {quantity > 1 && (
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    Total: ₹{totalPrice}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {fish.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
                {fish.tags.length > 4 && (
                  <span className="text-sm text-gray-500">+{fish.tags.length - 4} more</span>
                )}
              </div>

              {/* Weight Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Choose Weight</h3>
                <div className="grid grid-cols-2 gap-2">
                  {fish.availableWeights.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedWeight(option)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        selectedWeight?.value === option.value
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-green-600 font-semibold">
                        ₹{calculatePrice(fish.basePrice, option.multiplier)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
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
                disabled={isAddingToCart || !selectedWeight}
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

            {/* Benefits & Uses */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-red-600" />
                    Health Benefits & Uses
                  </h3>
                  <div className="space-y-2">
                    {fish.tags.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span className="text-sm text-gray-700">{benefit}</span>
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
                  <div className="text-2xl font-bold text-red-600">{fish.omega3}</div>
                  <div className="text-sm text-gray-600">Omega-3</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{fish.protein}</div>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Track Your Nutrition Goals
                  </h3>
                  <p className="text-sm text-red-700">
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-sm p-4 sm:p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-3">About {fish.tanglishName}</h3>
          <p className="text-gray-700 leading-relaxed">{fish.description}</p>
        </motion.div>
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
                omega3Per100g={fish.omega3}
                proteinPer100g={fish.protein}
                caloriesPer100g={fish.calories}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
