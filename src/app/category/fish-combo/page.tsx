'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { ShoppingCart, Heart, Plus, Minus, Star, Loader2, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from 'framer-motion';
import { useAnimatedInView, fadeInUp, fadeIn } from '@/hooks/useAnimatedInView';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/ui/responsive-container';
import { AnimatedElement, AnimatedHeading } from '@/components/ui/animated-element';
import AddToCartLoginRequired from '@/components/AddToCartLoginRequired';

interface Fish {
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
  weight?: string;
  netWeight?: string;
  originalPrice?: number;
}

const FishCard = ({ fish, index = 0 }: { fish: Fish; index?: number }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const increment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const decrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleAddToCart = async (selectedQuantity: number) => {
    setIsAdding(true);
    
    try {
      // Create a proper cart item
      const cartItem = {
        ...fish,
        quantity: selectedQuantity,
        netWeight: fish.weight || fish.netWeight || '500g'
      };
      
      addToCart(cartItem, selectedQuantity);
      
      // Show success feedback
      toast.success(`Added ${fish.name} to cart`, {
        description: `${selectedQuantity} item${selectedQuantity > 1 ? 's' : ''} added successfully.`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      // Reset adding state
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  const { ref, controls, inView } = useAnimatedInView({
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.05 } },
    hidden: { opacity: 0, y: 20, transition: { duration: 0.5 } },
    once: true,
    threshold: 0.1
  });

  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={controls}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full border border-gray-100"
      data-component-name="FishCard"
    >
      {/* Fish Image and Link */}
      <Link href={`/fish/${fish.id}`} className="block">
        <div className="relative h-48 w-full">
          <Image
            src={fish.src}
            alt={fish.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 4} // Only prioritize loading for the first few items
            loading={index < 4 ? "eager" : "lazy"}
          />
          {/* Type Badge */}
          <motion.div 
            className="absolute top-2 right-2 bg-tendercuts-red text-white text-xs font-medium px-2 py-1 rounded"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 + (index * 0.05) }}
          >
            {fish.type}
          </motion.div>
          {/* Favorite Button */}
          <button 
            className="absolute top-2 left-2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.info('Added to favorites');
            }}
            aria-label="Add to favorites"
          >
            <Heart className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </Link>

      {/* Fish Details */}
      <div className="p-4" data-component-name="FishCard">
        <Link href={`/fish/${fish.id}`} className="block">
          {/* Fish Name and Rating */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{fish.name}</h3>
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded shrink-0 ml-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-medium text-gray-800">{fish.rating}</span>
            </div>
          </div>
          
          {/* Price and Nutrition Info */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-blue-600">₹{fish.price}</span>
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded">
              <span className="text-xs font-medium text-gray-700">
                {fish.omega3}g Ω3 • {fish.protein}g protein • {fish.calories} cal
              </span>
            </div>
          </div>
        </Link>

        {/* Mobile-only nutrition info */}
        <div className="flex sm:hidden items-center mb-3 bg-gray-50 px-2 py-1 rounded w-full">
          <span className="text-xs font-medium text-gray-700">
            {fish.omega3}g Ω3 • {fish.protein}g protein • {fish.calories} cal
          </span>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="mt-2">
          <div className="flex items-center gap-2">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden" data-component-name="FishCard">
              <button 
                type="button"
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors focus:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuantity(prev => Math.max(prev - 1, 1));
                }}
                aria-label="Decrease quantity"
                disabled={isAdding}
                data-component-name="FishCard"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="px-3 py-2 w-12 text-center font-medium text-gray-900 border-x border-gray-100">
                {quantity}
              </span>
              <button 
                type="button"
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors focus:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuantity(prev => Math.min(prev + 1, 10));
                }}
                aria-label="Increase quantity"
                disabled={isAdding}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {/* Add to Cart Button */}
            <AddToCartLoginRequired
              productId={fish.id}
              productName={fish.name}
              productImage={fish.src}
              productPrice={fish.price}
              productType={fish.type}
              netWeight={fish.weight || fish.netWeight || '500g'}
              quantity={quantity}
              onAddToCart={handleAddToCart}
              disabled={isAdding}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const fishData: Fish[] = [
  { 
    id: 'paal-sura',
    name: "Paal Sura", 
    src: "/images/fishes picss/Paal-sura.jpg",
    type: "Freshwater Fish",
    price: 450,
    omega3: 1.2,
    protein: 22,
    calories: 120,
    benefits: ["Rich in protein", "High in Omega-3", "Low in calories"],
    bestFor: ["Fry", "Curry", "Grill"],
    rating: 4.5
  },
  { 
    id: 'big-paarai',
    name: "Big Paarai Fish", 
    src: "/images/fishes picss/big-paarai-fish.jpg",
    type: "Saltwater Fish",
    price: 580,
    omega3: 1.8,
    protein: 24,
    calories: 130,
    benefits: ["High in protein", "Rich in vitamins", "Great for grilling"],
    bestFor: ["Grill", "Fry", "Bake"],
    rating: 4.3
  },
  {
    id: 'kalava',
    name: "Kalava",
    src: "/images/fishes picss/kalava.jpg",
    type: "Saltwater Fish",
    price: 520,
    omega3: 2.1,
    protein: 26,
    calories: 140,
    benefits: ["High in Omega-3", "Rich in minerals", "Low in mercury"],
    bestFor: ["Fry", "Curry", "Bake"],
    rating: 4.5
  },
  {
    id: 'karuva-vaval',
    name: "Karuva Vaval",
    src: "/images/fishes picss/karuva-vaval.jpg",
    type: "Saltwater Fish",
    price: 480,
    omega3: 1.5,
    protein: 23,
    calories: 125,
    benefits: ["Rich in protein", "Good for heart health", "Low in fat"],
    bestFor: ["Fry", "Curry"],
    rating: 4.2
  },
  {
    id: 'katla',
    name: "Katla",
    src: "/images/fishes picss/katla.jpg",
    type: "Freshwater Fish",
    price: 350,
    omega3: 1.1,
    protein: 20,
    calories: 115,
    benefits: ["High in protein", "Rich in vitamins", "Low in calories"],
    bestFor: ["Curry", "Fry"],
    rating: 4.0
  },
  {
    id: 'koduva',
    name: "Koduva",
    src: "/images/fishes picss/koduva.jpg",
    type: "Saltwater Fish",
    price: 580,
    omega3: 2.3,
    protein: 27,
    calories: 145,
    benefits: ["Rich in Omega-3", "High in protein", "Great for grilling"],
    bestFor: ["Grill", "Fry", "Bake"],
    rating: 4.6
  },
  {
    id: 'kola-fish',
    name: "Kola Fish",
    src: "/images/fishes picss/kola-fish.jpg",
    type: "Saltwater Fish",
    price: 420,
    omega3: 1.3,
    protein: 21,
    calories: 118,
    benefits: ["Rich in protein", "Low in fat", "High in vitamins"],
    bestFor: ["Fry", "Curry"],
    rating: 4.1
  },
  {
    id: 'mathi-fish',
    name: "Mathi Fish",
    src: "/images/fishes picss/mathi-fish.jpg",
    type: "Saltwater Fish",
    price: 320,
    omega3: 1.7,
    protein: 18,
    calories: 105,
    benefits: ["Rich in Omega-3", "High in protein", "Low in calories"],
    bestFor: ["Fry", "Curry", "Grill"],
    rating: 4.2
  },
  {
    id: 'nethili',
    name: "Nethili",
    src: "/images/fishes picss/nethili.jpg",
    type: "Saltwater Fish",
    price: 350,
    omega3: 1.6,
    protein: 20,
    calories: 118,
    benefits: ["High in calcium", "Rich in protein", "Low in fat"],
    bestFor: ["Fry", "Curry", "Roast"],
    rating: 4.3
  },
  {
    id: 'paarai-fish',
    name: "Paarai Fish",
    src: "/images/fishes picss/paarai-fish.jpg",
    type: "Saltwater Fish",
    price: 480,
    omega3: 1.4,
    protein: 22,
    calories: 125,
    benefits: ["High in protein", "Rich in Omega-3", "Low in calories"],
    bestFor: ["Fry", "Grill", "Curry"],
    rating: 4.4
  },
  {
    id: 'red-snapper',
    name: "Red Snapper",
    src: "/images/fishes picss/red-snapper.jpg",
    type: "Saltwater Fish",
    price: 620,
    omega3: 2.0,
    protein: 26,
    calories: 140,
    benefits: ["High in protein", "Rich in vitamins", "Great for grilling"],
    bestFor: ["Grill", "Bake", "Fry"],
    rating: 4.7
  },
  {
    id: 'shankara-fish',
    name: "Shankara Fish",
    src: "/images/fishes picss/shankara-fish.jpg",
    type: "Saltwater Fish",
    price: 580,
    omega3: 2.1,
    protein: 27,
    calories: 145,
    benefits: ["Rich in Omega-3", "High in protein", "Great for grilling"],
    bestFor: ["Grill", "Fry", "Bake"],
    rating: 4.6
  },
  {
    id: 'sheela-fish',
    name: "Sheela Fish",
    src: "/images/fishes picss/sheela-fish.jpg",
    type: "Saltwater Fish",
    price: 550,
    omega3: 2.0,
    protein: 26,
    calories: 140,
    benefits: ["High in protein", "Rich in Omega-3", "Great for grilling"],
    bestFor: ["Grill", "Fry", "Bake"],
    rating: 4.5
  },
  {
    id: 'small-koduva',
    name: "Small Koduva",
    src: "/images/fishes picss/small-koduva.jpg",
    type: "Saltwater Fish",
    price: 350,
    omega3: 1.8,
    protein: 24,
    calories: 130,
    benefits: ["Rich in Omega-3", "High in protein", "Great for frying"],
    bestFor: ["Fry", "Curry", "Grill"],
    rating: 4.3
  },
  {
    id: 'tuna-fish',
    name: "Tuna Fish",
    src: "/images/fishes picss/tuna-fish.jpg",
    type: "Saltwater Fish",
    price: 680,
    omega3: 2.5,
    protein: 29,
    calories: 150,
    benefits: ["Very high in protein", "Rich in Omega-3", "Great for steaks"],
    bestFor: ["Grill", "Steak", "Sushi"],
    rating: 4.8
  },
  {
    id: 'tuna-slices',
    name: "Tuna Slices",
    src: "/images/fishes picss/tuna-slices.jpg",
    type: "Saltwater Fish",
    price: 650,
    omega3: 2.4,
    protein: 28,
    calories: 145,
    benefits: ["High in protein", "Rich in Omega-3", "Perfect for sushi"],
    bestFor: ["Sushi", "Sashimi", "Grill"],
    rating: 4.7
  },
  {
    id: 'squid',
    name: "Fresh Squid (Kanava)",
    src: "/images/fishes picss/squid.jpg",
    type: "Shellfish",
    price: 499,
    omega3: 0.9,
    protein: 18,
    calories: 92,
    benefits: ["High in protein", "Low in fat", "Rich in minerals"],
    bestFor: ["Fry", "Curry", "Grill"],
    rating: 4.6
  },
  {
    id: 'cuttlefish',
    name: "Cuttlefish (Kanava)",
    src: "/images/fishes picss/cuttlefish.jpg",
    type: "Shellfish",
    price: 520,
    omega3: 1.0,
    protein: 20,
    calories: 95,
    benefits: ["High in protein", "Low in calories", "Rich in vitamins"],
    bestFor: ["Fry", "Curry", "Roast"],
    rating: 4.5
  },
  {
    id: 'squid',
    name: "Fresh Squid (Kanava)",
    src: "/images/fishes picss/squid.jpg",
    type: "Shellfish",
    price: 499,
    omega3: 0.9,
    protein: 18,
    calories: 92,
    benefits: ["High in protein", "Low in fat", "Rich in minerals"],
    bestFor: ["Fry", "Curry", "Grill"],
    rating: 4.6
  },
  {
    id: 'cuttlefish',
    name: "Cuttlefish (Kanava)",
    src: "/images/fishes picss/cuttlefish.jpg",
    type: "Shellfish",
    price: 520,
    omega3: 1.0,
    protein: 20,
    calories: 95,
    benefits: ["High in protein", "Low in calories", "Rich in vitamins"],
    bestFor: ["Fry", "Curry", "Roast"],
    rating: 4.5
  },
  {
    id: 'white-vaval',
    name: "White Vaval",
    src: "/images/fishes picss/white-vaval.jpg",
    type: "Saltwater Fish",
    price: 420,
    omega3: 1.3,
    protein: 21,
    calories: 118,
    benefits: ["Rich in protein", "Low in fat", "High in vitamins"],
    bestFor: ["Fry", "Curry", "Grill"],
    rating: 4.1
  },
  {
    id: 'yellow-parai',
    name: "Yellow Parai",
    src: "/images/fishes picss/yellow-parai.jpg",
    type: "Saltwater Fish",
    price: 490,
    omega3: 1.5,
    protein: 22,
    calories: 125,
    benefits: ["High in protein", "Rich in Omega-3", "Low in calories"],
    bestFor: ["Fry", "Grill", "Bake"],
    rating: 4.4
  },
];

