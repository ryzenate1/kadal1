'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Loader2, 
  Fish, 
  Shell, 
  Heart, 
  Scale, 
  Droplets, 
  Activity 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/toast-notification';
import { motion } from 'framer-motion';
import { Breadcrumb } from '@/components/ui/breadcrumb';

// Enhanced Fish interface with nutritional info
interface FishDetail {
  id: string;
  name: string;
  image: string;
  price: number;
  type: string;
  description: string;
  slug: string;
  weights: { value: string; label: string; multiplier: number }[];
  omega3?: string;
  protein?: string;
  calories?: string;
  benefits?: string[];
  bestFor?: string[];
  rating?: number;
  origin?: string;
  isPopular?: boolean;
}

// Default weight options
const DEFAULT_WEIGHT_OPTIONS = [
  { value: '250g', label: '250g', multiplier: 0.5 },
  { value: '500g', label: '500g', multiplier: 1 },
  { value: '1kg', label: '1kg', multiplier: 2 },
  { value: '2kg', label: '2kg', multiplier: 3.8 }
];

// Extended fish data with nutritional information
const fishDetailsData: FishDetail[] = [
  {
    id: 'vanjaram-fish',
    name: 'Vanjaram Fish',
    image: '/images/products/vangaram.jpg',
    price: 799,
    type: 'Fish',
    description: 'Vanjaram Fish, also known as King Fish or Spanish Mackerel, is a premium sea fish known for its firm texture and rich flavor. It\'s highly prized for its high omega-3 content and versatility in cooking. Perfect for grilling, frying, or making delicious curries.',
    slug: 'vanjaram-fish',
    weights: DEFAULT_WEIGHT_OPTIONS,
    omega3: '3.4g',
    protein: '22g',
    calories: '124 kcal',
    benefits: ['Heart Health', 'Brain Function', 'Anti-inflammatory'],
    bestFor: ['Grilling', 'Frying', 'Curry'],
    rating: 4.8,
    origin: 'Bay of Bengal',
    isPopular: true
  },
  {
    id: 'sliced-vanjaram',
    name: 'Sliced Vanjaram',
    image: '/images/products/sliced-vangaram.jpg',
    price: 899,
    type: 'Fish',
    description: 'Expertly pre-cut Vanjaram (King Fish) slices, ready for your favorite recipes. Each slice is carefully cut to preserve the premium texture and flavor. These slices are perfect for quick cooking and maintain all the nutritional benefits of fresh Vanjaram.',
    slug: 'sliced-vanjaram',
    weights: DEFAULT_WEIGHT_OPTIONS,
    omega3: '3.2g',
    protein: '21g',
    calories: '130 kcal',
    benefits: ['Convenience', 'Heart Health', 'Rich in DHA'],
    bestFor: ['Quick Fry', 'Grilling', 'Fish Curry'],
    rating: 4.7,
    origin: 'Bay of Bengal',
    isPopular: true
  },
  {
    id: 'jumbo-prawns',
    name: 'Jumbo Prawns',
    image: '/images/fish/big-prawn.webp',
    price: 1099,
    type: 'Prawns',
    description: 'Our premium Jumbo Prawns are sourced from the pristine waters of the coast. Known for their large size and sweet taste, these prawns are perfect for special occasions. Rich in protein and minerals, they make a nutritious and delicious addition to your meals.',
    slug: 'jumbo-prawns',
    weights: DEFAULT_WEIGHT_OPTIONS,
    omega3: '1.8g',
    protein: '24g',
    calories: '110 kcal',
    benefits: ['High Protein', 'Low Fat', 'Rich in Selenium'],
    bestFor: ['Grilling', 'Curry', 'Stir-fry'],
    rating: 4.9,
    origin: 'Coastal Tamil Nadu',
    isPopular: true
  },
  {
    id: 'sea-prawns',
    name: 'Sea Prawns',
    image: '/images/fish/sea-prawn.webp',
    price: 899,
    type: 'Prawns',
    description: 'Our Sea Prawns are wild-caught from the ocean waters, ensuring the freshest flavor and natural taste. These medium-sized prawns are versatile for everyday cooking and packed with nutrients. They cook quickly and absorb flavors beautifully.',
    slug: 'sea-prawns',
    weights: DEFAULT_WEIGHT_OPTIONS,
    omega3: '1.5g',
    protein: '20g',
    calories: '95 kcal',
    benefits: ['Vitamin B12', 'Iodine', 'Zinc'],
    bestFor: ['Curry', 'Pasta', 'Fried Rice'],
    rating: 4.6,
    origin: 'Indian Ocean',
    isPopular: false
  },
  {
    id: 'fresh-lobsters',
    name: 'Fresh Lobsters',
    image: '/images/fish/lobster.jpg',
    price: 1499,
    type: 'Shellfish',
    description: 'Our Fresh Lobsters are the pinnacle of seafood luxury. Carefully selected for their size and quality, these lobsters have tender, sweet meat that\'s perfect for special occasions. They\'re delivered live to ensure maximum freshness and flavor.',
    slug: 'fresh-lobsters',
    weights: DEFAULT_WEIGHT_OPTIONS,
    omega3: '0.4g',
    protein: '26g',
    calories: '135 kcal',
    benefits: ['Copper', 'Selenium', 'Vitamin B12'],
    bestFor: ['Steaming', 'Grilling', 'Thermidor'],
    rating: 4.9,
    origin: 'Coastal Waters',
    isPopular: true
  },
  {
    id: 'fresh-crab',
    name: 'Fresh Crab',
    image: '/images/fish/blue-crabs.jpg',
    price: 999,
    type: 'Crabs',
    description: 'Our Fresh Blue Crabs are prized for their sweet, delicate meat and impressive size. Each crab is carefully selected to ensure the highest quality and meat content. Perfect for traditional crab curries or modern seafood dishes.',
    slug: 'fresh-crab',
    weights: DEFAULT_WEIGHT_OPTIONS,
    omega3: '0.6g',
    protein: '19g',
    calories: '105 kcal',
    benefits: ['Vitamin B2', 'Phosphorus', 'Copper'],
    bestFor: ['Crab Curry', 'Steaming', 'Crab Cakes'],
    rating: 4.7,
    origin: 'Mangrove Estuaries',
    isPopular: false
  },
  {
    id: 'squid-octopus',
    name: 'Squid & Octopus',
    image: '/images/fish/squid.jpg',
    price: 899,
    type: 'Cephalopods',
    description: 'Our premium Squid and Octopus selection brings you the best of cephalopod seafood. The squid is cleaned and prepared for easy cooking, while the octopus is tenderized to perfection. Both offer unique textures and flavors that absorb marinades beautifully.',
    slug: 'squid-octopus',
    weights: DEFAULT_WEIGHT_OPTIONS,
    omega3: '0.9g',
    protein: '18g',
    calories: '90 kcal',
    benefits: ['Vitamin B12', 'Copper', 'Iron'],
    bestFor: ['Frying', 'Grilling', 'Seafood Pasta'],
    rating: 4.5,
    origin: 'Deep Sea Waters',
    isPopular: true
  }
];

