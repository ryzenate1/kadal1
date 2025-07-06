'use client';

import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fish, Anchor, Waves, Shield, Clock, Tag, ChevronLeft, ChevronRight, Sparkles, Star, Heart, ShoppingCart, Shuffle, Zap, TrendingUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface FishCardProps {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  originalPrice: number;
  weight: string;
  freshness: string;
  iconName?: string; // Added from API
  icon?: React.ReactNode;
  color: string;
  rating: number;
  description: string;
  isActive?: boolean;
}

interface TrustBadgesProps {
  fishCards?: FishCardProps[];
}

const TrustBadges = ({ fishCards: propsFishCards }: TrustBadgesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showLuckyFish, setShowLuckyFish] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [luckyFish, setLuckyFish] = useState<FishCardProps | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [randomPickCount, setRandomPickCount] = useState(0);
  const [lastPickTime, setLastPickTime] = useState<Date | null>(null);
  const [isWishlisted, setIsWishlisted] = useState<{[key: string]: boolean}>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  // Debug rendering
  useEffect(() => {
    console.log("TrustBadges component mounted", propsFishCards);
  }, [propsFishCards]);

  // Enhanced fish cards data with proper images and nutrition info
  const defaultFishCards: FishCardProps[] = [
    {
      id: 'seer',
      name: 'Seer Fish (Vanjaram)',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop',
      category: 'Premium Catch',
      price: 899,
      originalPrice: 999,
      weight: '500g',
      freshness: 'Fresh Today',
      icon: <Fish className="w-4 h-4" />,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      rating: 4.8,
      description: 'Rich in omega-3, perfect for grilling & curry'
    },
    {
      id: 'prawns',
      name: 'Tiger Prawns',
      image: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
      category: 'Fresh Shellfish',
      price: 599,
      originalPrice: 699,
      weight: '250g',
      freshness: 'Just Caught',
      icon: <Anchor className="w-4 h-4" />,
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      rating: 4.6,
      description: 'Juicy and flavorful, perfect for curries & frying'
    },
    {
      id: 'salmon',
      name: 'Indian Salmon',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop',
      category: 'Premium Catch',
      price: 1299,
      originalPrice: 1499,
      weight: '1kg',
      freshness: 'Ocean Fresh',
      icon: <Waves className="w-4 h-4" />,
      color: 'bg-gradient-to-br from-pink-500 to-red-500',
      rating: 4.9,
      description: 'High in protein & omega-3, ideal for steaks'
    },
    {
      id: 'pomfret',
      name: 'White Pomfret',
      image: 'https://images.unsplash.com/photo-1605651377861-348620a3faae?q=80&w=2070&auto=format&fit=crop',
      category: 'Premium Catch',
      price: 1099,
      originalPrice: 1299,
      weight: '700g',
      freshness: 'Fresh Today',
      icon: <Fish className="w-4 h-4" />,
      color: 'bg-gradient-to-br from-blue-500 to-red-500',
      rating: 4.7,
      description: 'Delicate white flesh, perfect for whole fish frying'
    },
    {
      id: 'kingfish',
      name: 'King Fish (Surmai)',
      image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?q=80&w=2070&auto=format&fit=crop',
      category: 'Daily Fresh',
      price: 749,
      originalPrice: 849,
      weight: '500g',
      freshness: 'Morning Catch',
      icon: <Star className="w-4 h-4" />,
      color: 'bg-gradient-to-br from-purple-500 to-red-500',
      rating: 4.5,
      description: 'Firm texture, excellent for steaks & grilling'
    },
    {
      id: 'crab',
      name: 'Mud Crab',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop',
      category: 'Live Shellfish',
      price: 1599,
      originalPrice: 1799,
      weight: '1kg',
      freshness: 'Live & Fresh',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'bg-gradient-to-br from-green-500 to-red-600',
      rating: 4.9,
      description: 'Sweet meat, perfect for crab curry & masala'
    }
  ];

  // Use the provided fishCards from props if available, otherwise use default
  const fishCards = propsFishCards && propsFishCards.length > 0 
    ? propsFishCards.map(card => ({
        ...card,
        icon: getIconComponent(card.iconName || 'Fish')
      }))
    : defaultFishCards;

  const trustBadges = [
    {
      id: 'fssai',
      icon: <Shield className="w-4 h-4 text-green-600" />,
      title: 'FSSAI',
      description: 'Certified',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'fresh',
      icon: <Clock className="w-4 h-4 text-blue-600" />,
      title: 'Same Day',
      description: 'Delivery',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'price',
      icon: <Tag className="w-4 h-4 text-red-600" />,
      title: 'Best',
      description: 'Price',
      color: 'bg-red-50 border-red-200'
    },
    {
      id: 'quality',
      icon: <Star className="w-4 h-4 text-yellow-600" />,
      title: 'Premium',
      description: 'Quality',
      color: 'bg-yellow-50 border-yellow-200'
    }
  ];

  // Helper function to get icon component from iconName
  function getIconComponent(iconName: string): React.ReactNode {
    switch (iconName?.toLowerCase()) {
      case 'fish': return <Fish className="w-4 h-4" />;
      case 'anchor': return <Anchor className="w-4 h-4" />;
      case 'waves': return <Waves className="w-4 h-4" />;
      case 'shield': return <Shield className="w-4 h-4" />;
      case 'clock': return <Clock className="w-4 h-4" />;
      case 'tag': return <Tag className="w-4 h-4" />;
      case 'star': return <Star className="w-4 h-4" />;
      case 'heart': return <Heart className="w-4 h-4" />;
      case 'cart': return <ShoppingCart className="w-4 h-4" />;
      case 'sparkles': return <Sparkles className="w-4 h-4" />;
      default: return <Fish className="w-4 h-4" />;
    }
  }

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to get a random fish with user preferences
  const getRandomFish = useCallback(() => {
    // Add some user preference logic - prioritize higher rated fish occasionally
    const shouldPrioritizeRating = Math.random() > 0.7; // 30% chance to prioritize rating
    
    if (shouldPrioritizeRating) {
      const highRatedFish = fishCards.filter(fish => fish.rating >= 4.7);
      if (highRatedFish.length > 0) {
        const randomIndex = Math.floor(Math.random() * highRatedFish.length);
        return highRatedFish[randomIndex];
      }
    }
    
    const randomIndex = Math.floor(Math.random() * fishCards.length);
    return fishCards[randomIndex];
  }, [fishCards]);

  // Navigation functions
  const nextCard = useCallback(() => {
    setCurrentIndex((prev) => (prev === fishCards.length - 1 ? 0 : prev + 1));
  }, [fishCards.length]);

  const prevCard = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? fishCards.length - 1 : prev - 1));
  }, [fishCards.length]);

  // Enhanced lucky fish selection with user tracking
  const handleFeelingLucky = useCallback(() => {
    setIsRandomizing(true);
    setShowLuckyFish(false);
    
    // Update user interaction tracking
    setRandomPickCount(prev => prev + 1);
    setLastPickTime(new Date());

    // Create a fun randomization effect with more fish variety
    const randomizationDuration = 2000; // 2 seconds
    const intervalDuration = 80; // Faster switching
    let randomizationCount = 0;
    
    const interval = setInterval(() => {
      setLuckyFish(getRandomFish());
      randomizationCount++;
      
      // Slow down towards the end for better UX
      if (randomizationCount > 15) {
        clearInterval(interval);
        // Final selection with a slight delay for suspense
        setTimeout(() => {
          const finalFish = getRandomFish();
          setLuckyFish(finalFish);
          setShowLuckyFish(true);
          setIsRandomizing(false);
          
          // Find and set the index of the lucky fish
          const luckyIndex = fishCards.findIndex(fish => fish.id === finalFish.id);
          if (luckyIndex !== -1) {
            setCurrentIndex(luckyIndex);
          }
          
          // Show success message
          toast.success(`🎣 Lucky catch: ${finalFish.name}! Fresh and ready to order.`);
        }, 300);
      }
    }, intervalDuration);
  }, [fishCards, getRandomFish]);

  // Add to cart functionality
  const handleAddToCart = useCallback((fish: FishCardProps) => {
    try {
      const cartItem = {
        id: fish.id,
        name: fish.name,
        src: fish.image,
        type: fish.category,
        price: fish.price,
        omega3: 2.5, // Default omega-3 content
        protein: 18.5, // Default protein content
        calories: 150, // Default calories per 100g
        benefits: ['High Protein', 'Omega-3 Rich', 'Fresh Catch'],
        bestFor: ['Grilling', 'Curry', 'Frying'],
        rating: fish.rating,
        description: fish.description,
        serves: '2-3 people',
        netWeight: fish.weight,
        grossWeight: fish.weight,
        originalPrice: fish.originalPrice,
        quantity: 1
      };
      
      addToCart(cartItem, 1);
      toast.success(`🛒 ${fish.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  }, [addToCart]);

  // Toggle wishlist functionality
  const toggleWishlist = useCallback((fishId: string) => {
    setIsWishlisted(prev => ({
      ...prev,
      [fishId]: !prev[fishId]
    }));
    
    const fish = fishCards.find(f => f.id === fishId);
    if (fish) {
      const isNowWishlisted = !isWishlisted[fishId];
      toast.success(
        isNowWishlisted 
          ? `💝 ${fish.name} added to wishlist!`
          : `${fish.name} removed from wishlist`
      );
    }
  }, [isWishlisted, fishCards]);

  // Improved touch event handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const newCurrentX = e.touches[0].clientX;
    const diff = newCurrentX - startX;

    // Add resistance at the edges
    const resistance = 0.5;
    const maxDrag = containerRef.current ? containerRef.current.offsetWidth * 0.8 : 300;
    
    let adjustedDiff = diff;
    if (Math.abs(diff) > maxDrag) {
      adjustedDiff = diff > 0 ? maxDrag + (diff - maxDrag) * resistance : -maxDrag + (diff + maxDrag) * resistance;
    }
    
    setCurrentX(newCurrentX);
    setDragOffset(adjustedDiff);
  }, [isDragging, startX]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Determine if we should switch cards based on swipe distance and velocity
    const threshold = containerRef.current ? containerRef.current.offsetWidth * 0.25 : 75;

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        prevCard();
      } else {
        nextCard();
      }
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, prevCard, nextCard]);

  // Render star rating
  const renderStars = useCallback((rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">{rating}</span>
      </div>
    );
  }, []);
  
  // Mobile Layout
  if (isMobile) {
    return (
      <div id="mobile-trust-badges" className="py-4 px-4 bg-gradient-to-br from-blue-50 to-teal-50 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Fresh Seafood
          </h2>
          <p className="text-gray-600 mb-3 text-sm">
            Swipe to discover your perfect catch!
          </p>
          
          {/* Lucky Button */}
          <button
            onClick={handleFeelingLucky}
            disabled={isRandomizing}
            className={`flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-4 py-2 rounded-full text-white font-medium transition-all text-sm ${
              isRandomizing 
                ? 'bg-gradient-to-r from-blue-400 to-teal-400' 
                : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg active:scale-95'
            }`}
          >
            {isRandomizing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Selecting...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                <span>Feeling Lucky</span>
              </div>
            )}
          </button>
          
          {showLuckyFish && luckyFish && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-green-100"
            >
              <p className="text-xs font-medium text-green-700">
                🎉 {luckyFish.name}!
              </p>
            </motion.div>
          )}
        </div>

        {/* Mobile Card Deck - Reduced height */}
        <div className="relative max-w-sm mx-auto h-[460px] touch-pan-y">
        <div 
            ref={containerRef} 
            className="relative w-full h-full overflow-hidden"
            onTouchStart={handleTouchStart} 
            onTouchMove={handleTouchMove} 
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            <AnimatePresence mode="sync">
            <motion.div
                key={currentIndex}
              initial={{ x: 300, opacity: 0 }}
                animate={{ 
                  x: dragOffset, 
                  opacity: 1,
                  rotateY: dragOffset * 0.1
                }}
              exit={{ x: -300, opacity: 0 }}
                transition={{ 
                  type: isDragging ? "spring" : "tween",
                  stiffness: isDragging ? 300 : 200,
                  damping: isDragging ? 30 : 20,
                  duration: isDragging ? 0 : 0.3
                }}
                className="absolute inset-0 bg-white rounded-2xl shadow-xl overflow-hidden"
                style={{ 
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                {(() => {
                  const card = fishCards[currentIndex];
                  return (
                    <>
                      {/* Card Image - Reduced height */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                        {/* Top badges row */}
                        <div className="absolute top-2 left-0 right-0 flex justify-between items-start px-3">
                          <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${card.color}`}>
                            {card.category}
                          </div>
                          <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-900">
                                ₹{card.price}
                              </span>
                              {card.originalPrice > card.price && (
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{card.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom badges row */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-between items-end px-3">
                          {showLuckyFish && luckyFish?.id === card.id && (
                            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Lucky!
                            </div>
                          )}
                          <div className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs ml-auto">
                            {card.freshness}
                          </div>
                        </div>
                      </div>

                      {/* Card Content - Optimized spacing */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                              {card.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {card.description}
                            </p>
                            {renderStars(card.rating)}
                          </div>
                          <div className={`${card.color} p-2 rounded-full text-white shadow-md flex-shrink-0`}>
                            {card.icon}
                          </div>
                        </div>

                        {/* Trust Badges - Compact grid */}
                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                          {trustBadges.map((badge) => (
                            <div
                              key={badge.id}
                              className="flex flex-col items-center text-center p-1.5 bg-gray-50 rounded-lg"
                            >
                              <div className="bg-white p-1 rounded-full mb-0.5 shadow-sm">
                                {badge.icon}
                              </div>
                              <span className="text-xs font-semibold text-gray-900 leading-tight">
                                {badge.title}
                              </span>
                              <span className="text-xs text-gray-600 leading-tight">
                                {badge.description}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action Button */}
                        <button
                          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-teal-700 transition-all transform active:scale-95 shadow-md"
                          onClick={() => console.log('Add to Cart')}
                        >
                          Add to Cart • {card.weight}
                        </button>
              </div>
                    </>
                  );
                })()}
            </motion.div>
          </AnimatePresence>
        </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevCard}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all z-20"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          
                <button 
            onClick={nextCard}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all z-20"
                >
            <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {fishCards.map((_, index) => (
                        <button 
                            key={index} 
                            onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-600 scale-125 w-4'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
                        />
                    ))}
                </div>

        {/* Card Counter */}
        <div className="text-center mt-2">
          <span className="text-gray-600 text-xs">
            {currentIndex + 1} of {fishCards.length}
          </span>
            </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div id="desktop-trust-badges" className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Fresh Seafood Collection
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Premium quality fish sourced daily from local fishermen, delivered fresh to your doorstep
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block"
          >
            <button
              onClick={handleFeelingLucky}
              disabled={isRandomizing}
              className="group relative overflow-hidden flex items-center justify-center gap-2 mx-auto px-8 py-3.5 rounded-full text-white font-medium transition-all text-lg bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300"
            >
              <span className={`relative z-10 flex items-center ${isRandomizing ? 'gap-3' : 'gap-2'}`}>
                {isRandomizing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Finding your perfect fish...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>I'm Feeling Lucky</span>
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </motion.div>
          {showLuckyFish && luckyFish && (
            <div className="mt-4 text-lg text-green-600 font-medium animate-bounce">
              🎉 Try your luck with {luckyFish.name} - a great choice!
            </div>
          )}
        </div>

        {/* Desktop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 px-4 sm:px-0">
          {fishCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`group relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                showLuckyFish && luckyFish?.id === card.id ? 'ring-4 ring-yellow-400 ring-opacity-75' : 'border border-gray-100'
              }`}
            >
              {/* Card Image */}
              <div className="relative h-64 overflow-hidden">
                <div className="relative h-full w-full">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Category Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wide ${card.color} shadow-md`}>
                  {card.category}
                </div>
                
                {/* Price Tag */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-gray-900">₹{card.price}</span>
                    {card.originalPrice > card.price && (
                      <span className="text-xs text-gray-500 line-through">₹{card.originalPrice}</span>
                    )}
                  </div>
                </div>
                
                {/* Lucky Badge */}
                {showLuckyFish && luckyFish?.id === card.id && (
                  <div className="absolute bottom-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-md animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Lucky Pick!
                  </div>
                )}
              </div>
              
              {/* Card Body */}
              <div className="p-5 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">{card.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {renderStars(card.rating)}
                      <span className="ml-2 text-sm text-gray-500">{card.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{card.weight}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{card.description}</p>
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <button 
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center group"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to wishlist logic here
                    }}
                  >
                    <Heart className="w-4 h-4 mr-1.5 text-blue-500 group-hover:fill-current" />
                    Save
                  </button>
                  
                  <button 
                    className="flex-1 max-w-[180px] ml-4 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Add to Cart', card);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div 
          className="mt-20 sm:mt-24 lg:mt-32 px-4 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose Kadal Thunai</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">We're committed to delivering the freshest seafood with the highest quality standards.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'fresh',
                icon: <Shield className="w-6 h-6 text-green-600" />,
                title: 'Fresh Guarantee',
                description: 'All seafood is guaranteed fresh'
              },
              {
                id: 'delivery',
                icon: <Clock className="w-6 h-6 text-blue-600" />,
                title: 'Fast Delivery',
                description: 'Same day delivery available'
              },
              {
                id: 'quality',
                icon: <Star className="w-6 h-6 text-purple-600" />,
                title: 'Quality Assured',
                description: 'Premium quality seafood'
              },
              {
                id: 'sustainable',
                icon: <Heart className="w-6 h-6 text-red-600" />,
                title: 'Sustainably Sourced',
                description: 'Environmentally responsible practices'
              }
            ].map((badge, index) => (
              <motion.div 
                key={badge.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center shadow-sm">
                  {React.cloneElement(badge.icon, { className: `${(badge.icon as any).props.className} w-6 h-6` })}
                </div>
                <h4 className="font-semibold text-gray-800 text-lg mb-2">{badge.title}</h4>
                <p className="text-gray-600 text-sm">{badge.description}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group"
              onClick={() => {
                // Scroll to about section or open modal
                const aboutSection = document.getElementById('about');
                aboutSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn more about our quality standards
              <ChevronRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to render star ratings
function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
    );
  }
  
  // Half star
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative w-4 h-4">
        <Star className="w-4 h-4 text-gray-300 fill-current" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
        </div>
      </div>
    );
  }
  
  // Empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
    );
  }
  
  return <div className="flex space-x-0.5">{stars}</div>;
}

export default TrustBadges;