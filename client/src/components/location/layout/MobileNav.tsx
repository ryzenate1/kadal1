'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ShoppingCart, User, MenuSquare, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const getNavItemKey = (item: NavItem, index: number): string => {
  if (item.isAction && item.id) {
    return item.id;
  }
  return item.href || `nav-item-${index}`;
};

// Define interface for nav items
interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  badge?: number | null;
  isAction?: boolean;
  action?: () => void;
  id?: string; // Add optional id for unique identification
}

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { getCartItemCount } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Update cart count whenever it changes
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };
    
    // Initial update
    updateCartCount();
    
    // Set up an interval to check for cart updates
    const intervalId = setInterval(updateCartCount, 1000);
    
    return () => clearInterval(intervalId);
  }, [getCartItemCount]);
  
  // Handle scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Only update when scrolled more than 10px to avoid small movements
      if (Math.abs(currentScrollY - lastScrollY) < 10) return;
      
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Handle search submission with enhanced navigation
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };
  
  // Fish data for search suggestions
  const fishCategories = [
    { name: 'Fresh Fish', url: '/category/fish-combo?type=fresh' },
    { name: 'Premium Fish', url: '/category/fish-combo?type=premium' },
    { name: 'Fish Combos', url: '/category/fish-combo' },
    { name: 'Today\'s Special', url: '/category/fish-combo?special=true' }
  ];
  
  // Common fish types for suggestions
  const popularFish = [
    { name: 'Vangaram Fish', url: '/fish/vangaram-fish' },
    { name: 'Sankara Fish', url: '/fish/sankara-fish' },
    { name: 'Paal Sura', url: '/fish/paal-sura' },
    { name: 'Mathi Fish', url: '/fish/mathi-fish' },
    { name: 'King Fish', url: '/fish/king-fish' }
  ];

  // Use the proper auth context with user data
  const { isAuthenticated, user } = useAuth();
  
  // Add a state to track auth status changes
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Update login state when auth changes
  useEffect(() => {
    setIsLoggedIn(isAuthenticated && !!user);
    console.log('Auth state in MobileNav:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  const navItems: NavItem[] = [
    { name: 'Home', href: '/', icon: Home },
    { 
      name: 'Categories', 
      // Use a special mobile categories route to avoid URL issues
      href: '/categoriesmobile', 
      icon: MenuSquare,
      // Add explicit onClick handler to force correct navigation
      action: () => {
        console.log('Navigating to /categoriesmobile');
        router.push('/categoriesmobile');
      },
      isAction: true,
      id: 'mobile-categories'
    },
    { 
      name: 'Cart', 
      href: '/cart', 
      icon: ShoppingCart, 
      badge: cartCount > 0 ? cartCount : null,
      isAction: false,
      id: 'mobile-cart', // Add unique ID for cart
      // Enhanced onClick handler to ensure navigation
      action: () => {
        console.log('Navigating to cart');
        router.push('/cart');
      }
    },
    { 
      name: 'Search', 
      action: () => setIsSearchOpen(true),
      icon: Search,
      isAction: true,
      id: 'mobile-search' // Add unique ID for search
    },
    { 
      name: isLoggedIn ? 'Account' : 'Login', 
      href: isLoggedIn ? '/account' : '/auth/login', 
      icon: User 
    },
  ];

  // Adjust logo size for better visibility
  const Logo = () => (
    <img
      src="/images/logo.png"
      alt="Kadal Thunai Logo"
      className="h-16 w-auto object-contain" // Increased height for better visibility
    />
  );

  // Fix bottom navigation bar routing - DISABLED FOR MOBILE REVAMP
  // Bottom navbar is removed as per new mobile design
  return null; // Bottom mobile navbar completely removed
}
