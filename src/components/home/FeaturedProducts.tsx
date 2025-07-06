'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, AlertTriangle, Heart, TestTube } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

// Featured Product Interface
interface FeaturedProduct {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  slug: string;
  type: string;
  description: string;
  featured: boolean;
  price: number;
  weight: string;
  discount: number;
  tag?: string;
  isActive?: boolean;
}

// Fallback data in case API fails
const fallbackProducts = [
  {
    id: 'premium-combo',
    name: "Premium Fish Combo",
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
    slug: "premium",
    type: "Premium",
    description: "Curated selection of premium fish varieties",
    featured: true,
    price: 999,
    weight: "1.2kg",
    discount: 10,
    tag: "Premium"
  },
  {
    id: 'grilling-special',
    name: "Grilling Special",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
    slug: "grilling",
    type: "Combo",
    description: "Perfect for seafood barbecues and grilling",
    featured: true,
    price: 899,
    weight: "800g",
    discount: 15,
    tag: "Best Seller"
  },
  {
    id: 'seafood-feast',
    name: "Seafood Feast",
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop",
    slug: "feast",
    type: "Combo",
    description: "Premium selection of mixed seafood",
    featured: true,
    price: 1299,
    weight: "1.5kg",
    discount: 8,
    tag: "Luxury"
  },
  {
    id: 'fresh-catch',
    name: "Fresh Catch Box",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop",
    slug: "fresh-catch",
    type: "Fresh",
    description: "Today's freshest catches from local fishermen",
    featured: true,
    price: 799,
    weight: "900g",
    discount: 12,
    tag: "Fresh"
  }
];

