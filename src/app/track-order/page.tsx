

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, 
  Mail, ArrowLeft, AlertTriangle, User, Calendar, ShoppingBag, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

interface TrackingHistory {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

interface DeliveryAgent {
  name: string;
  phone: string;
  photo?: string;
  vehicleNumber?: string;
  eta?: number; // in minutes
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface TrackingInfo {
  id: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  trackingHistory: TrackingHistory[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryAgent?: DeliveryAgent;
  items: OrderItem[];
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  deliveryFee?: number;
  discount?: number;
}

const TrackOrderPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Get order ID from URL if provided
  useEffect(() => {
    const orderId = searchParams.get('id');
    if (orderId) {
      setTrackingNumber(orderId);
      fetchOrderDetails(orderId);
    }
  }, [searchParams]);

  // Fetch the order from localStorage or API
  const fetchOrderDetails = async (orderId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First try authenticated API
      try {
        const response = await fetch(`/api/orders/${orderId}/tracking`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTrackingInfo(data);
          calculateProgress(data.status);
          return;
        }
      } catch (apiError) {
        console.warn('Authenticated API fetch failed, trying demo endpoint', apiError);
      }

      // Try demo tracking endpoint as fallback
      try {
        const demoResponse = await fetch(`/api/orders/${orderId}/tracking-demo`);
        
        if (demoResponse.ok) {
          const demoData = await demoResponse.json();
          setTrackingInfo(demoData);
          calculateProgress(demoData.status);
          return;
        }
      } catch (demoError) {
        console.warn('Demo API fetch failed, falling back to localStorage', demoError);
      }
      
      // Fallback to localStorage for demo/development
      const storedOrder = localStorage.getItem('recentOrder');
      if (storedOrder) {
        const parsedOrder = JSON.parse(storedOrder);
        if (parsedOrder.id === orderId) {
          // Convert to expected format with tracking history
          const trackingData = enhanceOrderWithTracking(parsedOrder);
          setTrackingInfo(trackingData);
          calculateProgress(trackingData.status);
          return;
        }
      }
      
      // If no order found, create mock data
      const mockData = getMockTrackingData(orderId);
      if (mockData) {
        setTrackingInfo(mockData);
        calculateProgress(mockData.status);
      } else {
        throw new Error('Order not found');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to find order');
      toast.error('Unable to find your order. Please check the order ID and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate progress percentage based on status
  const calculateProgress = (status: string) => {
    const statusMap: Record<string, number> = {
      'pending': 0,
      'confirmed': 25,
      'processing': 50,
      'out_for_delivery': 75,
      'delivered': 100,
      'cancelled': 0
    };
    
    // Normalize status string
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
    setProgress(statusMap[normalizedStatus] || 0);
    
    // If status is out for delivery, simulate movement
    if (normalizedStatus === 'out_for_delivery') {
      simulateDeliveryMovement();
    }
  };
  
  // Simulate live movement for the delivery agent
  const simulateDeliveryMovement = () => {
    // Start at 75% (out for delivery)
    let currentProgress = 75;
    
    // Clear any existing interval
    const interval = setInterval(() => {
      // Random small increment to simulate movement
      const increment = Math.random() * 0.5;
      currentProgress = Math.min(currentProgress + increment, 95);
      setProgress(currentProgress);
      
      // Stop when we reach 95% (almost delivered)
      if (currentProgress >= 95) {
        clearInterval(interval);
      }
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  };
  
  // Enhance a basic order with tracking information
  const enhanceOrderWithTracking = (order: any): TrackingInfo => {
    const now = new Date();
    const orderDate = new Date(order.orderDate || now);
    
    // Generate appropriate tracking history based on status
    const trackingHistory = [];
    
    // Always add order placed
    trackingHistory.push({
      status: 'Order Placed',
      timestamp: orderDate.toISOString(),
      description: 'Your order has been received',
      location: order.shippingAddress?.city || 'Your Location'
    });
    
    // Add confirmation if status is at least confirmed
    if (['confirmed', 'processing', 'out_for_delivery', 'delivered'].includes(order.status)) {
      trackingHistory.push({
        status: 'Order Confirmed',
        timestamp: new Date(orderDate.getTime() + 5 * 60000).toISOString(), // 5 mins after order
        description: 'Your order has been confirmed',
        location: 'Kadal Thunai Kitchen'
      });
    }
    
    // Add processing if status is at least processing
    if (['processing', 'out_for_delivery', 'delivered'].includes(order.status)) {
      trackingHistory.push({
        status: 'Processing',
        timestamp: new Date(orderDate.getTime() + 15 * 60000).toISOString(), // 15 mins after order
        description: 'Your order is being prepared',
        location: 'Kadal Thunai Kitchen'
      });
    }
    
    // Add out for delivery if status is at least out_for_delivery
    if (['out_for_delivery', 'delivered'].includes(order.status)) {
      trackingHistory.push({
        status: 'Out for Delivery',
        timestamp: new Date(orderDate.getTime() + 30 * 60000).toISOString(), // 30 mins after order
        description: 'Your order is on the way',
        location: 'En Route to ' + (order.shippingAddress?.address || 'your location')
      });
    }
    
    // Add delivered if status is delivered
    if (order.status === 'delivered') {
      trackingHistory.push({
        status: 'Delivered',
        timestamp: new Date(orderDate.getTime() + 45 * 60000).toISOString(), // 45 mins after order
        description: 'Your order has been delivered',
        location: order.shippingAddress?.address || 'your location'
      });
    }
    
    // Add delivery agent for out_for_delivery or later
    const deliveryAgent = ['out_for_delivery', 'delivered'].includes(order.status) 
      ? {
          name: 'Ramesh Kumar',
          phone: '9876543210',
          photo: '/images/delivery-agent.jpg',
          vehicleNumber: 'TN 01 AB 1234',
          eta: 20 // 20 minutes
        }
      : undefined;
    
    return {
      id: order.id,
      trackingNumber: order.trackingNumber || order.id,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery || new Date(orderDate.getTime() + 60 * 60000).toISOString(),
      createdAt: orderDate.toISOString(),
      updatedAt: new Date().toISOString(),
      trackingHistory: trackingHistory.reverse(), // Most recent first
      shippingAddress: {
        name: order.shippingAddress?.name || 'Customer',
        phone: order.shippingAddress?.phone || '9876543210',
        address: order.shippingAddress?.address || 'Address not available',
        city: order.shippingAddress?.city || 'City',
        state: order.shippingAddress?.state || 'State',
        pincode: order.shippingAddress?.pincode || '000000'
      },
      deliveryAgent,
      items: order.items || [],
      paymentMethod: order.paymentMethod || 'cod',
      paymentStatus: order.paymentStatus || 'pending',
      totalAmount: order.totalAmount || 0,
      deliveryFee: order.deliveryFee || 0,
      discount: order.discount || 0
    };
  };

  const handleTrackOrder = async (tracking?: string) => {
    const trackingNum = tracking || trackingNumber;
    
    if (!trackingNum.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    await fetchOrderDetails(trackingNum);
  };

  // Mock function to generate tracking data
  const getMockTrackingData = (trackingNum: string): TrackingInfo | null => {
    // Demo tracking numbers (plus any order ID passed from order confirmation)
    const validTrackingNumbers = ['TRK001425', 'TRK001426', 'TRK001427'];
    
    // If it's a valid tracking number or starts with something plausible
    if (validTrackingNumbers.includes(trackingNum) || 
        trackingNum.startsWith('TRK') || 
        trackingNum.startsWith('ORD') || 
        trackingNum.startsWith('KT')) {
      const now = new Date();
      const createdAt = new Date(now.getTime() - 1000 * 60 * 60 * 3); // 3 hours ago
      const estimatedDelivery = new Date(now.getTime() + 1000 * 60 * 60 * 1); // 1 hour from now
      
      // Randomly select a status based on the tracking number
      const statuses = ['confirmed', 'processing', 'out_for_delivery', 'delivered'];
      const statusIndex = (trackingNum.charCodeAt(trackingNum.length - 1) % 4);
      const currentStatus = statuses[statusIndex];
      
      // Generate tracking history
      const trackingHistory: TrackingHistory[] = [];
      
      // Order placed - always present
      trackingHistory.push({
        status: 'Order Placed',
        timestamp: createdAt.toISOString(),
        description: 'Your order has been received',
        location: 'Online'
      });
      
      // Order confirmed - always present
      trackingHistory.push({
        status: 'Order Confirmed',
        timestamp: new Date(createdAt.getTime() + 5 * 60000).toISOString(),
        description: 'Your order has been confirmed',
        location: 'Kadal Thunai Kitchen'
      });
      
      // Processing - add if we're at least at this stage
      if (['processing', 'out_for_delivery', 'delivered'].includes(currentStatus)) {
        trackingHistory.push({
          status: 'Processing',
          timestamp: new Date(createdAt.getTime() + 15 * 60000).toISOString(),
          description: 'Your seafood is being prepared',
          location: 'Kadal Thunai Kitchen'
        });
      }
      
      // Out for delivery - add if we're at least at this stage
      if (['out_for_delivery', 'delivered'].includes(currentStatus)) {
        trackingHistory.push({
          status: 'Out for Delivery',
          timestamp: new Date(createdAt.getTime() + 30 * 60000).toISOString(),
          description: 'Your order is on the way',
          location: 'En Route'
        });
      }
      
      // Delivered - add if we're at this stage
      if (currentStatus === 'delivered') {
        trackingHistory.push({
          status: 'Delivered',
          timestamp: new Date(createdAt.getTime() + 45 * 60000).toISOString(),
          description: 'Your order has been delivered',
          location: 'Delivery Location'
        });
      }
      
      // Generate mock order items
      const items: OrderItem[] = [
        {
          id: '1',
          name: 'Fresh Tuna Steak',
          quantity: 2,
          price: 299.50,
          image: '/images/products/tuna.jpg'
        },
        {
          id: '2',
          name: 'King Prawns (500g)',
          quantity: 1,
          price: 399.00,
          image: '/images/products/prawns.jpg'
        }
      ];
      
      // Add delivery agent if out for delivery or delivered
      const deliveryAgent: DeliveryAgent | undefined = 
        ['out_for_delivery', 'delivered'].includes(currentStatus) 
          ? {
              name: 'Ramesh Kumar',
              phone: '9876543210',
              photo: '/images/delivery-agent.jpg',
              vehicleNumber: 'TN 01 AB 1234',
              eta: 20
            }
          : undefined;
      
      return {
        id: trackingNum,
        trackingNumber: trackingNum,
        status: currentStatus,
        estimatedDelivery: estimatedDelivery.toISOString(),
        createdAt: createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
        trackingHistory: trackingHistory.reverse(), // Most recent first
        shippingAddress: {
          name: 'John Doe',
          phone: '9876543210',
          address: '123 Main Street, Apartment 4B',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001'
        },
        deliveryAgent,
        items,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        totalAmount: 998.00,
        deliveryFee: 49.00,
        discount: 0
      };
    }
    
    return null;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'order placed':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'order confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'out for delivery':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Track Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter tracking number or order ID"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleTrackOrder()}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Track'}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {trackingInfo && (
          <div className="space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Order #{trackingInfo.id}</CardTitle>
                    <p className="text-gray-600">Tracking: {trackingInfo.trackingNumber}</p>
                  </div>
                  <Badge className={getStatusColor(trackingInfo.status)}>
                    {trackingInfo.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Order Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Estimated Delivery */}
                {trackingInfo.estimatedDelivery && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Estimated delivery: {formatDate(trackingInfo.estimatedDelivery)}</span>
                  </div>
                )}

                {/* Delivery Agent (if available) */}
                {trackingInfo.deliveryAgent && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">Delivery Partner</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{trackingInfo.deliveryAgent.name}</p>
                        <p className="text-sm text-gray-600">{trackingInfo.deliveryAgent.vehicleNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">ETA: {trackingInfo.deliveryAgent.eta} mins</p>
                        <Button variant="outline" size="sm" className="mt-1">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking History */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingInfo.trackingHistory.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{event.status}</h4>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            {event.location && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingInfo.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Total */}
                <div className="border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(trackingInfo.totalAmount - (trackingInfo.deliveryFee || 0) + (trackingInfo.discount || 0))}</span>
                    </div>
                    {trackingInfo.deliveryFee && trackingInfo.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{formatPrice(trackingInfo.deliveryFee)}</span>
                      </div>
                    )}
                    {trackingInfo.discount && trackingInfo.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(trackingInfo.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>{formatPrice(trackingInfo.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <h4 className="font-medium">{trackingInfo.shippingAddress.name}</h4>
                    <p className="text-gray-600">{trackingInfo.shippingAddress.address}</p>
                    <p className="text-gray-600">
                      {trackingInfo.shippingAddress.city}, {trackingInfo.shippingAddress.state} - {trackingInfo.shippingAddress.pincode}
                    </p>
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {trackingInfo.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        {trackingInfo && (
          <div className="flex gap-4 mt-8">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
            <Button className="flex-1" onClick={() => window.print()}>
              Print Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { Suspense } from 'react';

function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading order...</div>}>
      <TrackOrderPage />
    </Suspense>
  );
}

export default Page;
