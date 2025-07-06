'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Fish } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FishItem {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  weight: string;
  description: string;
}

interface TrustBadgesProps {
  fishCards?: any[];
}

const TrustBadges = ({ fishCards: propsFishCards }: TrustBadgesProps) => {
  const router = useRouter();
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showLuckyFish, setShowLuckyFish] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [luckyFish, setLuckyFish] = useState<FishItem | null>(null);
  const [randomPickCount, setRandomPickCount] = useState(0);
  const [lastPickTime, setLastPickTime] = useState<Date | null>(null);
  const { addToCart } = useCart();

  // Default fish data
  const defaultFishCards: FishItem[] = [
    {
      id: 'seer',
      name: 'Seer Fish (Vanjaram)',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop',
      category: 'Premium Catch',
      price: 899,
      weight: '500g',
      description: 'Rich in omega-3, perfect for grilling & curry'
    },
    {
      id: 'prawns',
      name: 'Tiger Prawns',
      image: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
      category: 'Fresh Shellfish',
      price: 599,
      weight: '250g',
      description: 'Juicy and flavorful, perfect for curries & frying'
    },
    {
      id: 'salmon',
      name: 'Indian Salmon',
      image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop',
      category: 'Premium Catch',
      price: 1299,
      weight: '1kg',
      description: 'High in protein & omega-3, ideal for steaks'
    },
    {
      id: 'pomfret',
      name: 'White Pomfret',
      image: 'https://images.unsplash.com/photo-1605651377861-348620a3faae?q=80&w=2070&auto=format&fit=crop',
      category: 'Premium Catch',
      price: 1099,
      weight: '700g',
      description: 'Delicate white flesh, perfect for whole fish frying'
    },
    {
      id: 'kingfish',
      name: 'King Fish (Surmai)',
      image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?q=80&w=2070&auto=format&fit=crop',
      category: 'Daily Fresh',
      price: 749,
      weight: '500g',
      description: 'Firm texture, excellent for steaks & grilling'
    },
    {
      id: 'crab',
      name: 'Mud Crab',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop',
      category: 'Live Shellfish',
      price: 1599,
      weight: '1kg',
      description: 'Sweet meat, perfect for crab curry & masala'
    }
  ];

  // Use the provided fishCards from props if available, otherwise use default
  const fishCards = propsFishCards && propsFishCards.length > 0 
    ? propsFishCards 
    : defaultFishCards;

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to get a random fish
  const getRandomFish = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * fishCards.length);
    return fishCards[randomIndex];
  }, [fishCards]);

  // Handle the Feeling Lucky button click
  const handleFeelingLucky = useCallback(() => {
    setIsRandomizing(true);
    setShowLuckyFish(false);
    
    const today = new Date();
    if (lastPickTime) {
      const hoursSinceLastPick = Math.abs(today.getTime() - lastPickTime.getTime()) / 36e5;
      if (hoursSinceLastPick < 24 && randomPickCount >= 3) {
        toast.error('You have reached your daily limit for lucky picks!');
        setIsRandomizing(false);
        return;
      }
    }

    // Update user interaction tracking
    setRandomPickCount(prev => prev + 1);
    setLastPickTime(today);

    // Create a randomization effect
    const intervalDuration = 80; // Fast switching
    let randomizationCount = 0;
    
    const interval = setInterval(() => {
      setLuckyFish(getRandomFish());
      randomizationCount++;
      
      // Stop after some iterations
      if (randomizationCount > 15) {
        clearInterval(interval);
        // Final selection with a slight delay
        setTimeout(() => {
          const finalFish = getRandomFish();
          setLuckyFish(finalFish);
          setShowLuckyFish(true);
          setIsRandomizing(false);
          
          // Add the lucky fish to cart
          const cartItem = {
            id: finalFish.id,
            name: finalFish.name,
            src: finalFish.image,
            type: finalFish.category || 'Fresh Catch',
            price: finalFish.price,
            omega3: 2.5, // Default omega-3 content
            protein: 18.5, // Default protein content
            calories: 150, // Default calories per 100g
            benefits: ['High Protein', 'Omega-3 Rich', 'Fresh Catch'],
            bestFor: ['Grilling', 'Curry', 'Frying'],
            rating: 4.7,
            description: finalFish.description || 'Premium quality seafood',
            serves: '2-3 people',
            netWeight: finalFish.weight,
            grossWeight: finalFish.weight,
            quantity: 1
          };
          
          console.log('Adding to cart:', cartItem);
          addToCart(cartItem, 1);
          
          // Show success toast
          toast.success(`✅ ${finalFish.name} added to cart!`, {
            duration: 3000,
            position: 'top-right'
          });
          
          // Show bottom toast with buttons after a short delay
          setTimeout(() => {
            toast(
              <div className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Want to continue shopping?</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      toast.dismiss();
                      handleFeelingLucky();
                    }}
                    className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-md hover:bg-red-200 transition-colors"
                  >
                    Add another
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss();
                      // Use Next.js router for client-side navigation
                      router.push('/cart');
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    Go to Cart
                  </button>
                </div>
              </div>,
              { 
                duration: 5000, 
                position: 'bottom-center',
                style: {
                  marginBottom: '80px', // Move it higher up from the bottom
                }
              }
            );
          }, 500);
        }, 300);
      }
    }, intervalDuration);
  }, [getRandomFish, addToCart]);

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="py-8 px-4 bg-gradient-to-br from-red-50 to-pink-50">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            🎣 Try Your Luck
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Click the button below to randomly select a fish and add it to your cart!
          </p>
          
          {/* Lucky fish display */}
          {showLuckyFish && luckyFish && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-xl shadow-lg border border-green-200"
            >
              <p className="text-sm font-bold text-green-800 mb-1">
                🎉 Lucky Catch: {luckyFish.name}!
              </p>
              <p className="text-xs text-green-600 mb-2">
                {luckyFish.description}
              </p>
              <button
                onClick={() => {
                  // Add to cart again
                  const cartItem = {
                    id: luckyFish.id,
                    name: luckyFish.name,
                    src: luckyFish.image,
                    type: luckyFish.category || 'Fresh Catch',
                    price: luckyFish.price,
                    omega3: 2.5,
                    protein: 18.5,
                    calories: 150,
                    benefits: ['High Protein', 'Omega-3 Rich', 'Fresh Catch'],
                    bestFor: ['Grilling', 'Curry', 'Frying'],
                    rating: 4.7,
                    description: luckyFish.description || 'Premium quality seafood',
                    serves: '2-3 people',
                    netWeight: luckyFish.weight,
                    grossWeight: luckyFish.weight,
                    quantity: 1
                  };
                  
                  console.log('Adding to cart from mobile:', cartItem);
                  addToCart(cartItem, 1);
                  
                  // Show initial success toast
                  toast.success(`Added ${luckyFish.name} to cart!`, {
                    position: 'top-center'
                  });
                  
                  // Show action toast
                  setTimeout(() => {
                    toast(
                      <div className="p-4 flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Want to continue shopping?</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              toast.dismiss();
                              handleFeelingLucky();
                            }}
                            className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-md hover:bg-red-200 transition-colors"
                          >
                            Add another
                          </button>
                          <button
                            onClick={() => {
                              toast.dismiss();
                              router.push('/cart');
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
                          >
                            Go to Cart
                          </button>
                        </div>
                      </div>,
                      { 
                        duration: 5000, 
                        position: 'bottom-center',
                        style: {
                          marginBottom: '80px',
                        }
                      }
                    );
                  }, 500);
                }}
                className="w-full py-1.5 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <span className="mr-1">🛒</span> Add to Cart
              </button>
            </motion.div>
          )}
          
          {/* Lucky Button */}
          <button
            onClick={handleFeelingLucky}
            disabled={isRandomizing}
            className={`mb-4 px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 ${
              isRandomizing 
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
            }`}
          >
            {isRandomizing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Picking...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Shuffle className="w-4 h-4 mr-2" />
                <span className="text-sm">🎲 Feeling Lucky?</span>
              </div>
            )}
          </button>

          {/* User stats */}
          {randomPickCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-red-100"
            >
              <p className="text-xs font-medium text-red-700">
                🎯 You've tried your luck {randomPickCount} time{randomPickCount > 1 ? 's' : ''}!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="py-12 px-8 bg-gradient-to-br from-red-50 to-pink-50">
      {/* Desktop Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎣 Try Your Luck
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-base leading-relaxed">
          Feeling adventurous? Let us surprise you with a randomly selected fresh catch from our premium selection.
          Click the button below to try your luck and add a surprise fish to your cart!
        </p>
        
        {/* Lucky fish display for desktop */}
        {showLuckyFish && luckyFish && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 max-w-md mx-auto px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-xl shadow-xl border border-green-200"
          >
            <p className="text-lg font-bold text-green-800 mb-2">
              ✨ Your Lucky Catch: {luckyFish.name}!
            </p>
            <p className="text-sm text-green-600 mb-3">
              {luckyFish.description}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const cartItem = {
                    id: luckyFish.id,
                    name: luckyFish.name,
                    src: luckyFish.image,
                    type: luckyFish.category || 'Fresh Catch',
                    price: luckyFish.price,
                    omega3: 2.5,
                    protein: 18.5,
                    calories: 150,
                    benefits: ['High Protein', 'Omega-3 Rich', 'Fresh Catch'],
                    bestFor: ['Grilling', 'Curry', 'Frying'],
                    rating: 4.7,
                    description: luckyFish.description || 'Premium quality seafood',
                    serves: '2-3 people',
                    netWeight: luckyFish.weight,
                    grossWeight: luckyFish.weight,
                    quantity: 1
                  };
                  
                  console.log('Adding to cart from desktop:', cartItem);
                  addToCart(cartItem, 1);
                  
                  // Show initial success toast
                  toast.success(`Added ${luckyFish.name} to cart!`, {
                    position: 'top-center'
                  });
                  
                  // Show action toast
                  setTimeout(() => {
                    toast(
                      <div className="p-4 flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Want to continue shopping?</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              toast.dismiss();
                              handleFeelingLucky();
                            }}
                            className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-md hover:bg-red-200 transition-colors"
                          >
                            Add another
                          </button>
                          <button
                            onClick={() => {
                              toast.dismiss();
                              router.push('/cart');
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
                          >
                            Go to Cart
                          </button>
                        </div>
                      </div>,
                      { 
                        duration: 5000, 
                        position: 'bottom-center',
                        style: {
                          marginBottom: '80px',
                        }
                      }
                    );
                  }, 500);
                }}
                className="px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center"
              >
                <span className="mr-2">🛒</span> Add to Cart
              </button>
            </div>
          </motion.div>
        )}
          
        {/* Lucky Button for Desktop */}
        <button
          onClick={handleFeelingLucky}
          disabled={isRandomizing}
          className={`mb-6 px-8 py-4 rounded-full font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 text-base ${
            isRandomizing 
              ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
          }`}
        >
          {isRandomizing ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Finding your perfect catch...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Shuffle className="w-5 h-5 mr-3" />
              <span>🎲 Feeling Lucky? Pick My Fish!</span>
            </div>
          )}
        </button>
        
        {/* User stats for desktop */}
        {randomPickCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-block px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-red-100"
          >
            <p className="text-sm font-medium text-red-700">
              🎯 Lucky picks: {randomPickCount} | {lastPickTime && `Last pick: ${lastPickTime.toLocaleTimeString()}`}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrustBadges;
