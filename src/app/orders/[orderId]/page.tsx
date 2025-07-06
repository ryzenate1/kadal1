"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { 
  ArrowLeft,
  MapPin,
  Truck,
  Calendar,
  CreditCard,
  Repeat,
  FileText,
  ShoppingBag,
  Download,
  Share2,
  Phone
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Interface for order items
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  src: string;
  type?: string;
  netWeight?: string;
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
  deliveryDate?: string;
  invoiceNumber?: string;
}






// Workaround: Next.js type generation bug - params is not a Promise in real usage
const OrderDetailsPage = ({ params }: any) => {
  const { orderId } = params as { orderId: string };
  const { user, isAuthenticated } = useAuth();
  const { addBulkToCart } = useCart();
  const router = useRouter();
  
  // State for order details
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load mock order data
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock order data
        let mockOrder: Order | null = null;
        
        // Check if the order ID matches any of our mock orders
        if (orderId === "KT-394581") {
          mockOrder = {
            id: "KT-394581",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "delivered",
            invoiceNumber: "INV-39458123",
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
          };
        } else if (orderId === "KT-385422") {
          mockOrder = {
            id: "KT-385422",
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            deliveryDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            status: "delivered",
            invoiceNumber: "INV-38542234",
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
          };
        } else {
          // Fallback mock order if ID doesn't match
          mockOrder = {
            id: orderId,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "processing",
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
          };
        }
        
        setOrder(mockOrder);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchOrderDetails();
    } else {
      router.push('/auth/login?returnTo=/orders/' + orderId);
    }
  }, [isAuthenticated, orderId, router]);
  
  // Handle reorder
  const handleReorder = () => {
    if (!order) return;
    
    try {
      // Add items to cart - only pass the required properties
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
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-600">Order #{orderId}</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        ) : !order ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
            <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
            <Link href="/orders">
              <Button>
                Back to My Orders
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Order Summary
                    </CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex gap-2 items-start">
                      <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Order Date</p>
                        <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-start">
                      <Truck className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Delivery Date</p>
                        <p className="text-sm text-gray-600">
                          {order.status === 'delivered' 
                            ? formatDate(order.deliveryDate) 
                            : 'Pending delivery'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-start">
                      <CreditCard className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Payment Method</p>
                        <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-start">
                      <FileText className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Invoice</p>
                        <p className="text-sm text-gray-600">
                          {order.invoiceNumber ? `#${order.invoiceNumber}` : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Delivery Address</h3>
                    <div className="flex gap-2 items-start">
                      <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <p>{user?.name || "Customer"}</p>
                        <p className="mt-1">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Order Items Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Items ({order.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.src}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.type && (
                              <Badge variant="secondary" className="text-xs">
                                {item.type}
                              </Badge>
                            )}
                            {item.netWeight && (
                              <Badge variant="secondary" className="text-xs">
                                {item.netWeight}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex justify-between mt-2">
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                            <span className="font-medium">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleReorder}
                      className="gap-2"
                    >
                      <Repeat className="w-4 h-4" />
                      Reorder
                    </Button>
                    
                    {order.status === 'processing' && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/tracking/${order.id}`)}
                        className="gap-2"
                      >
                        <Truck className="w-4 h-4" />
                        Track Order
                      </Button>
                    )}
                    
                    {order.invoiceNumber && (
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => toast.info("Invoice download feature will be available soon")}
                      >
                        <Download className="w-4 h-4" />
                        Download Invoice
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        const shareText = `Check out my order #${order.id} from Kadal Thunai - Fresh Seafood Delivery`;
                        if (navigator.share) {
                          navigator.share({
                            title: 'My Kadal Thunai Order',
                            text: shareText,
                            url: window.location.href
                          }).catch(err => {
                            navigator.clipboard.writeText(shareText + ' ' + window.location.href);
                            toast.success("Order details copied to clipboard");
                          });
                        } else {
                          navigator.clipboard.writeText(shareText + ' ' + window.location.href);
                          toast.success("Order details copied to clipboard");
                        }
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Price Summary Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Price Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price ({order.items.length} items)</span>
                        <span>₹{order.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span>₹0</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span className="text-blue-600">₹{order.total}</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Help Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full justify-start gap-2 mb-2">
                      <Phone className="w-4 h-4" /> 
                      Call Support
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      For any issues with your order, our customer support team is available from 9 AM to 9 PM.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
