'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Package, ChevronRight, CalendarClock, MapPin, CheckCircle2, Truck, Share2, Home, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRandomOrderNumber } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [orderDate] = useState<Date>(new Date());
  
  useEffect(() => {
    // Get order ID from URL params or generate a random one
    const urlOrderId = searchParams.get('orderId');
    setOrderNumber(urlOrderId || generateRandomOrderNumber());
    
    // Set estimated delivery (24-48 hours from now)
    const deliveryDate = new Date();
    deliveryDate.setHours(deliveryDate.getHours() + 24 + Math.floor(Math.random() * 24));
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', options));
    
    // Run confetti animation
    const runConfetti = () => {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    };

    // Play success sound
    const playSuccessSound = () => {
      try {
        const audio = new Audio("/sounds/order-success.mp3");
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Error playing sound:", e);
          });
        }
      } catch (e) {
        console.error("Error with audio:", e);
      }
    };
    
    // Run animations on page load
    setTimeout(() => {
      runConfetti();
      playSuccessSound();
    }, 500);
  }, [searchParams]);
    
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleTrackOrder = () => {
    router.push(`/tracking/${orderNumber}`);
  };
  
  // Handle share order
  const handleShareOrder = async () => {
    const shareText = `I just placed an order #${orderNumber} on Kadal Thunai! Fresh seafood coming my way soon.`;
    const shareUrl = window.location.origin + `/tracking/${orderNumber}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Kadal Thunai Order',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText} Track it here: ${shareUrl}`);
        toast.success("Order details copied to clipboard");
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText} Track it here: ${shareUrl}`);
      toast.success("Order details copied to clipboard");
    }
  };
  
  if (!orderNumber) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
    return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Animation */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.2 
              }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-14 h-14 text-green-600" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Order Confirmed!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-600"
            >
              Thank you for your order
            </motion.p>
          </div>
          
          {/* Order Details Card */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Order Details</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(orderNumber);
                    toast.success("Order ID copied to clipboard");
                  }}
                  className="h-8 gap-1 text-blue-600"
                >
                  <FileText className="w-4 h-4" />
                  Copy Order ID
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-2 items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Order Number</p>
                    <p className="text-sm text-gray-800 font-mono">{orderNumber}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CalendarClock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Order Date & Time</p>
                    <p className="text-sm text-gray-800">{formatDate(orderDate)} at {formatTime(orderDate)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estimated Delivery</p>
                    <p className="text-sm text-gray-800">{estimatedDelivery}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Delivery Time Slot</p>
                    <p className="text-sm text-gray-800">Between 10 AM - 1 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2 items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Delivery Address</p>
                    <p className="text-sm text-gray-800">{user?.name || "Customer"}</p>
                    <p className="text-sm text-gray-600 mt-1">123 Ocean View Apartments, Beach Road, Chennai - 600001</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={handleTrackOrder}
              className="w-full bg-tendercuts-red hover:bg-tendercuts-red-dark text-white"
              size="lg"
            >
              <Truck className="w-5 h-5 mr-2" />
              Track Your Order
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleShareOrder}
                className="w-full"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Order
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                <Home className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>
          
          {/* Delivery Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Delivery Information</h3>
            <p className="text-sm text-blue-700 mb-3">
              You will receive an email and text message confirmation with order details.
            </p>
            <p className="text-sm text-blue-700">
              Our delivery partner will call you before arriving at your location.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading...</div>}>
      <OrderConfirmationPage />
    </Suspense>
  );
}