export default function FishComboPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter fish based on search term
  const filteredFish = fishData.filter(fish => 
    fish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fish.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <ResponsiveContainer maxWidth="2xl" className="py-8" as="main" data-component-name="FishComboPage">
        <AnimatedElement animation={fadeInUp} className="mb-8">
          <AnimatedHeading 
            className="text-3xl font-bold text-gray-800 mb-2"
            level={1}
          >
            Fresh Seafood Selection
          </AnimatedHeading>
          <p className="text-gray-600">Premium quality seafood delivered fresh to your doorstep</p>
          
          {/* Search and Filter */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search for fish..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tendercuts-red/30 focus:border-tendercuts-red transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
          
          {/* Filter Options - Simple example */}
          {isFilterOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 p-4 bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Type</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-tendercuts-red mr-2" />
                      <span>Freshwater Fish</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-tendercuts-red mr-2" />
                      <span>Saltwater Fish</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-tendercuts-red mr-2" />
                      <span>Dried Fish</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-tendercuts-red mr-2" />
                      <span>Under ₹300</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-tendercuts-red mr-2" />
                      <span>₹300 - ₹500</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-tendercuts-red mr-2" />
                      <span>Above ₹500</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Sort By</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="sort" className="text-tendercuts-red mr-2" />
                      <span>Price: Low to High</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="sort" className="text-tendercuts-red mr-2" />
                      <span>Price: High to Low</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="sort" className="text-tendercuts-red mr-2" />
                      <span>Rating</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatedElement>
        
        {filteredFish.length > 0 ? (
          <ResponsiveGrid
            cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
            gap="default"
            className="mt-6"
          >
            {filteredFish.map((fish, index) => (
              <FishCard 
                key={fish.id} 
                fish={fish}
                index={index}
              />
            ))}
          </ResponsiveGrid>
        ) : (
          <div className="text-center py-16">
            <AnimatedElement className="flex flex-col items-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No fish found</h2>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <Button 
                variant="outline" 
                className="border-tendercuts-red text-tendercuts-red hover:bg-tendercuts-red/5"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </AnimatedElement>
          </div>
        )}
        
        {/* Fish Preparation Tips - Additional Content */}
        <AnimatedElement className="mt-16 bg-white rounded-lg shadow-sm p-6" delay={0.3}>
          <AnimatedHeading className="text-2xl font-bold text-gray-800 mb-4" level={2}>
            Fish Preparation Tips
          </AnimatedHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedElement className="bg-gray-50 p-4 rounded-lg" delay={0.4}>
              <h3 className="font-semibold text-gray-900 mb-2">Cleaning</h3>
              <p className="text-gray-600 text-sm">Our fish is pre-cleaned, but you may rinse it under cold water before cooking. Pat dry with paper towels for best results.</p>
            </AnimatedElement>
            <AnimatedElement className="bg-gray-50 p-4 rounded-lg" delay={0.5}>
              <h3 className="font-semibold text-gray-900 mb-2">Cooking</h3>
              <p className="text-gray-600 text-sm">For most fish, cook until the flesh is opaque and flakes easily with a fork. Avoid overcooking to maintain moisture.</p>
            </AnimatedElement>
            <AnimatedElement className="bg-gray-50 p-4 rounded-lg" delay={0.6}>
              <h3 className="font-semibold text-gray-900 mb-2">Storage</h3>
              <p className="text-gray-600 text-sm">Keep refrigerated and use within 1-2 days for optimal freshness. You can freeze for up to 3 months in an airtight container.</p>
            </AnimatedElement>
          </div>
        </AnimatedElement>
      </ResponsiveContainer>
    </div>
  );
}
