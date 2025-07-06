'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AddToCartLoginRequiredProps {
  productId: string;
  productName: string;
  productImage?: string;
  productPrice?: number;
  productType?: string;
  netWeight?: string;
  onAddToCart?: (quantity: number) => void;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AddToCartLoginRequired({ 
  productId, 
  productName,
  productImage,
  productPrice,
  productType,
  netWeight,
  onAddToCart,
  quantity = 1,
  disabled = false,
  className = "",
  size = 'md'
}: AddToCartLoginRequiredProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Close popup after 4 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setTimeout(() => {
        setIsOpen(false);
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isLoading) return;
    
    if (!isAuthenticated) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // User is logged in, perform add to cart action
      if (onAddToCart) {
        await onAddToCart(quantity);
      } else if (productPrice && productImage && productType) {
        // Fallback: use cart context directly
        const cartItem = {
          name: productName,
          src: productImage,
          type: productType,
          price: productPrice,
          quantity: quantity,
          netWeight: netWeight || '500g',
          omega3: 0,
          protein: 0,
          calories: 0,
          benefits: [],
          bestFor: [],
          rating: 4
        };
        
        addToCart(cartItem, quantity);
        
        toast.success(`${productName} added to cart`, {
          duration: 3000,
          description: `${quantity} item${quantity > 1 ? 's' : ''} added to your cart.`,
          action: {
            label: "View Cart",
            onClick: () => router.push('/cart')
          }
        });
      } else {
        throw new Error('Missing product information for cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart', {
        description: 'Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-1.5 px-3 text-sm';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4';
    }
  };
  const redirectToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <>
      <button
        onClick={handleAddToCartClick}
        disabled={disabled || isLoading}
        className={`flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${getSizeClasses()} ${className}`}
        aria-label={`Add ${productName} to cart`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        <span>{isLoading ? 'Adding...' : 'Add to Cart'}</span>
      </button>

      {/* Login Prompt Popup */}
      <AnimatePresence>
        {isOpen && !isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border border-gray-200"
          >
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">Login Required</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Please log in to add items to your cart
                </p>
                <button 
                  onClick={redirectToLogin}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Login Now
                </button>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
