"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { useInView } from 'react-intersection-observer';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ShoppingCart, ChevronRight, ChevronLeft, AlertTriangle, Fish, Shell, Anchor } from 'lucide-react';

// Type definitions
type RequestCache = 'default' | 'force-cache' | 'no-store' | 'no-cache' | 'only-if-cached' | 'reload';

interface Category {
  id: string | number;
  name: string;
  slug: string;
  image: string;
  type?: string;
  icon?: string;
  iconName?: string;
  isActive?: boolean;
  description?: string;
  order?: number;
}

interface FeaturedFish {
  id: string | number;
  name: string;
  slug: string;
  price?: number;
  originalPrice?: number;
  image: string;
  description?: string;
  category?: string;
  unit?: string;
  minOrder?: number;
  isFeatured?: boolean;
  isAvailable?: boolean;
  type?: string;
  featured?: boolean;
  weight?: string;
  discount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminCategory {
  _id: string | number;
  name: string;
  slug: string;
  image: string;
  description: string;
  isActive: boolean;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminData {
  title?: string;
  subtitle?: string;
  categories?: AdminCategory[];
}

interface CategoriesProps {
  adminData?: Partial<AdminData>;
}

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

// Consolidate fallback data
const fallbackCategories: Category[] = [
  {
    id: 1,
    name: "Vangaram Fish",
    image: "/images/fish/vangaram.jpg",
    slug: "vangaram-fish",
    type: "Fish",
    icon: "Fish",
    isActive: true
  },
  {
    id: 2,
    name: "Sliced Vangaram",
    image: "/images/fish/sliced-vangaram.jpg",
    slug: "sliced-vangaram",
    type: "Fish",
    icon: "Fish",
    isActive: true
  },
  {
    id: 3,
    name: "Dried Vangaram",
    image: "/images/fish/dried-vangaram.webp",
    slug: "dried-vangaram",
    type: "Dried Fish",
    icon: "Fish",
    isActive: true
  },
  {
    id: 4,
    name: "Big Prawns",
    image: "/images/fish/big-prawn.webp",
    slug: "big-prawns",
    type: "Prawns",
    icon: "Shell",
    isActive: true
  },
  {
    id: 5,
    name: "Sea Prawns",
    image: "/images/fish/sea-prawn.webp",
    slug: "sea-prawns",
    type: "Prawns",
    icon: "Shell",
    isActive: true
  },
  {
    id: 6,
    name: "Fresh Lobster",
    image: "/images/fish/lobster.jpg",
    slug: "fresh-lobster",
    type: "Shellfish",
    icon: "Shell",
    isActive: true
  },
  {
    id: 7,
    name: "Blue Crabs",
    image: "/images/fish/blue-crabs.jpg",
    slug: "blue-crabs",
    type: "Crabs",
    icon: "Shell",
    isActive: true
  },
  {
    id: 8,
    name: "Normal Crabs",
    image: "/images/fish/normal crabs.jpg",
    slug: "normal-crabs",
    type: "Crabs",
    icon: "Shell",
    isActive: true
  },
  {
    id: 9,
    name: "Fresh Squid",
    image: "/images/fish/squid.jpg",
    slug: "fresh-squid",
    type: "Squid",
    icon: "Fish",
    isActive: true
  },
  {
    id: 10,
    name: "Variety Fishes",
    image: "/images/fish/vareity-fishes.jpg",
    slug: "variety-fishes",
    type: "Fish Combo",
    icon: "Fish",
    isActive: true
  }
];

// Custom hook for intersection observer
const useIntersection = (options: IntersectionObserverInit = {}) => {
  const [ref, setRef] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    if (!ref) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.current.observe(ref);
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [ref, options]);
  
  return [setRef, isIntersecting] as const;
};

// Define types for the intersection observer options
interface IntersectionObserverOptions {
  threshold?: number;
  triggerOnce?: boolean;
  root?: Element | null;
  rootMargin?: string;
}

// Define category and featured fish types
interface Category {
  id: string | number;
  name: string;
  image: string;
  slug: string;
  type?: string;
  icon?: string;
  iconName?: string;
  isActive?: boolean;
  description?: string;
  order?: number;
}

interface FeaturedFish {
  id: string | number;
  name: string;
  image: string;
  slug: string;
  type?: string;
  description?: string;
  featured?: boolean;
  price?: number;
  weight?: string;
  discount?: number;
  category?: string;
  unit?: string;
  minOrder?: number;
  iconName?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

// Fallback featured fish products
const fallbackFeaturedFish: FeaturedFish[] = [
  {
    id: 101,
    name: "Premium Fish Combo",
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
    slug: "premium",
    type: "Premium",
    description: "Curated selection of premium fish varieties",
    featured: true,
    price: 999,
    weight: "1.2kg",
    discount: 10,
    icon: <Fish className="w-4 h-4" />,
    isActive: true
  },
  {
    id: 102,
    name: "Grilling Special",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
    slug: "grilling",
    type: "Combo",
    description: "Perfect for seafood barbecues and grilling",
    featured: true,
    price: 899,
    weight: "800g",
    discount: 15,
    icon: <Fish className="w-4 h-4" />,
    isActive: true
  },
  {
    id: 103,
    name: "Seafood Feast",
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop",
    slug: "feast",
    type: "Combo",
    description: "Premium selection of mixed seafood",
    featured: true,
    price: 1299,
    weight: "1.5kg",
    discount: 8,
    icon: <Shell className="w-4 h-4" />,
    isActive: true
  },
  {
    id: 104,
    name: "Fresh Catch Box",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop",
    slug: "fresh-catch",
    type: "Fresh",
    description: "Today's freshest catches from local fishermen",
    featured: true,
    price: 799,
    weight: "900g",
    discount: 12,
    icon: <Anchor className="w-4 h-4" />,
    isActive: true
  }
];

// Props interface for Categories component
interface AdminCategory {
  name: string;
  image: string;
  link: string;
}

interface AdminData {
  title?: string;
  subtitle?: string;
  categories?: AdminCategory[];
}

interface CategoriesProps {
  adminData?: AdminData;
  title?: string;
  subtitle?: string;
  categories?: AdminCategory[];
  name?: string;
  image?: string;
  link?: string;
}

// Main component with proper TypeScript types
const Categories: React.FC<CategoriesProps> = ({
  adminData = {
    title: 'Shop by Category',
    subtitle: 'Discover our fresh seafood selection',
    categories: []
  }
}) => {
  const router = useRouter();
  const { addToCart } = useCart() || {};
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  
  // Destructure props with defaults
  const { 
    title: propTitle, 
    subtitle: propSubtitle,
    categories: propCategories 
  } = adminData || {};
  
  // Use props or fallback to defaults
  const title = propTitle || 'Shop by Category';
  const subtitle = propSubtitle || 'Discover our fresh seafood selection';
  const adminCategories = propCategories || [];
  
  // State for categories and loading states
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredFish, setFeaturedFish] = useState<FeaturedFish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState<number>(6);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  // Helper function to get image URL with fallback
  const getImageUrl = (item: Category | FeaturedFish | null): string => {
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
  
  // Refs for scrolling and intersection observer
  const categoriesSliderRef = useRef<HTMLDivElement>(null);
  const featuredSliderRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [categoriesInViewRef, categoriesInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Get visible categories based on showAll state
  const visibleCategories = useMemo(() => {
    return showAll ? categories : categories.slice(0, visibleCategoriesCount);
  }, [categories, showAll, visibleCategoriesCount]);
  
  // Check if there are more categories to show
  const hasMoreCategories = categories.length > visibleCategoriesCount;
  
  // Use intersection observer for infinite loading
  const [loadMoreRef, inView] = useInView({
    threshold: 0.5,
    triggerOnce: false
  });
  
  // Load more categories when scrolled to the bottom
  useEffect(() => {
    if (inView && !showAll && hasMoreCategories) {
      setVisibleCategoriesCount(prev => prev + 6);
    }
  }, [inView, showAll, hasMoreCategories]);

  // Get fallback image based on type
  const getFallbackImageByType = (type: string): string => {
    const typeKey = type.toLowerCase();
    
    if (typeKey.includes('fish') || typeKey.includes('vangaram')) {
      return "https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?q=80&w=1974&auto=format&fit=crop";
    } else if (typeKey.includes('prawn') || typeKey.includes('shrimp')) {
      return "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?q=80&w=2070&auto=format&fit=crop";
    } else if (typeKey.includes('crab')) {
      return "https://images.unsplash.com/photo-1559187575-5f89cedf009b?q=80&w=2071&auto=format&fit=crop";
    } else if (typeKey.includes('shell') || typeKey.includes('lobster')) {
      return "https://images.unsplash.com/photo-1610540881356-76bd50e523d3?q=80&w=2070&auto=format&fit=crop";
    } else if (typeKey.includes('combo') || typeKey.includes('premium')) {
      return "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop";
    } else {
      return "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop";
    }
  };

  // Initialize categories and featured fish
  useEffect(() => {
    let isMounted = true;
    
    const loadCategories = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);
        
        console.log("[Categories] Initializing categories...");
        
        // Use fallback data if no admin data is provided
        if (!adminCategories || adminCategories.length === 0) {
          console.log("[Categories] No valid admin data, using fallback categories");
          setCategories(fallbackCategories);
          setFeaturedFish(fallbackFeaturedFish);
          setLoading(false);
          return;
        }
        
        // Process admin categories
        const processedCategories: Category[] = adminData.categories?.map((cat: AdminCategory, index: number) => ({
          id: index + 1,
          name: cat.name || `Category ${index + 1}`,
          slug: cat.name ? cat.name.toLowerCase().replace(/\s+/g, '-') : `category-${index + 1}`,
          image: cat.image || "/images/fish/vangaram.jpg",
          type: 'category',
          isActive: true,
          description: `Fresh ${cat.name || 'seafood'} selection`
        })) || [];
        
        setCategories(processedCategories);
        
        // If no featured fish in admin data, use fallback
        if ((adminData as any).featuredFish && Array.isArray((adminData as any).featuredFish) && (adminData as any).featuredFish.length > 0) {
          setFeaturedFish((adminData as any).featuredFish);
        } else {
          setFeaturedFish(fallbackFeaturedFish);
        }
      } catch (err) {
        console.error("Error initializing categories:", err);
        setError("Failed to load categories. Please try again later.");
        setCategories(fallbackCategories);
        setFeaturedFish(fallbackFeaturedFish);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadCategories();
    
    return () => {
      isMounted = false;
    };
  }, [adminData]);
  
  // Handle loading more categories
  const handleLoadMore = () => {
    setVisibleCategoriesCount((prevCount) => prevCount + 6);
  };

  // Handle category click
  const handleCategoryClick = (category: Category) => {
    router.push(`/category/${category.slug}`);
  };

  // Fetch categories from API if no admin data is provided
  useEffect(() => {
    let isMounted = true;
    
    const fetchCategoriesFromApi = async () => {
      try {
        console.log("[Categories] No admin data provided, fetching from API...");
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/categories', {
          signal: controller.signal,
          cache: 'no-store' as RequestCache
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories (Status: ${response.status})`);
        }
        
        const data = await response.json();
        console.log("[Categories] Raw API response:", data);
        
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            const activeCategories = data.filter((cat: any) => cat.isActive !== false) as Category[];
            setCategories(activeCategories);
            console.log("[Categories] Active categories set:", activeCategories.length);
          } else {
            console.warn("[Categories] Empty or invalid data received, using fallback");
            setCategories(fallbackCategories);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("[Categories] Error fetching categories:", error);
        if (isMounted) {
          setError("Failed to load categories. Please try again later.");
          setCategories(fallbackCategories);
          setLoading(false);
        }
      }
    };
    
    if (!adminData) {
      fetchCategoriesFromApi();
    } else {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [adminData]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log("Fetching featured fish from API...");
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch('/api/featured-fish', {
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          console.warn(`Featured fish API returned status: ${res.status}`);
          throw new Error(`Failed to fetch featured fish (Status: ${res.status})`);
        }
        
        const data = await res.json();
        console.log("Featured fish received:", data);
        
        if (Array.isArray(data) && data.length > 0) {
          const activeFeaturedFish = data.filter(fish => fish.isActive !== false) as FeaturedFish[];
          setFeaturedFish(activeFeaturedFish);
          console.log("Active featured fish set:", activeFeaturedFish.length);
        } else {
          console.warn("Empty or invalid featured fish data, using fallback");
          setFeaturedFish(fallbackFeaturedFish);
        }
      } catch (err) {
        console.error("Error loading featured fish:", err);
        
        if (err instanceof Error && err.name === 'AbortError') {
          console.warn('Featured fish loading timed out, using fallback');
        } else {
          console.warn('Featured fish API failed, using fallback');
        }
        setFeaturedFish(fallbackFeaturedFish);
      }
    };
    
    fetchFeaturedProducts();
  }, []);

  const getIconComponent = (iconName: string | undefined) => {
    if (!iconName) return <Fish className="w-4 h-4" />;
    
    switch (iconName.toLowerCase()) {
      case 'fish':
        return <Fish className="w-4 h-4" />;
      case 'anchor':
        return <Anchor className="w-4 h-4" />;
      case 'shell':
        return <Shell className="w-4 h-4" />;
      default:
        if (iconName.toLowerCase().includes('crab') || iconName.toLowerCase().includes('prawn')) {
          return <Shell className="w-4 h-4" />;
        }
        return <Fish className="w-4 h-4" />;
    }
  };

  // Scroll functions for mobile with improved behavior
  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref && ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref && ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Add to cart functionality for featured fish
  const handleAddToCart = (fish: FeaturedFish, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!addToCart) {
      console.error('addToCart function is not available');
      toast.error('Shopping cart is not available');
      return;
    }
    
    try {
      const cartItem = {
        id: fish.id.toString(),
        name: fish.name,
        src: getImageUrl(fish),
        type: fish.type || 'default', // Provide a default value for type
        price: fish.price || 0, // Provide a fallback value for price
        omega3: 0,
        protein: 0,
        calories: 0,
        benefits: ['Fresh', 'Premium Quality'],
        bestFor: ['Cooking', 'Grilling'],
        rating: 4.5,
        description: fish.description || '',
        quantity: 1,
        addedAt: new Date(),
        netWeight: fish.weight || 'N/A',
        grossWeight: fish.weight || 'N/A'
      };
      
      addToCart(cartItem);
      toast.success(`${fish.name} added to cart!`, {
        description: `₹${fish.price} • ${fish.weight || 'N/A'}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };
  
  // Handle loading more categories
  const loadMoreCategories = () => {
    setShowAll(true);
    setVisibleCategoriesCount(categories.length);
  };
  
  // Calculate visible count for display
  const visibleCount = Math.min(visibleCategoriesCount, categories.length);

  // Debug logs in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("[Categories] Render - categories length:", categories.length);
      console.log("[Categories] Render - loading:", loading);
      console.log("[Categories] Render - error:", error);
      console.log("[Categories] Render - visible categories count:", visibleCategories.length);
    }
  }, [categories, loading, error, visibleCategories]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {/* Category Section Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl aspect-square"></div>
                ))}
              </div>
            </div>
            
            {/* Featured Section Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-10 force-visible" 
      ref={categoriesInViewRef}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 sm:mb-6 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        )}
        
        {/* Shop by Category Section - Moved Above Featured Seafood */}
        <div className="shop-category-section mb-12">
          <div className="flex flex-col space-y-2 mb-4 sm:mb-6 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto sm:mx-0">
              Browse our wide selection of fresh seafood categories
            </p>
          </div>
          
          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {visibleCategories.map((category, index) => (
              <motion.div 
                key={category.id} 
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={fadeInUp}
                custom={index}
                className="category-card"
              >
                <Link 
                  href={`/category/${category.slug || category.id}`}
                  className="block group"
                  onClick={(e) => {
                    if (!category.slug && !category.id) {
                      e.preventDefault();
                      toast.error('This category is not available at the moment');
                    }
                  }}
                >
                  <div className="aspect-square bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center p-4 sm:p-5">
                    {category.icon ? (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-2 sm:mb-3 text-blue-600">
                        {category.icon}
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 flex items-center justify-center mb-2 sm:mb-3">
                        <Fish className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                      </div>
                    )}
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 text-center line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {hasMoreCategories && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showAll ? 'Show Less' : 'View All Categories'}
              </button>
            </div>
          )}
        </div>
        
        {/* Featured Fish Collection - Moved Below Categories */}
        <motion.div
          initial="visible"
          animate="visible"
          variants={fadeInUp}
          className="featured-seafood-section force-visible"
        >
          <div className="flex flex-col space-y-2 mb-4 sm:mb-6 lg:mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {title || 'Featured Seafood'}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto sm:mx-0">
              {subtitle || 'Discover our premium selection of fresh seafood, sourced sustainably and delivered to your doorstep within hours of catch.'}
            </p>
          </div>
          
          {/* Mobile Navigation Controls for Featured Fish */}
          {isMobile && featuredFish.length > 2 && (
            <div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
              <button 
                onClick={() => scrollLeft(featuredSliderRef)}
                className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-sm text-gray-500">Swipe to explore</span>
              <button 
                onClick={() => scrollRight(featuredSliderRef)}
                className="p-2 rounded-full bg-white shadow-md text-blue-600 hover:bg-blue-50 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
          
          {/* Featured Fish Mobile Slider */}
          {isMobile ? (
            <div 
              ref={featuredSliderRef}
              className="flex overflow-x-auto pb-4 sm:pb-6 hide-scrollbar snap-x snap-mandatory gap-3 sm:gap-4 px-1"
              style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory'
              }}
            >
              {featuredFish.slice(0, 6).map((fish) => (
                <motion.div 
                  key={fish.id} 
                  className="flex-shrink-0 w-[240px] sm:w-[260px] snap-start"
                  variants={fadeInUp}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <Link href={`/fish/${fish.slug || fish.id}`} className="block">
                    <div className="overflow-hidden rounded-xl shadow-md h-full bg-white hover:shadow-lg transition-all duration-300">
                      <div className="relative h-36 sm:h-40">
                        <Image 
                          src={getImageUrl(fish)}
                          alt={fish.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="transition-transform hover:scale-105 duration-300"
                        />
                        {fish.discount && fish.discount > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                            {fish.discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">{fish.name}</h3>
                          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-xs">
                            {getIconComponent(fish.iconName || fish.type)}
                            <span className="hidden sm:inline">{fish.type}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                          {fish.description || `Fresh ${fish.name} with premium quality`}
                        </p>
                        
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-blue-600 text-base sm:text-lg">₹{fish.price || 0}</span>
                            {fish.discount && fish.discount > 0 && fish.price && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{Math.round(fish.price / (1 - fish.discount/100))}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{fish.weight}</span>
                        </div>
                        
                        <Button
                          onClick={(e) => handleAddToCart(fish, e)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5"
                          size="sm"
                          variant="default"
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {featuredFish.slice(0, 4).map((fish) => (
                <motion.div 
                  key={fish.id} 
                  variants={fadeInUp}
                  className="group"
                >
                  <Link href={`/fish/${fish.slug || fish.id}`} className="block">
                    <div className="overflow-hidden rounded-xl shadow-md h-full bg-white hover:shadow-lg transition-all duration-300">
                      <div className="relative h-44 sm:h-48 md:h-52">
                        <Image 
                          src={getImageUrl(fish)}
                          alt={fish.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                        {fish.discount && fish.discount > 0 && (
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                            {fish.discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm sm:text-base">{fish.name}</h3>
                          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                            {getIconComponent(fish.iconName || fish.type)}
                            <span>{fish.type}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
                          {fish.description || `Fresh ${fish.name} with premium quality`}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-blue-600 text-base sm:text-xl">₹{fish.price || 0}</span>
                            {fish.discount && fish.discount > 0 && fish.price && (
                              <span className="text-xs text-gray-500 line-through">
                                ₹{Math.round(fish.price / (1 - fish.discount/100))}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{fish.weight}</span>
                        </div>
                        
                        <Button
                          onClick={(e) => handleAddToCart(fish, e)}
                          className="w-full mt-2 sm:mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                          size="sm"
                          variant="default"
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
        
        {/* Shop by Category */}
        <motion.div
          initial="visible"
          animate="visible"
          variants={fadeInUp}
          className="pt-4 sm:pt-6 lg:pt-8 force-visible"
        >
          <div className="flex flex-col space-y-2 mb-4 sm:mb-6 lg:mb-8 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {adminData?.title || "Shop by Category"}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto sm:mx-0">
              {adminData?.subtitle || "Fresh catches from the sea"}
            </p>
          </div>
           {loading ? (
            <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-full aspect-square"></div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-xl font-bold text-gray-800">No categories available</h3>
              <p className="text-gray-600">Please check back later</p>
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto"
            >
              {categories.map((category) => (
                <motion.div 
                  key={category.id} 
                  variants={fadeInUp}
                  className="group text-center"
                >
                  <Link href={`/category/${category.slug || category.id}`} className="block">
                    {/* Circular Image */}
                    <div className="relative overflow-hidden rounded-full shadow-lg bg-white hover:shadow-xl transition-all duration-300 aspect-square border-4 border-white hover:border-blue-100 mb-2 sm:mb-3">
                      <Image 
                        src={getImageUrl(category)}
                        alt={category.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="group-hover:scale-110 transition-transform duration-300 rounded-full"
                        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/fish/vangaram.jpg";
                        }}
                      />
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 transition-all duration-300 rounded-full"></div>
                    </div>
                    
                    {/* Category Name Below Circle */}
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight px-1">
                      {category.name}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;
