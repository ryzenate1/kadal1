'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface WishlistLoginRequiredProps {
  productId: string;
  productName: string;
}

export default function WishlistLoginRequired({ productId, productName }: WishlistLoginRequiredProps) {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setIsOpen(true);
    } else {
      // User is logged in, perform wishlist action
      toast.success(`${productName} added to wishlist`, {
        duration: 3000,
        description: "You can view your saved items in your wishlist.",
        action: {
          label: "View Wishlist",
          onClick: () => router.push('/account/wishlist')
        }
      });
    }
  };

  const redirectToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <>
      <button
        onClick={handleWishlistClick}
        className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-md"
        aria-label="Add to wishlist"
      >
        <Heart className="h-4 w-4 text-gray-600" />
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
                  Please log in to add items to your wishlist
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