const FeaturedProducts = ({ adminData }: { adminData?: any }) => {
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const [featuredRef, isFeaturedVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({});
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'fallback' | 'error'>('loading');

  // Test API connection function
  const testApiConnection = async () => {
    try {
      console.log('[FeaturedProducts] Testing API connection...');
      const response = await fetch('/api/featured-fish', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && (Array.isArray(data.products) || Array.isArray(data))) {
          setApiStatus('connected');
          console.log('[FeaturedProducts] ✅ API connection successful');
          return true;
        }
      }
      
      setApiStatus('fallback');
      console.log('[FeaturedProducts] ⚠️ API returned invalid data, using fallback');
      return false;
    } catch (error) {
      setApiStatus('error');
      console.error('[FeaturedProducts] ❌ API connection failed:', error);
      return false;
    }
  };

  // Weight options for fish products
  const weightOptions = [
    { value: '250g', label: '250g', multiplier: 0.25 },
    { value: '500g', label: '500g', multiplier: 0.5 },
    { value: '750g', label: '750g', multiplier: 0.75 },
    { value: '1kg', label: '1kg', multiplier: 1 },
    { value: '1.5kg', label: '1.5kg', multiplier: 1.5 },
    { value: '2kg', label: '2kg', multiplier: 2 }
  ];

  // Get selected weight for a product
  const getSelectedWeight = (productId: string) => {
    return selectedWeights[productId] || '500g';
  };

  // Handle weight change
  const handleWeightChange = (productId: string, weight: string) => {
    setSelectedWeights(prev => ({
      ...prev,
      [productId]: weight
    }));
  };

  // Calculate price based on selected weight
  const calculatePrice = (basePrice: number, selectedWeight: string) => {
    const option = weightOptions.find(opt => opt.value === selectedWeight);
    const multiplier = option?.multiplier || 0.5;
    return Math.round(basePrice * multiplier);
  };

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Helper function to get image URL with fallback
  const getImageUrl = (product: any): string => {
    if (!product) return "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop";
    
    // If imageUrl is directly available, use it
    if (product.imageUrl) return product.imageUrl;
    
    // If image is available, use it
    if (product.image) {
      // Check if image is a full URL or just a path
      if (product.image.startsWith('http')) {
        return product.image;
      } else {
        // For local images, ensure they have the correct path
        return product.image.startsWith('/') ? product.image : `/${product.image}`;
      }
    }
    
    // Default fallback image
    return "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop";
  };

  useEffect(() => {
    console.log('[FeaturedProducts] Component mounted with adminData:', adminData);
    
    // If admin data is provided, use it directly
    if (adminData) {
      console.log('[FeaturedProducts] Using admin data:', adminData);
      
      let productsData = [];
      // Handle different possible structures of adminData
      if (Array.isArray(adminData)) {
        productsData = adminData;
      } else if (Array.isArray(adminData.products)) {
        productsData = adminData.products;
      } else if (adminData.data && Array.isArray(adminData.data.products)) {
        productsData = adminData.data.products;
      }
      
      console.log('[FeaturedProducts] Products from admin data:', productsData.length);
      const activeProducts = productsData.filter((product: FeaturedProduct) => product.isActive !== false);
      console.log('[FeaturedProducts] Active products count:', activeProducts.length);
      setProducts(activeProducts);
      setLoading(false);
      return;
    }

    console.log('[FeaturedProducts] No admin data, fetching from API');
    // Otherwise fetch from API with better error handling and retries
    setLoading(true);
    setError(null);
    
    const fetchFeaturedProducts = async (retryCount = 0) => {
      try {
        setApiStatus('loading');
        console.log(`[FeaturedProducts] Fetching from /api/featured-fish (attempt ${retryCount + 1})`);
        
        const response = await fetch('/api/featured-fish', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // Ensure fresh data
        });
        
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("[FeaturedProducts] Featured fish data received:", data);
        
        let productsArray = [];
        
        // Handle API response structure
        if (data && Array.isArray(data.products)) {
          productsArray = data.products;
        } else if (Array.isArray(data)) {
          productsArray = data;
        } else {
          console.warn('[FeaturedProducts] Unexpected API response format:', data);
          throw new Error('Invalid API response format');
        }
        
        // Filter active products
        const activeProducts = productsArray.filter((product: FeaturedProduct) => 
          product.isActive !== false && product.featured !== false
        );
        
        console.log(`[FeaturedProducts] ✅ Processed ${activeProducts.length} active products from API`);
        
        if (activeProducts.length === 0) {
          console.warn('[FeaturedProducts] No active featured products found, using fallback');
          setProducts(fallbackProducts);
          setError('No featured products available. Showing sample products.');
          setApiStatus('fallback');
        } else {
          setProducts(activeProducts);
          setError(null);
          setApiStatus('connected');
        }
        
      } catch (err) {
        console.error(`[FeaturedProducts] ❌ Error fetching featured fish (attempt ${retryCount + 1}):`, err);
        
        // Retry logic - try up to 2 times
        if (retryCount < 1) {
          console.log('[FeaturedProducts] Retrying API call...');
          setTimeout(() => fetchFeaturedProducts(retryCount + 1), 1000);
          return;
        }
        
        setError(`Failed to load featured products: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setProducts(fallbackProducts); // Always provide fallback data
        setApiStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, [adminData]);

  // Handle adding item to cart
  const handleAddToCart = (e: React.MouseEvent, product: FeaturedProduct) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Ensure product has required fields
      if (!product || !product.name) {
        throw new Error("Invalid product data");
      }
      
      const selectedWeight = getSelectedWeight(product.id);
      const calculatedPrice = calculatePrice(product.price, selectedWeight);
      
      // Convert featured product to cart item format
      const cartItem = {
        id: product.id || `product-${Date.now()}`, // Ensure ID exists
        name: product.name,
        src: getImageUrl(product),
        type: product.type || 'Fish',
        price: calculatedPrice,
        omega3: 0, // Default values for featured products
        protein: 0,
        calories: 0,
        benefits: [],
        bestFor: [],
        rating: 4.5,
        description: product.description || '',
        quantity: 1,
        weight: selectedWeight,
        discount: product.discount || 0,
        addedAt: new Date()
      };
      
      // Ensure price is a valid number
      if (isNaN(cartItem.price)) {
        cartItem.price = 0;
      }
      
      // Add vibration feedback for mobile
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
      
      addToCart(cartItem, 1);
      toast.success(`${product.name} (${selectedWeight}) added to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Could not add item to cart. Please try again.");
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
        toast.success("Removed from wishlist");
      } else {
        newWishlist.add(productId);
        toast.success("Added to wishlist");
      }
      return newWishlist;
    });
  };

  // Scroll functions for mobile horizontal scrolling
  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <section className="py-6 sm:py-8 lg:py-12 bg-gradient-to-b from-red-50 via-orange-50 to-white relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-red-600">{adminData?.title || "Today's Fresh Catch"}</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">Loading fresh products...</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-48 sm:h-52 w-full"></div>
                <div className="p-4 sm:p-5">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If there are no products to show after API call and fallbacks
  console.log('[FeaturedProducts] About to render, products.length:', products.length);
  console.log('[FeaturedProducts] Products array:', products);
  
  if (products.length === 0) {
    console.log('[FeaturedProducts] Rendering empty state - no products');
    return (
      <section className="py-6 sm:py-8 lg:py-12 bg-gradient-to-b from-red-50 via-orange-50 to-white relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-red-600">{adminData?.title || "Today's Fresh Catch"}</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">No fresh seafood available at the moment.</p>
          <Link href="/category/seafood">
            <Button className="bg-red-600 hover:bg-red-700">
              View All Seafood
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  console.log('[FeaturedProducts] Rendering products section with', products.length, 'products');

  return (
    <section className="py-6 sm:py-8 lg:py-12 bg-gradient-to-b from-red-50 via-orange-50 to-white relative" ref={featuredRef as React.RefObject<HTMLElement>}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        )}
        
        <motion.div 
          className="mb-6 sm:mb-8 lg:mb-10"
          initial="hidden"
          animate={isFeaturedVisible ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-3 lg:mb-4 text-red-600">
            {adminData?.title || "Today's Fresh Catch"}
          </h2>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            {adminData?.subtitle || "Discover our premium selection of fresh seafood, sourced sustainably and delivered to your doorstep within hours of catch."}
          </p>
        </motion.div>
        
        {/* Desktop Navigation Controls */}
        {!isMobile && products.length > 4 && (
          <div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
            <button 
              onClick={scrollLeft}
              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-sm text-gray-600">Scroll to explore more</div>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Mobile Navigation Controls */}
        {isMobile && products.length > 1 && (
          <div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
            <button 
              onClick={scrollLeft}
              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="text-sm text-gray-600">Swipe to explore</div>
            <button 
              onClick={scrollRight}
              className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
        
        {/* Horizontal Scroll for All Devices */}
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto pb-6 hide-scrollbar snap-x snap-mandatory gap-3 sm:gap-4 lg:gap-5 px-1"
          style={{
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {products.map((product) => {
            const selectedWeight = getSelectedWeight(product.id);
            const calculatedPrice = calculatePrice(product.price, selectedWeight);
            const originalPrice = product.discount > 0 ? Math.round(calculatedPrice / (1 - product.discount/100)) : null;
            
            return (
              <motion.div 
                key={product.id} 
                className={`flex-shrink-0 snap-start ${
                  isMobile 
                    ? 'w-[240px] sm:w-[260px]' 
                    : 'w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] xl:w-[300px]'
                }`}
                variants={fadeInUp}
                initial="hidden"
                animate={isFeaturedVisible ? "visible" : "hidden"}
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col transform hover:scale-[1.02] border border-gray-100 overflow-hidden">
                  <div className={`relative w-full bg-gray-50 flex-shrink-0 ${isMobile ? 'h-36 sm:h-40' : 'aspect-square'}`}>
                    <Link href={`/fish/${product.slug || product.id}`} className="block w-full h-full">
                      <Image 
                        src={getImageUrl(product)} 
                        alt={product.name} 
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 260px, 280px"
                        priority={products.indexOf(product) <= 3}
                      />
                    </Link>
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                        {product.discount}% OFF
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                      {product.tag || product.type || 'Fresh'}
                    </div>
                    <button
                      onClick={(e) => handleWishlistToggle(e, product.id)}
                      className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 hover:bg-white transition-colors shadow-md"
                      aria-label={wishlist.has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 transition-colors ${
                          wishlist.has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'
                        }`} 
                      />
                    </button>
                  </div>
                  
                  <div className={`p-3 flex-grow flex flex-col ${isMobile ? '' : 'min-h-[160px]'}`}>
                    <div className="flex-grow">
                      <Link href={`/fish/${product.slug || product.id}`} className="block">
                        <h3 className={`font-medium text-gray-900 mb-1 line-clamp-2 hover:text-red-600 transition-colors leading-tight ${isMobile ? 'text-sm' : 'text-sm'}`}>
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Weight Selection */}
                      <div className="mb-2">
                        <select
                          value={selectedWeight}
                          onChange={(e) => handleWeightChange(product.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs bg-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {weightOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Price and Add to Cart */}
                    <div className={`flex ${isMobile ? 'justify-between items-center mt-auto' : 'flex-col gap-2 pt-2 border-t border-gray-100'}`}>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-red-600 text-sm">
                          ₹{calculatedPrice}
                        </span>
                        {originalPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{originalPrice}
                          </span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className={`bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1.5 text-xs ${
                          isMobile ? 'h-7 px-2 rounded-md' : 'w-full py-1.5 rounded-md justify-center'
                        }`}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {!isMobile && 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
