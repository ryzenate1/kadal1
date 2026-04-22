'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, X, Search, ShoppingCart, User, MapPin, 
  Home, Layers, Package, Heart, Bell, HelpCircle, Info, LogOut, LogIn,
  AlertTriangle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

interface MenuItem {
  name: string;
  href: string;
  icon: any; // Using 'any' for simplicity, ideally this would be more specific
  requiresAuth: boolean;
  isActive?: (pathname: string) => boolean;
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Fish Combos', slug: 'fish-combo', isActive: true },
  { id: '2', name: 'Premium Fish', slug: 'premium-fish', isActive: true },
  { id: '3', name: 'Fresh Fish', slug: 'fresh-fish', isActive: true },
  { id: '4', name: 'Sea Prawns', slug: 'sea-prawns', isActive: true },
  { id: '5', name: 'Crabs', slug: 'crabs', isActive: true },
];

export default function MobileTopNav() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { getCartItemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { currentAddress, isLoading: locationLoading } = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  
  // Helper function to check if a route is active
  const isRouteActive = (path: string): boolean => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/' && pathname !== '/') return false;
    
    // Get the first segment of the pathname (e.g., /categories/fish => categories)
    const firstSegment = pathname.split('/')[1]?.toLowerCase();
    
    if (path === '/categories') {
      // Simpler category detection using string.includes()
      return pathname.toLowerCase().includes('categor');
    }
    
    if (path === '/account') {
      // Special case for account: match all account/* paths
      return firstSegment === 'account';
    }
    
    if (path === '/track-order') {
      return firstSegment === 'track-order' || firstSegment === 'tracking';
    }
    
    if (path === '/help-support') {
      return firstSegment === 'help-support' || firstSegment === 'support' || firstSegment === 'help';
    }
    
    // Default check: exact match or starts with path segment
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  // Eagerly prefetch all navigation content when site loads
  useEffect(() => {
    // Immediate prefetch for primary navigation
    const prefetchedPaths = new Set(); // Track what we've already prefetched
    
    // Function to prefetch a path
    const prefetchPath = (path: string) => {
      if (prefetchedPaths.has(path)) return; // Don't prefetch the same path twice
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      link.as = 'document';
      document.head.appendChild(link);
      prefetchedPaths.add(path);
    };
    
    // Prefetch all main navigation paths immediately
    [
      '/', 
      '/categories',
      '/category',
      '/cart', 
      '/account',
      '/account/orders',
      '/track-order',
      '/help-support',
      '/auth/login'
    ].forEach(prefetchPath);
    
    // For categories, also prefetch the most popular ones
    setTimeout(() => {
      // Prefetch popular categories with a small delay (lower priority)
      if (categories.length > 0) {
        categories.slice(0, 5).forEach(cat => {
          prefetchPath(`/category/${cat.slug}`);
        });
      } else {
        // Fallback if categories aren't loaded yet
        ['fish', 'prawns', 'crab', 'premium'].forEach(slug => {
          prefetchPath(`/category/${slug}`);
        });
      }
    }, 2000);
  }, [categories]); // Re-run when categories are loaded

  // Function to handle location picker navigation
  const handleLocationClick = () => {
    // Close mobile menu if open
    setShowMobileMenu(false);
    // Navigate to choose location page
    window.location.href = '/choose-location';
  };
  
  // Display location from context
  const displayLocation = currentAddress?.address_string || "Set your location";
  
  // Function to truncate long addresses for mobile display
  const formatDisplayLocation = (location: string): string => {
    if (!location) return "Set your location";
    if (location.length <= 20) return location;
    
    // Get just the area name for display
    const parts = location.split(',');
    if (parts.length > 1) {
      // Use the first meaningful part (usually area name)
      const firstPart = parts[0].trim();
      if (firstPart.length > 20) {
        return firstPart.substring(0, 18) + '...';
      }
      return firstPart;
    }
    
    // If there are no commas, just truncate with ellipsis
    return location.substring(0, 18) + '...';
  };

  // Update cart count when it changes
  useEffect(() => {
    setCartCount(getCartItemCount());
    
    // Set up a small interval to check for cart updates
    const intervalId = setInterval(() => {
      setCartCount(getCartItemCount());
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [getCartItemCount]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const res = await fetch('/api/categories');
        
        if (res.ok) {
          const data = await res.json();
          const categoryList = Array.isArray(data)
            ? data
            : Array.isArray((data as { categories?: unknown[] })?.categories)
              ? (data as { categories: unknown[] }).categories
              : [];

          if (!categoryList.length) {
            setCategories(FALLBACK_CATEGORIES);
            return;
          }

          // Filter active categories only
          const activeCategories = categoryList
            .filter((cat: any) => cat?.isActive !== false)
            .slice(0, 10)
            .map((cat: any) => ({
              id: String(cat.id || cat.slug || cat.name),
              name: String(cat.name || 'Category'),
              slug: String(cat.slug || '').trim(),
              isActive: true
            }))
            .filter((cat: Category) => cat.slug);
          
          setCategories(activeCategories.length ? activeCategories : FALLBACK_CATEGORIES);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.warn('Using fallback categories due to fetch error:', error);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle search overlay
  const handleSearchClick = () => {
    router.push('/search');
  };
  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-red-100">
      <div className="container mx-auto px-1 py-1">
        <div className="flex items-center justify-between">
          {/* Hamburger Menu - Fixed with proper positioning and z-index */}
          <button 
            className="flex items-center justify-center h-10 w-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded-full transition-all duration-200 hover:bg-red-50 burger-menu-button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
          >
            {showMobileMenu ? (
              <X className="h-6 w-6 transition-all duration-300 text-red-600" />
            ) : (
              <Menu className="h-6 w-6 transition-all duration-300 text-gray-700 hover:text-red-600" />
            )}
          </button>
            {/* Logo with increased size for better visibility */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Kadal Thunai"
              width={320}
              height={140}
              className="h-28 w-auto mobile-logo object-contain transition-transform hover:scale-105 duration-300"
              priority
            />
          </Link>
          
          {/* Account icon - Added as per redesign */}
          <div className="flex items-center space-x-2">
            <Link 
              href={isAuthenticated ? "/account" : "/auth/login"}
              className="relative p-2 text-gray-700 hover:text-red-600 transition-colors mobile-account-icon"
              aria-label={isAuthenticated ? "Account" : "Login"}
            >
              <User className="h-6 w-6" />
              {isAuthenticated && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center shadow-lg"></span>
              )}
            </Link>
            
            {/* Cart icon */}
            <Link 
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-red-600 transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>          </div>
        </div>
      </div>        {/* Merged Location & Search Bar */}
      <div className="md:hidden mobile-location-search-bar py-1 px-1">
        <div className="flex items-center justify-between gap-1 shadow-sm rounded-xl border border-gray-300 overflow-hidden">
          {/* Location Display - Extended to consume divider space */}
          <div 
            className="w-[45%] flex items-center mobile-location-display py-2 pl-3 pr-6 cursor-pointer transition-colors"
            onClick={handleLocationClick}
          >
            <div className="text-red-500 flex-shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="ml-2 overflow-hidden">
              <p className="text-xs text-red-600 font-medium">Deliver to</p>
              <p className="text-sm font-semibold text-gray-800 truncate max-w-[100px]">{formatDisplayLocation(displayLocation)}</p>
            </div>
          </div>
          
          {/* Search Input - Adjusted width */}
          <div className="w-[55%] relative">
            <div 
              className="mobile-search-compact flex items-center py-2 px-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              onClick={handleSearchClick}
            >
              <div className="text-red-500 flex-shrink-0">
                <Search className="h-5 w-5" />
              </div>
              <div className="overflow-hidden w-full ml-2">
                <p className="text-sm text-gray-500 truncate">Search seafood...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu - Using Framer Motion with optimizations */}
      <AnimatePresence mode="sync">
        {showMobileMenu && (
          <>
            {/* Ultra-optimized backdrop with instant exit animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // Super fast transition for minimal lag
              transition={{ 
                duration: 0.1, 
                ease: "linear"
              }}
              className="fixed inset-0 bg-black/35 z-40 mobile-menu-backdrop"
              onClick={() => setShowMobileMenu(false)}
              style={{ 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden",
                transform: "translate3d(0,0,0)",
                willChange: "opacity"
              }}
              aria-hidden="true"
            />
            
            {/* Menu content with streamlined animation */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: 'tween', 
                ease: 'easeOut',
                duration: 0.2, // Very fast animation
              }}
              className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-sm bg-white flex flex-col"
              style={{ 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden",
                willChange: "transform",
                transform: "translateZ(0)"
              }}
            >
              {/* Fixed header with close button - changed from sticky to fixed */}
              <div className="fixed top-0 left-0 z-50 flex items-center bg-white h-16 px-4 border-b border-gray-100 w-4/5 max-w-sm">
                <button 
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-red-600" />
                </button>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                </div>
              </div>
              
              {/* Scrollable content area - with padding-top to account for fixed header */}
              <div className="flex-1 overflow-y-auto pt-20 px-4 pb-16">
                <div className="space-y-4">
                
                {/* Updated sidebar options as requested */}
                {/* Main Navigation Section */}
                <div className="mb-6">
                  <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Navigation
                  </h3>
                  <nav className="space-y-1">
                    {[
                      { name: 'Home', href: '/', icon: Home, requiresAuth: false },
                      { 
                        name: 'Categories', 
                        href: '/categories', 
                        icon: Layers, 
                        requiresAuth: false,
                        isActive: (p: string) => {
                          // Simpler, more robust check for category routes
                          // Using includes to catch all variations of category routes
                          const pathLower = p.toLowerCase();
                          
                          // Check if path contains 'categor' which will match:
                          // - /categories
                          // - /category
                          // - /categories/fish
                          // - /category/premium-fish
                          // - etc.
                          return pathLower.includes('categor');
                        }
                      },
                      { name: 'Track Order', href: '/track-order', icon: MapPin, requiresAuth: false },
                      { name: 'Help & Support', href: '/help-support', icon: HelpCircle, requiresAuth: false },
                    ].map((item: MenuItem, index) => {
                    // Use custom isActive function if provided, otherwise use the global helper
                    const isActive = item.isActive 
                      ? item.isActive(pathname) 
                      : isRouteActive(item.href);
                    
                    // Handle special cases for authenticated routes
                    const handleItemClick = (e: React.MouseEvent) => {
                      if (item.requiresAuth && !isAuthenticated) {
                        // Prevent default link behavior
                        e.preventDefault();
                        
                        // Close menu first
                        setShowMobileMenu(false);
                        
                        // Show toast
                        toast.error("Please login to access your orders", {
                          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
                          position: "top-center",
                          duration: 3000
                        });
                        
                        // Small delay to ensure smooth transition
                        setTimeout(() => {
                          router.push('/auth/login');
                        }, 100);
                        
                        return;
                      }
                      setShowMobileMenu(false);
                    };
                    
                    return (                        <Link 
                        key={index}
                        href={item.requiresAuth && !isAuthenticated ? '/auth/login' : item.href}
                        prefetch={!item.requiresAuth || isAuthenticated}
                        className={`flex items-center px-4 py-3 rounded-xl group transition-all duration-200 ${
                          isActive 
                            ? 'bg-red-50 text-red-600 border-l-4 border-red-500 pl-3 font-semibold shadow-sm ring-2 ring-red-100' 
                            : 'text-gray-800 hover:bg-red-50 hover:text-red-600'
                        }`}
                        onClick={handleItemClick}
                      >
                        <item.icon className={`${
                          isActive 
                            ? 'h-5 w-5 mr-3 text-red-600 fill-red-100' 
                            : 'h-5 w-5 mr-3 text-gray-500 group-hover:text-red-500'
                        } transition-colors`} />
                        <span className="font-medium">{item.name}</span>
                        
                        {/* Enhanced active indicator - without the "Active" text */}
                        {isActive && (
                          <div className="ml-auto flex items-center">
                            <div className="w-2.5 h-5 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                      </Link>
                    );
                  })}

                  </nav>
                </div>
                
                {/* Account & Authentication Section */}
                <div className="mb-6 pt-3 border-t border-gray-100">
                  <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Account
                  </h3>
                  <nav className="space-y-1">
                    {[

                      { name: 'Account Settings', href: '/account', icon: User, requiresAuth: false },
                      isAuthenticated 
                        ? { name: 'Logout', href: '/auth/logout', icon: LogOut, requiresAuth: false }
                        : { name: 'Login / Sign Up', href: '/auth/login', icon: LogIn, requiresAuth: false }
                    ].map((item: MenuItem, index) => {
                      // Use custom isActive function if provided, otherwise use the global helper
                      const isActive = item.isActive 
                        ? item.isActive(pathname) 
                        : isRouteActive(item.href);
                      
                      // Handle special cases for authenticated routes
                      const handleItemClick = (e: React.MouseEvent) => {
                        if (item.requiresAuth && !isAuthenticated) {
                          // Prevent default link behavior
                          e.preventDefault();
                          
                          // Close menu first
                          setShowMobileMenu(false);
                          
                          // Show toast
                          toast.error("Please login to access your orders", {
                            icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
                            position: "top-center",
                            duration: 3000
                          });
                          
                          // Small delay to ensure smooth transition
                          setTimeout(() => {
                            router.push('/auth/login');
                          }, 100);
                          
                          return;
                        }
                        setShowMobileMenu(false);
                      };
                      
                      return (
                        <Link 
                          key={index}
                          href={item.requiresAuth && !isAuthenticated ? '/auth/login' : item.href}
                          prefetch={!item.requiresAuth || isAuthenticated}
                          className={`flex items-center px-4 py-3 rounded-xl group transition-all duration-200 ${
                            isActive 
                              ? 'bg-red-50 text-red-600 border-l-4 border-red-500 pl-3 font-semibold shadow-sm ring-2 ring-red-100' 
                              : 'text-gray-800 hover:bg-red-50 hover:text-red-600'
                          }`}
                          onClick={handleItemClick}
                        >
                          <item.icon className={`${
                            isActive 
                              ? 'h-5 w-5 mr-3 text-red-600 fill-red-100' 
                              : 'h-5 w-5 mr-3 text-gray-500 group-hover:text-red-500'
                          } transition-colors`} />
                          <span className="font-medium">{item.name}</span>
                          
                          {/* Enhanced active indicator - without the "Active" text */}
                          {isActive && (
                            <div className="ml-auto flex items-center">
                              <div className="w-2.5 h-5 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                
                {/* Popular Categories Section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Popular Categories
                  </h3>
                  <div className="mt-3 space-y-1">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/category/${category.slug}`}
                        prefetch={true}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <span className="text-sm">{category.name}</span>
                      </Link>
                    ))}
                    
                    <Link
                      href="/categories"
                      prefetch={true}
                      className="flex items-center px-4 py-2 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="text-sm font-medium">View All Categories</span>
                    </Link>
                  </div>
                </div>
                
                {/* User info if authenticated */}
                {isAuthenticated && user && (
                  <div className="mt-8 border-t border-gray-100 pt-4">
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* App version or company info */}
                {/* Footer section with fixed position */}
              <div className="fixed bottom-0 left-0 bg-white border-t border-gray-100 p-4 w-4/5 max-w-sm">
                <p className="text-xs text-center text-gray-500">
                  Kadal Thunai v1.2.0 • © 2025
                </p>
              </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}