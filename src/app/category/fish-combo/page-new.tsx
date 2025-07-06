'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Heart, Plus, Minus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

interface CartItem extends Fish {
  quantity: number;
}

const FishCard = ({ fish, onAddToCart }: { fish: Fish; onAddToCart: (fish: Fish, quantity: number) => void }) => {
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  const increment = () => setQuantity(prev => Math.min(prev + 1, 10));
  const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div className="relative aspect-square">
        <Image
          src={fish.src}
          alt={fish.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33.33vw, 25vw"
        />
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {fish.type}
        </div>
        <button 
          className="absolute top-2 left-2 bg-white/90 rounded-full p-1.5 hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // Add to favorites logic here
          }}
        >
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800">{fish.name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm text-gray-600">{fish.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-blue-600">₹{fish.price}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {fish.omega3}g Ω3 • {fish.protein}g protein
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  decrement();
                }}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-3 py-1 w-10 text-center">{quantity}</span>
              <button 
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  increment();
                }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button 
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(fish, quantity);
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>
          
          <button 
            className="w-full text-center text-sm text-blue-600 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
          >
            {showDetails ? 'Hide details' : 'View details'}
          </button>
          
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="mb-2">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Health Benefits:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {fish.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Best For:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {fish.bestFor.map((method, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState<{show: boolean; message: string}>({ show: false, message: '' });

  const addToCart = (fish: Fish, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === fish.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === fish.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevCart, { ...fish, quantity }];
    });
    
    setNotification({
      show: true,
      message: `${quantity} ${fish.name} added to cart`
    });
    
    setTimeout(() => setNotification({ show: false, message: '' }), 3000);
  };

  const removeFromCart = (fishId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== fishId));
  };

  const updateQuantity = (fishId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === fishId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Kadal Thunai
          </Link>
          <div className="relative">
            <button 
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 text-gray-700 hover:text-blue-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
            
            {/* Cart Dropdown */}
            {showCart && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-800">Your Cart</h3>
                </div>
                
                {cart.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Your cart is empty
                  </div>
                ) : (
                  <>
                    <div className="max-h-96 overflow-y-auto p-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center py-2 border-b">
                          <div className="w-16 h-16 relative rounded-md overflow-hidden">
                            <Image
                              src={item.src}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                            <p className="text-sm text-blue-600 font-semibold">
                              ₹{item.price} x {item.quantity}
                            </p>
                            <div className="flex items-center mt-1">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="mx-2 text-sm">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t">
                      <div className="flex justify-between mb-4">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">₹{calculateTotal()}</span>
                      </div>
                      <Link 
                        href="/checkout"
                        className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Proceed to Checkout
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Fresh Seafood Selection</h1>
          <p className="text-gray-600">Premium quality seafood delivered fresh to your doorstep</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {fishData.map((fish) => (
            <FishCard 
              key={fish.id} 
              fish={fish} 
              onAddToCart={addToCart} 
            />
          ))}
        </div>
      </main>

      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