export default function FishDetailPage() {
  const pathname = usePathname();
  const fishName = decodeURIComponent(pathname.split('/').pop() || '');
  
  const [fish, setFish] = useState<FishDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState('500g');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  useEffect(() => {
    // Find the fish by name or slug (case-insensitive search)
    const foundFish = fishDetailsData.find(f => 
      f.name.toLowerCase() === fishName.toLowerCase() || 
      f.slug.toLowerCase() === fishName.toLowerCase()
    );
    
    setFish(foundFish || null);
    
    if (foundFish) {
      setSelectedWeight(foundFish.weights[0]?.value || '500g');
    }
    
    // Simulate a slight loading delay for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [fishName]);
  
  // Find the selected weight option
  const selectedWeightOption = fish?.weights?.find(
    option => option.value === selectedWeight
  ) || DEFAULT_WEIGHT_OPTIONS[1]; // Default to 500g
  
  // Calculate price based on weight
  const calculatePrice = (basePrice: number, multiplier: number) => {
    return Math.round(basePrice * multiplier);
  };
  
  // Calculate the final price based on selected weight
  const finalPrice = fish ? calculatePrice(fish.price, selectedWeightOption.multiplier) : 0;
  const originalPrice = fish ? calculatePrice(Math.round(fish.price * 1.15), selectedWeightOption.multiplier) : 0; // 15% higher for original price
  
  const handleWeightChange = (value: string) => {
    setSelectedWeight(value);
  };
  
  const handleAddToCart = () => {
    if (!fish) return;
    
    try {
      setIsAddingToCart(true);
      
      // Create a cart item that matches the expected structure in CartContext
      const cartItem = {
        name: `${fish.name} (${selectedWeightOption.label})`,
        src: fish.image,
        type: fish.type || 'Premium',
        price: finalPrice,
        omega3: parseFloat(fish.omega3 || '1.5') || 1.5,
        protein: parseFloat(fish.protein || '20') || 20,
        calories: parseFloat(fish.calories || '120') || 120,
        benefits: fish.benefits || ['Fresh', 'High Quality', 'Premium'],
        bestFor: fish.bestFor || ['Curry', 'Fry', 'Grill'],
        rating: fish.rating || 4.5,
        quantity: 1,
        description: fish.description || `Fresh ${fish.name}`,
        netWeight: selectedWeightOption.label,
        grossWeight: selectedWeightOption.label,
        originalPrice: originalPrice,
      };
      
      addToCart(cartItem, 1);
      
      // Show success notification
      showToast({
        message: `${fish.name} (${selectedWeightOption.label}) added to cart! ₹${finalPrice}`,
        type: 'success',
        duration: 3000
      });
      
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 500); // Small delay for better UX
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast({
        message: 'Failed to add item to cart. Please try again.',
        type: 'error',
        duration: 3000
      });
      setIsAddingToCart(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
            <h2 className="text-xl font-medium text-gray-700">Loading fish details...</h2>
          </div>
        </div>
      </div>
    );
  }
  
  if (!fish) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Fish className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Fish Not Found</h2>
          <p className="text-gray-600 mb-6 max-w-md">Sorry, we couldn't find any fish with that name. Please check the URL or browse our categories.</p>
          <Link href="/categories">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb 
          items={[
            { label: 'Categories', href: '/categories' },
            { label: fish.name }
          ]} 
        />
      </div>
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-2">
        <Link href="/categories">
          <Button variant="ghost" className="text-gray-700 hover:text-red-600 hover:bg-red-50 mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Categories
          </Button>
        </Link>
      </div>
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="md:flex">
            {/* Fish Image */}
            <div className="md:w-1/2 relative">
              <div className="relative h-80 md:h-full w-full">
                <Image
                  src={fish.image}
                  alt={fish.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-md">
                  {fish.type}
                </div>
                {fish.isPopular && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-md">
                    Popular
                  </div>
                )}
              </div>
            </div>
            
            {/* Fish Details */}
            <div className="md:w-1/2 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{fish.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Math.floor(fish.rating || 4.5) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{fish.rating} rating</span>
                {fish.origin && (
                  <span className="text-sm text-gray-600 ml-2">• {fish.origin}</span>
                )}
              </div>
              
              {/* Nutritional Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg mb-6">
                <div className="flex flex-col items-center text-center">
                  <Droplets className="w-5 h-5 text-blue-700 mb-1" />
                  <span className="text-xs text-gray-600">Omega-3</span>
                  <span className="font-semibold text-blue-900">{fish.omega3}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Activity className="w-5 h-5 text-blue-700 mb-1" />
                  <span className="text-xs text-gray-600">Calories</span>
                  <span className="font-semibold text-blue-900">{fish.calories}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Scale className="w-5 h-5 text-blue-700 mb-1" />
                  <span className="text-xs text-gray-600">Protein</span>
                  <span className="font-semibold text-blue-900">{fish.protein}</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">{fish.description}</p>
              
              {/* Weight Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Select Weight</h3>
                <div className="flex flex-wrap gap-2">
                  {fish.weights.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleWeightChange(option.value)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        selectedWeight === option.value
                          ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-400'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price Display - Enhanced */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-green-600">
                  ₹{finalPrice}
                </span>
                {originalPrice > finalPrice && (
                  <span className="text-lg text-gray-500 line-through">₹{originalPrice}</span>
                )}
                {originalPrice > finalPrice && (
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded ml-2">
                    {Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              
              {/* Add to Cart Button */}
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 hover:scale-[1.02] transition-all duration-200 text-white py-3 rounded-md flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </Button>
              
              {/* Benefits & Best For */}
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                {fish.benefits && fish.benefits.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Benefits</h3>
                    <ul className="space-y-1">
                      {fish.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <span className="mr-2 text-green-500">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {fish.bestFor && fish.bestFor.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Best For</h3>
                    <ul className="space-y-1">
                      {fish.bestFor.map((recipe, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <span className="mr-2 text-blue-500">•</span>
                          {recipe}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
