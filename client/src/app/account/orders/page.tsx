"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ArrowLeft,
  Eye,
  Download,
  RotateCcw,
  Filter,
  Search,
  Calendar,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  weight?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  pointsEarned: number;
}

const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  processing: { color: 'bg-purple-100 text-purple-800', icon: Package },
  shipped: { color: 'bg-orange-100 text-orange-800', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/orders');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/orders');
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      // Mock data for development
      const mockOrders: Order[] = [
        {
          id: "ord_001",
          orderNumber: "KT2025001",
          status: "delivered",
          totalAmount: 899,
          paymentStatus: "paid",
          paymentMethod: "UPI",
          trackingNumber: "TRK123456789",
          estimatedDelivery: "2025-06-10",
          createdAt: "2025-06-08T10:30:00Z",
          updatedAt: "2025-06-10T15:45:00Z",
          pointsEarned: 45,
          items: [
            {
              id: "item_001",
              productId: "prod_001",
              productName: "Fresh Pomfret",
              productImage: "/images/fish/pomfret.jpg",
              quantity: 1,
              price: 549,
              weight: "500g"
            },
            {
              id: "item_002",
              productId: "prod_002",
              productName: "King Fish Steaks",
              productImage: "/images/fish/kingfish.jpg",
              quantity: 1,
              price: 350,
              weight: "300g"
            }
          ],
          address: {
            name: "Test User",
            address: "123 Main Street, Apartment 4B",
            city: "Chennai",
            state: "Tamil Nadu",
            pincode: "600001"
          }
        },
        {
          id: "ord_002",
          orderNumber: "KT2025002",
          status: "shipped",
          totalAmount: 1299,
          paymentStatus: "paid",
          paymentMethod: "Credit Card",
          trackingNumber: "TRK987654321",
          estimatedDelivery: "2025-06-16",
          createdAt: "2025-06-14T09:15:00Z",
          updatedAt: "2025-06-15T11:20:00Z",
          pointsEarned: 65,
          items: [
            {
              id: "item_003",
              productId: "prod_003",
              productName: "Tiger Prawns",
              productImage: "/images/fish/prawns.jpg",
              quantity: 1,
              price: 799,
              weight: "500g"
            },
            {
              id: "item_004",
              productId: "prod_004",
              productName: "Sea Bass",
              productImage: "/images/fish/seabass.jpg",
              quantity: 1,
              price: 500,
              weight: "400g"
            }
          ],
          address: {
            name: "Test User",
            address: "123 Main Street, Apartment 4B",
            city: "Chennai",
            state: "Tamil Nadu",
            pincode: "600001"
          }
        },
        {
          id: "ord_003",
          orderNumber: "KT2025003",
          status: "processing",
          totalAmount: 650,
          paymentStatus: "paid",
          paymentMethod: "UPI",
          estimatedDelivery: "2025-06-17",
          createdAt: "2025-06-15T14:30:00Z",
          updatedAt: "2025-06-15T14:30:00Z",
          pointsEarned: 33,
          items: [
            {
              id: "item_005",
              productId: "prod_005",
              productName: "Mackerel",
              productImage: "/images/fish/mackerel.jpg",
              quantity: 2,
              price: 325,
              weight: "250g each"
            }
          ],
          address: {
            name: "Test User",
            address: "123 Main Street, Apartment 4B",
            city: "Chennai",
            state: "Tamil Nadu",
            pincode: "600001"
          }
        }
      ];
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.productName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter]);

  // Handle reorder
  const handleReorder = async (order: Order) => {
    try {
      const response = await fetch('/api/user/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.id })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Order #${result.newOrderId} has been created successfully!`);
        // Refresh orders to show the new order
        await fetchOrders();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to reorder' }));
        throw new Error(errorData.error || 'Failed to reorder');
      }
    } catch (error) {
      console.error('Reorder error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to reorder items");
    }
  };  // Handle order cancellation
  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/user/orders/${orderId}/cancel`, {
        method: 'PATCH'
      });

      if (response.ok) {
        toast.success("Order cancelled successfully");
        await fetchOrders(); // Refresh orders
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to cancel order' }));
        throw new Error(errorData.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    }
  };

  // Handle download invoice
  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/user/orders/${orderId}/invoice`);
      
      if (response.ok) {
        const htmlContent = await response.text();
        
        // Create a new window/tab for the invoice
        const invoiceWindow = window.open('', '_blank');
        if (invoiceWindow) {
          invoiceWindow.document.write(htmlContent);
          invoiceWindow.document.close();
          toast.success("Invoice opened in new tab - you can print or save as PDF");
        } else {
          // Fallback: Create blob and download
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${orderId}.html`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("Invoice downloaded successfully");
        }
      } else {
        throw new Error('Failed to generate invoice');
      }
    } catch (error) {
      console.error('Download invoice error:', error);
      toast.error("Failed to download invoice");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders by number or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't placed any orders yet"
                }
              </p>
              <Button onClick={() => router.push('/')} className="bg-red-600 hover:bg-red-700">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <Badge className={statusConfig[order.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <span className="text-lg font-bold text-gray-900">₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-12 w-12 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/fish/placeholder.jpg';
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            <p className="text-sm text-gray-600">
                              {item.weight} × {item.quantity} = ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Payment:</span> {order.paymentMethod} • {order.paymentStatus}
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <span className="font-medium">Tracking:</span> {order.trackingNumber}
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div>
                          <span className="font-medium">Estimated Delivery:</span> {formatDate(order.estimatedDelivery)}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Points Earned:</span> {order.pointsEarned}
                      </div>
                    </div>                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </Button>
                      
                      {['delivered', 'shipped'].includes(order.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4" />
                          <span>Invoice</span>
                        </Button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(order)}
                          className="flex items-center space-x-1"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Reorder</span>
                        </Button>
                      )}
                      
                      {['pending', 'confirmed'].includes(order.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Cancel</span>
                        </Button>
                      )}
                      
                      {order.trackingNumber && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/track/${order.trackingNumber}`)}
                          className="flex items-center space-x-1"
                        >
                          <Truck className="h-4 w-4" />
                          <span>Track</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Order Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="font-semibold mb-2">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Order Number: {selectedOrder.orderNumber}</div>
                  <div>Status: {selectedOrder.status}</div>
                  <div>Total: ₹{selectedOrder.totalAmount}</div>
                  <div>Payment: {selectedOrder.paymentMethod}</div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-gray-600">{item.weight} × {item.quantity}</div>
                      </div>
                      <div className="font-medium">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <div>{selectedOrder.address.name}</div>
                  <div>{selectedOrder.address.address}</div>
                  <div>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.pincode}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
