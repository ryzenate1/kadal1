"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Package, RefreshCw, ChevronRight, Truck, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Define order type to match server API
interface Order {
  id: string;
  trackingNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export default function MobileOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user's orders from API
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Note: In a real app, you'd include auth token here
          // 'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const userOrders = await response.json();
      setOrders(userOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure user is redirected if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/auth/login?redirect=/account/orders');
    } else if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, router]);

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped': case 'out for delivery': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'processing': case 'packed': return <Package className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': case 'out for delivery': return 'bg-blue-100 text-blue-800';
      case 'processing': case 'packed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tendercuts-red"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md pb-20">
      <div className="sticky top-0 z-10 bg-white p-4 border-b flex items-center">
        <BackButton href="/account" />
        <h1 className="text-xl font-bold ml-4">My Orders</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchOrders}
          className="ml-auto"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {orders.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link href="/category/fish-combo">
            <Button className="bg-tendercuts-red hover:bg-tendercuts-red/90">
              Start Shopping
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-4 mt-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {orders.map((order, index) => (
            <motion.div key={order.id} variants={itemVariants}>
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  
                  {/* Items preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      asChild
                    >
                      <Link href={`/track-order?tracking=${order.trackingNumber}`}>
                        Track Order
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs flex items-center">
                      View Details
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
