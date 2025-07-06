
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  ChefHat,
  ArrowLeft,
  Share2,
  Phone,
  MessageCircle,
  Clipboard,
  RefreshCw,
  MapPin,
  UserRound,
  Star,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress.js";
import { useOrderTracking } from "@/services/orderTrackingService";

// Interface for order status
interface OrderStatus {
  code: string;
  label: string;
  description: string;
  time: string;
  completed: boolean;
  active: boolean;
  icon: JSX.Element;
}

// Interface for the delivery person
interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleNumber: string;
  rating: number;
  image: string;
  totalDeliveries: number;
}

// Interface for location updates
interface LocationUpdate {
  lat: number;
  lng: number;
  timestamp: string;
  message?: string;
}

// Replace this:


// Workaround: Next.js type generation bug - params is not a Promise in real usage
export default function OrderTrackingPage({ params }: any) {
  const { orderId } = params;

  const { user } = useAuth();
  const router = useRouter();
  
  // Use real-time order tracking service
  const { 
    trackingData, 
    isLoading, 
    error, 
    isConnected, 
    isLive,
    refreshTracking 
  } = useOrderTracking(orderId);
  
  // Order details fallback
  const [orderDetails, setOrderDetails] = useState({
    id: orderId,
    customerName: user?.name || "Guest",
    customerPhone: "",
    customerAddress: "123 Ocean View Apartments, Beach Road, Chennai - 600001",
    orderDate: new Date().toISOString(),
    expectedDelivery: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    totalItems: 4,
    totalAmount: 1249,
    paymentMethod: "Cash on Delivery",
    items: [
      {
        id: "item1",
        name: "Fresh Atlantic Salmon",
        quantity: 2,
        price: 399,
        src: "/images/salmon.jpg"
      },
      {
        id: "item2",
        name: "Prawns (Medium)",
        quantity: 1,
        price: 299,
        src: "/images/prawns.jpg"
      },
      {
        id: "item3",
        name: "Crab (Large)",
        quantity: 1,
        price: 549,
        src: "/images/crab.jpg"
      }
    ]
  });
  
  // Update order details when real-time data is available
  useEffect(() => {
    if (trackingData?.order) {
      const orderData = trackingData.order;
      
      // Map the order data to our order details format
      setOrderDetails({
        id: orderData.id,
        customerName: orderData.user?.name || user?.name || "Guest",
        customerPhone: orderData.user?.phoneNumber || "",
        customerAddress: orderData.address?.address || "Address not available",
        orderDate: orderData.createdAt,
        expectedDelivery: orderData.estimatedDelivery || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        totalItems: orderData.orderItems?.length || 0,
        totalAmount: orderData.totalAmount || 0,
        paymentMethod: orderData.paymentMethod || "Payment method not specified",
        items: orderData.orderItems?.map(item => ({
          id: item.id,
          name: item.product?.name || "Unknown Product",
          quantity: item.quantity,
          price: item.price,
          src: item.product?.imageUrl || "/images/placeholder.jpg"
        })) || []
      });
    }
  }, [trackingData, user]);
  
  // Order status timeline
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([
    {
      code: "order_placed",
      label: "Order Placed",
      description: "Your order has been received",
      time: new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true,
      active: false,
      icon: <Clipboard className="w-5 h-5" />
    },
    {
      code: "processing",
      label: "Processing",
      description: "Your order is being processed",
      time: new Date(Date.now() - 20 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true,
      active: false,
      icon: <ChefHat className="w-5 h-5" />
    },
    {
      code: "ready_for_pickup",
      label: "Ready for Pickup",
      description: "Your order is ready for delivery",
      time: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true,
      active: false,
      icon: <Package className="w-5 h-5" />
    },
    {
      code: "out_for_delivery",
      label: "Out for Delivery",
      description: "Your order is on the way",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true,
      active: true,
      icon: <Truck className="w-5 h-5" />
    },
    {
      code: "delivered",
      label: "Delivered",
      description: "Your order has been delivered",
      time: "Expected by " + new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: false,
      active: false,
      icon: <CheckCircle className="w-5 h-5" />
    }
  ]);
  
  // Update order statuses when real-time data is available
  useEffect(() => {
    if (trackingData?.tracking?.locationUpdates?.length) {
      // Convert trackingHistory to our orderStatuses format
      const statusMapping: Record<string, OrderStatus['code']> = {
        'pending': 'order_placed',
        'processing': 'processing',
        'ready_for_pickup': 'ready_for_pickup',
        'out_for_delivery': 'out_for_delivery',
        'delivered': 'delivered'
      };
      
      const updatedStatuses = [...orderStatuses];
      const currentStatus = trackingData.order.status;
      
      // Find the completed statuses from tracking history
      const completedStatusCodes = new Set<string>();
      
      trackingData.tracking.locationUpdates.forEach(update => {
        const statusCode = statusMapping[update.status] || update.status;
        completedStatusCodes.add(statusCode);
        
        // Update time for the status
        const statusIndex = updatedStatuses.findIndex(s => s.code === statusCode);
        if (statusIndex >= 0) {
          updatedStatuses[statusIndex].time = new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          updatedStatuses[statusIndex].description = update.description || updatedStatuses[statusIndex].description;
        }
      });
      
      // Mark statuses as completed or active
      updatedStatuses.forEach(status => {
        status.completed = completedStatusCodes.has(status.code);
        status.active = status.code === statusMapping[currentStatus];
      });
      
      setOrderStatuses(updatedStatuses);
    }
  }, [trackingData]);
  
  // Delivery person details
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson>({
    id: "dp123",
    name: "Rajesh Kumar",
    phone: "9876543210",
    vehicle: "Motorcycle",
    vehicleNumber: "TN 01 AB 1234",
    rating: 4.8,
    image: "/images/delivery-person.jpg",
    totalDeliveries: 1243
  });
  
  // Location updates
  const [locationUpdates, setLocationUpdates] = useState<LocationUpdate[]>([
    {
      lat: 13.0827,
      lng: 80.2707,
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      message: "Order picked up from store"
    },
    {
      lat: 13.0850,
      lng: 80.2680,
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      message: "On the way to your location"
    },
    {
      lat: 13.0890,
      lng: 80.2650,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    }
  ]);
  
  // Update location updates when real-time data is available
  useEffect(() => {
    if (trackingData?.tracking?.locationUpdates?.length) {
      // Extract location updates from tracking history
      const updates: LocationUpdate[] = trackingData.tracking.locationUpdates
        .filter(update => update.metadata)
        .map(update => ({
          lat: update.metadata?.lat || 13.0827,
          lng: update.metadata?.lng || 80.2707,
          timestamp: update.timestamp,
          message: update.description
        }));
      
      if (updates.length > 0) {
        setLocationUpdates(updates);
      }
    }
  }, [trackingData]);
  
  // Estimated time of arrival (in minutes)
  const [eta, setEta] = useState(25);
  
  // Progress percentage
  const [progressPercentage, setProgressPercentage] = useState(60);
  
  // Update ETA and progress percentage when real-time data is available
  useEffect(() => {
    if (trackingData?.tracking) {
      setEta(trackingData.tracking.eta);
      setProgressPercentage(trackingData.tracking.progressPercentage);
    }
  }, [trackingData]);
  
  // Function to copy order ID to clipboard
  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied to clipboard");
  };
  
  // Function to call delivery person
  const callDeliveryPerson = () => {
    window.location.href = `tel:${deliveryPerson.phone}`;
  };
  
  // Get current active status
  const activeStatus = orderStatuses.find(status => status.active);
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 tracking-page">
      <div className="container mx-auto px-4">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Order #{orderId.substring(0, 8)}</p>
              <button 
                onClick={copyOrderId}
                className="text-blue-600 hover:text-blue-800"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Live status indicator */}
          {isConnected && (
            <div className="ml-auto flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium">Live Updates</span>
            </div>
          )}
        </div>
        
        {/* Error state */}
        {error && (
          <div className="mb-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-700">Error loading order information</h3>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    onClick={refreshTracking}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && !trackingData && (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading order information...</p>
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Status and Tracking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>Order Status</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      refreshTracking();
                      toast.success("Status updated");
                    }}
                    className="h-8 gap-1 text-blue-600"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Current Status */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {activeStatus?.icon || <Truck className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{activeStatus?.label || "Processing"}</h3>
                        <p className="text-sm text-gray-600">{activeStatus?.description || "Your order is being processed"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-blue-600 bg-blue-50">
                        {trackingData?.order?.status === 'delivered' 
                          ? 'Delivered' 
                          : trackingData?.order?.status === 'cancelled'
                            ? 'Cancelled'
                            : `ETA: ${eta} min`
                        }
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {isConnected ? 'just now' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                
                {/* Status Timeline */}
                <div className="space-y-6">
                  {orderStatuses.map((status, index) => (
                    <div key={status.code} className="relative">
                      {/* Connector Line */}
                      {index < orderStatuses.length - 1 && (
                        <div className={`absolute left-5 top-10 w-0.5 h-12 -ml-[1px] ${status.completed ? 'bg-blue-500' : 'bg-gray-200'}`} />
                      )}
                      
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          status.active 
                            ? 'bg-blue-500 text-white' 
                            : status.completed 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          {status.icon}
                        </div>
                        
                        {/* Status Details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className={`font-medium ${
                              status.active ? 'text-blue-600' : status.completed ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {status.label}
                            </h3>
                            <span className={`text-sm ${status.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                              {status.time}
                            </span>
                          </div>
                          <p className={`text-sm ${status.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                            {status.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Delivery Person Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Delivery Partner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100">
                    <Image 
                      src={deliveryPerson.image}
                      alt={deliveryPerson.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium">{deliveryPerson.name}</h3>
                      <div className="flex items-center ml-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm ml-1">{deliveryPerson.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{deliveryPerson.vehicle} • {deliveryPerson.vehicleNumber}</p>
                    <p className="text-xs text-gray-500">{deliveryPerson.totalDeliveries}+ deliveries</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={callDeliveryPerson}
                      variant="outline"
                      size="sm"
                      className="gap-1 h-9"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 h-9"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>Currently near: Teynampet, Chennai</span>
                  </div>
                  
                  {/* Location updates */}
                  <div className="mt-2 space-y-2">
                    {locationUpdates.slice(-3).reverse().map((update, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400 mt-2"></div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">
                            {new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {update.message && <span className="ml-1">{update.message}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Order Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Order Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>Order Summary</span>
                    <Badge variant="outline" className={`${
                      trackingData?.order?.paymentStatus === 'completed'
                        ? 'text-green-600 bg-green-50'
                        : trackingData?.order?.paymentStatus === 'failed'
                          ? 'text-red-600 bg-red-50'
                          : 'text-amber-600 bg-amber-50'
                    }`}>
                      {trackingData?.order?.paymentStatus === 'completed'
                        ? 'Paid'
                        : trackingData?.order?.paymentStatus === 'failed'
                          ? 'Payment Failed'
                          : 'Payment Pending'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Delivery Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{orderDetails.customerName}</p>
                      <p className="mt-1">{orderDetails.customerAddress}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Items ({orderDetails.totalItems})</h4>
                    <div className="space-y-3 max-h-44 overflow-y-auto pr-2">
                      {orderDetails.items.map(item => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={item.src}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <div className="flex justify-between text-sm text-gray-600">
                              <p>Qty: {item.quantity}</p>
                              <p>₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{orderDetails.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>₹0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxes</span>
                      <span>₹0</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-blue-600">₹{orderDetails.totalAmount}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <span>{orderDetails.paymentMethod}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        // Generate a shareable link with the order ID
                        const shareLink = `${window.location.origin}/tracking/${orderId}`;
                        
                        // Check if the Web Share API is available
                        if (navigator.share) {
                          navigator.share({
                            title: 'Track my seafood order',
                            text: `Track my order #${orderId} from Kadal Thunai`,
                            url: shareLink,
                          })
                          .catch(err => {
                            console.error('Error sharing:', err);
                            navigator.clipboard.writeText(shareLink);
                            toast.success("Tracking link copied to clipboard");
                          });
                        } else {
                          navigator.clipboard.writeText(shareLink);
                          toast.success("Tracking link copied to clipboard");
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share Order Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Need Help Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full justify-start gap-2 mb-2">
                    <Phone className="w-4 h-4" /> 
                    Contact Customer Service
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat with Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
