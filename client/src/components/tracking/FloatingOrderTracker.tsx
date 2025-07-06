"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Clock, 
  ChevronRight, 
  MapPin, 
  X,
  ChevronUp,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress.js';
import { toast } from 'sonner';
import { useOrderTracking } from '@/services/orderTrackingService';

interface FloatingTrackerProps {
  orderId: string;
  initialStatus?: string;
  initialEta?: number;
  initialProgressPercentage?: number;
}

const FloatingOrderTracker = ({ 
  orderId,
  initialStatus = "Processing", 
  initialEta = 25, 
  initialProgressPercentage = 25 
}: FloatingTrackerProps) => {
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const { 
    trackingData, 
    isLoading, 
    error, 
    isConnected, 
    isLive,
    refreshTracking 
  } = useOrderTracking(orderId);
  
  // Use real-time data if available, otherwise fallback to initial values
  const status = trackingData?.order?.status || initialStatus;
  const eta = trackingData?.tracking?.eta || initialEta;
  const progressPercentage = trackingData?.tracking?.progressPercentage || initialProgressPercentage;
  
  // Function to navigate to tracking page
  const goToTracking = () => {
    router.push(`/tracking/${orderId}`);
  };
  
  // Function to toggle minimized state
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Function to dismiss the tracker
  const dismissTracker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };
  
  // Format status for display
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Order Received',
      'processing': 'Processing',
      'ready_for_pickup': 'Ready for Pickup',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || status;
  };
  
  // If delivery is complete or cancelled, hide after a while
  useEffect(() => {
    if (status === 'delivered' || status === 'cancelled') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 60000); // Hide after 1 minute
      
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  // Refresh tracking data periodically if not connected via WebSocket
  useEffect(() => {
    if (!isConnected && isVisible) {
      const interval = setInterval(() => {
        refreshTracking();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isConnected, isVisible, refreshTracking]);
  
  if (!isVisible) return null;
  
  // Get icon and background color based on status
  const getStatusStyles = () => {
    switch(status) {
      case 'delivered':
        return { bgColor: 'bg-green-50', iconColor: 'text-green-600', icon: <Truck className="w-4 h-4 text-green-600" /> };
      case 'out_for_delivery':
        return { bgColor: 'bg-blue-50', iconColor: 'text-blue-600', icon: <Truck className="w-4 h-4 text-blue-600" /> };
      case 'ready_for_pickup':
        return { bgColor: 'bg-purple-50', iconColor: 'text-purple-600', icon: <Truck className="w-4 h-4 text-purple-600" /> };
      case 'processing':
        return { bgColor: 'bg-amber-50', iconColor: 'text-amber-600', icon: <Clock className="w-4 h-4 text-amber-600" /> };
      case 'cancelled':
        return { bgColor: 'bg-red-50', iconColor: 'text-red-600', icon: <X className="w-4 h-4 text-red-600" /> };
      default:
        return { bgColor: 'bg-blue-50', iconColor: 'text-blue-600', icon: <Clock className="w-4 h-4 text-blue-600" /> };
    }
  };
  
  const statusStyles = getStatusStyles();
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 z-50"
      >
        <div 
          className={`bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden cursor-pointer ${isLoading ? 'opacity-80' : ''}`}
          onClick={isMinimized ? toggleMinimized : goToTracking}
        >
          {/* Header - Always visible */}
          <div className={`flex items-center justify-between p-3 ${statusStyles.bgColor}`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-white bg-opacity-70 flex items-center justify-center`}>
                {statusStyles.icon}
              </div>
              <div>
                <p className="text-sm font-medium">Order #{orderId.substring(0, 6)}</p>
                <p className="text-xs text-gray-600">{getStatusDisplay(status)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button 
                  onClick={dismissTracker}
                  className="p-1 hover:bg-white hover:bg-opacity-30 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMinimized();
                }}
                className="p-1 hover:bg-white hover:bg-opacity-30 rounded-full"
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Content - Only visible when not minimized */}
          {!isMinimized && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    {status === 'delivered' 
                      ? 'Delivered' 
                      : status === 'cancelled'
                        ? 'Cancelled'
                        : `ETA: ${eta} min`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshTracking();
                        toast.success("Tracking updated");
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <RefreshCw className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                  <MapPin className="w-4 h-4 text-blue-600 ml-1" />
                  <span className="text-xs">On the way</span>
                </div>
              </div>
              
              <Progress value={progressPercentage} className="h-2 mb-3" />
              
              <Button 
                onClick={goToTracking}
                className="w-full text-sm h-8"
              >
                Track Order
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingOrderTracker;
