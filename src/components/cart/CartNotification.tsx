'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';

interface CartNotificationProps {
  fishName: string;
  isOpen: boolean;
  onClose: () => void;
}

const CartNotification = ({ fishName, isOpen, onClose }: CartNotificationProps) => {
  const { cart, getCartTotal, getCartItemCount } = useCart();
  const [progress, setProgress] = useState(100);
  
  // Auto-close timer with progress bar
  useEffect(() => {
    if (isOpen) {
      setProgress(100);
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      // Update progress bar
      const interval = setInterval(() => {
        setProgress(prev => Math.max(prev - 2, 0));
      }, 100);
      
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isOpen, onClose]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center bg-tendercuts-red/10 text-tendercuts-red rounded-full p-2 mr-3">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Added to Cart!</h3>
                  <p className="text-sm text-gray-600 mt-1">{fishName} has been added to your cart</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Cart Total: <span className="font-medium text-gray-900">{formatPrice(getCartTotal(cart), 'en-IN')}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'} in cart
                </p>
              </div>
              
              <Link href="/cart">
                <Button 
                  size="sm" 
                  className="bg-tendercuts-red hover:bg-tendercuts-red/90 text-white flex items-center"
                >
                  View Cart
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-200 mt-4 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-tendercuts-red"
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartNotification;
