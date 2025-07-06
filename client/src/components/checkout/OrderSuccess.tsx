import React, { useEffect, useState } from 'react';
import { CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface OrderSuccessProps {
  orderId: string;
  trackingNumber: string;
  onViewTracking: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({
  orderId,
  trackingNumber,
  onViewTracking,
}) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      onViewTracking();
    }
  }, [countdown, onViewTracking]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2 
        }}
        className="mb-6 text-green-500"
      >
        <CheckCircle className="w-24 h-24" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-green-600 mb-4"
      >
        Order Placed Successfully!
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-6 text-gray-600"
      >
        <p className="mb-2">Thank you for your order.</p>
        <p className="mb-2">Your order <span className="font-semibold">{orderId}</span> has been confirmed.</p>
        <p>You can track your order with tracking number: <span className="font-semibold">{trackingNumber}</span></p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col gap-3 w-full"
      >
        <Button 
          onClick={onViewTracking}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Package className="w-4 h-4" />
          Track Your Order
        </Button>
        
        <p className="text-sm text-gray-500">
          Redirecting to tracking page in {countdown} seconds...
        </p>
        
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
          className="mt-2"
        >
          Continue Shopping
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default OrderSuccess;
