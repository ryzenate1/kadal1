"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { 
  Clock, 
  Package, 
  ChevronRight, 
  ShoppingBag, 
  Repeat, 
  ArrowLeft,
  Star,
  Truck,
  FileText
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface for order items
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  src: string;
  type?: string;
  netWeight?: string;
  addedAt?: Date;
}

// Interface for orders
interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'processing' | 'cancelled';
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
}

const OrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addBulkToCart } = useCart();
  const router = useRouter();
  
  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load mock orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock orders data
        const mockOrders: Order[] = [
          {
            id: "KT-394581",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "delivered",
            items: [
              {
                id: "prod1",
                name: "Fresh Atlantic Salmon",
                price: 399,
                quantity: 2,
                src: "/images/salmon.jpg",
                type: "Fish",
                netWeight: "500g"
              },
              {
                id: "prod2",
                name: "Prawns (Medium)",
                price: 299,
                quantity: 1,
                src: "/images/prawns.jpg",
                type: "Shellfish",
                netWeight: "250g"
              }
            ],
            total: 1097,
            deliveryAddress: "123 Ocean View Apartments, Beach Road, Chennai - 600001",
            paymentMethod: "Cash on Delivery"
          },
          {
            id: "KT-385422",
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: "delivered",
            items: [
              {
                id: "prod3",
                name: "Crab (Large)",
                price: 549,
                quantity: 1,
                src: "/images/crab.jpg",
                type: "Shellfish",
                netWeight: "750g"
              },
              {
                id: "prod4",
                name: "Squid Rings",
                price: 349,
                quantity: 1,
                src: "/images/squid.jpg",
                type: "Shellfish",
                netWeight: "300g"
              }
            ],
            total: 898,
            deliveryAddress: "123 Ocean View Apartments, Beach Road, Chennai - 600001",
            paymentMethod: "UPI Payment"
          },
          {
            id: "KT-371903",
            date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
            status: "delivered",
            items: [
              {
                id: "prod5",
                name: "Tilapia Fillets",
                price: 249,
                quantity: 2,
                src: "/images/tilapia.jpg",
                type: "Fish",
                netWeight: "400g"
              }
            ],
            total: 498,
            deliveryAddress: "123 Ocean View Apartments, Beach Road, Chennai - 600001",
            paymentMethod: "Card Payment"
          }
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchOrders();
    } else {
      router.push('/auth/login?returnTo=/orders');
    }
  }, [isAuthenticated, router]);
  
  // Handle reorder
  const handleReorder = (order: Order) => {
    try {      // Add items to cart - only pass the required properties
      const cartItems = order.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        src: item.src,
        type: item.type || "",
        netWeight: item.netWeight || "",
        // Add required dummy properties to satisfy CartItem type
        omega3: 0,
        protein: 0,
        calories: 0,
        benefits: [],
        bestFor: [],
        rating: 5
      }));
      
      // Add items to cart
      addBulkToCart(cartItems);
      
      toast.success("Items added to cart");
      
      // Navigate to cart
      router.push('/cart');
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to add items to cart");
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivered</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Processing</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };
  
  if (!isAuthenticated) {
    return null; // Will be redirected in the useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
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
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center py-12"
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to place your first order!</p>
              <Link href="/">
                <Button className="w-full">
                  Browse Products
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {orders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onReorder={() => handleReorder(order)}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="delivered" className="space-y-4">
                {orders
                  .filter(order => order.status === 'delivered')
                  .map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onReorder={() => handleReorder(order)}
                    />
                  ))}
              </TabsContent>
              
              <TabsContent value="processing" className="space-y-4">
                {orders
                  .filter(order => order.status === 'processing')
                  .map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onReorder={() => handleReorder(order)}
                    />
                  ))}
                  
                {orders.filter(order => order.status === 'processing').length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No processing orders found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: Order;
  onReorder: () => void;
}

const OrderCard = ({ order, onReorder }: OrderCardProps) => {
  const router = useRouter();
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Delivered</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Processing</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Order #{order.id}</h3>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-sm text-gray-600">Placed on {formatDate(order.date)}</p>
          </div>
          <div className="flex gap-2">
            {order.status === 'processing' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/tracking/${order.id}`)}
                className="gap-1"
              >
                <Truck className="w-4 h-4" />
                Track
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/orders/${order.id}`)}
              className="gap-1"
            >
              <FileText className="w-4 h-4" />
              Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReorder}
              className="gap-1"
            >
              <Repeat className="w-4 h-4" />
              Reorder
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Order Items Preview */}
          <div className="flex -space-x-4 overflow-hidden">
            {order.items.slice(0, 3).map((item, index) => (
              <div 
                key={`${order.id}-${item.id}`} 
                className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200"
                style={{ zIndex: 10 - index }}
              >
                <Image
                  src={item.src}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="relative w-12 h-12 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-gray-600">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • Total: ₹{order.total}
            </div>
            <div className="text-sm text-gray-500 truncate mt-1">
              {order.deliveryAddress.substring(0, 60)}...
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersPage;
