"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Calendar,
  CreditCard,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  weight?: string;
  imageUrl?: string;
}

interface OrderAddress {
  id: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface OrderDetail {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  items: OrderItem[];
  address: OrderAddress;
  status: 'received' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  loyaltyPoints: number;
  pointsEarned: number;
  notes?: string;
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

const statusSteps = [
  { key: 'received', label: 'Order Received', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);  const [updating, setUpdating] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the API
      // For now, we'll create mock data
      const mockOrder: OrderDetail = {
        id: params.id as string,
        userId: 'USR001',
        user: {
          id: 'USR001',
          name: 'Ravi Kumar',
          email: 'ravi@example.com',
          phoneNumber: '+91 9876543210'
        },
        items: [
          {
            id: 'ITM001',
            productName: 'Fresh Pomfret',
            quantity: 2,
            price: 150,
            weight: '500g each',
            imageUrl: '/images/pomfret.jpg'
          },
          {
            id: 'ITM002',
            productName: 'King Fish Steaks',
            quantity: 1,
            price: 200,
            weight: '750g',
            imageUrl: '/images/kingfish.jpg'
          }
        ],
        address: {
          id: 'ADDR001',
          fullName: 'Ravi Kumar',
          phoneNumber: '+91 9876543210',
          addressLine1: '123 Marina Beach Road',
          addressLine2: 'Near Lighthouse',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001'
        },
        status: 'shipped',
        totalAmount: 500,
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        trackingNumber: 'TRK' + params.id?.toString().slice(-6),
        estimatedDelivery: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
        loyaltyPoints: 50,
        pointsEarned: 0,
        notes: 'Customer requested early morning delivery',
        statusHistory: [
          { status: 'received', timestamp: new Date(Date.now() - 172800000).toISOString(), note: 'Order placed successfully' },
          { status: 'processing', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Order confirmed and processing started' },
          { status: 'packed', timestamp: new Date(Date.now() - 43200000).toISOString(), note: 'Items packed and ready for dispatch' },
          { status: 'shipped', timestamp: new Date(Date.now() - 3600000).toISOString(), note: 'Order shipped via delivery partner' }
        ]
      };
      
      setOrder(mockOrder);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });    } finally {
      setLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const updateOrderStatus = async (newStatus: OrderDetail['status']) => {
    if (!order) return;
    
    setUpdating(true);
    try {
      // In a real app, this would call the API
      const updatedOrder = {
        ...order,
        status: newStatus,
        pointsEarned: newStatus === 'delivered' ? order.loyaltyPoints : 0,
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...order.statusHistory,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: `Status updated to ${newStatus}`
          }
        ]
      };
      
      setOrder(updatedOrder);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const step = statusSteps.find(s => s.key === status);
    return step ? <step.icon className="h-4 w-4" /> : <Clock className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'packed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCurrentStatusIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Order not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <DashboardHeader
            title={`Order #${order.id}`}
            description={`Placed on ${new Date(order.createdAt).toLocaleDateString()}`}
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={order.status} onValueChange={(value) => updateOrderStatus(value as OrderDetail['status'])} disabled={updating}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusSteps.map(step => (
                <SelectItem key={step.key} value={step.key}>
                  {step.label}
                </SelectItem>
              ))}
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Tracking - Glass Morphism Design */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Package className="h-5 w-5 mr-2 text-red-500" />
                Order Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status Progress */}
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= getCurrentStatusIndex();
                    const isCurrent = index === getCurrentStatusIndex();
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                          ${isCompleted 
                            ? 'bg-red-500 text-white shadow-lg' 
                            : 'bg-gray-200 text-gray-400'
                          }
                          ${isCurrent ? 'ring-4 ring-red-200 scale-110' : ''}
                        `}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className={`text-xs text-center font-medium ${isCompleted ? 'text-red-600' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                        {index < statusSteps.length - 1 && (
                          <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${isCompleted ? 'bg-red-300' : 'bg-gray-200'}`} 
                               style={{ marginLeft: '20px', width: 'calc(100% - 40px)' }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current Status Badge */}
                <div className="flex items-center justify-center">
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-2 px-4 py-2 text-sm`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>

                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Tracking Number:</span>
                      <span className="font-mono text-sm">{order.trackingNumber}</span>
                    </div>
                    {order.estimatedDelivery && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Estimated Delivery:</span>
                        <span className="text-sm">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Package className="h-5 w-5 mr-2 text-red-500" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">Weight: {item.weight}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-xl font-bold text-red-600">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Clock className="h-5 w-5 mr-2 text-red-500" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      {getStatusIcon(history.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{history.status}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Payment Details */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <User className="h-5 w-5 mr-2 text-red-500" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{order.user.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{order.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{order.user.phoneNumber}</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Loyalty Points
                </h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Points to Earn:</span>
                    <span className="font-medium">{order.loyaltyPoints}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Points Earned:</span>
                    <span className={`font-medium ${order.pointsEarned > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {order.pointsEarned}
                    </span>
                  </div>
                  {order.status !== 'delivered' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Points will be credited upon delivery
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.address.fullName}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>{order.address.city}, {order.address.state}</p>
                <p>PIN: {order.address.pincode}</p>
                <div className="flex items-center gap-2 pt-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{order.address.phoneNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <CreditCard className="h-5 w-5 mr-2 text-red-500" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Payment Method:</span>
                  <span className="text-sm font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Payment Status:</span>
                  <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Amount:</span>
                  <span className="text-sm font-bold text-red-600">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <Calendar className="h-5 w-5 mr-2 text-red-500" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
