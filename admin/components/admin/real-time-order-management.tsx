'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminRealtime } from '@/lib/useAdminRealtime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { OrderNotificationsSetup } from '@/components/admin/order-notifications-setup';
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bell,
  RefreshCw,
  MapPin,
  MoreVertical,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  Users
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/apiUtils';
import { Order } from '@/types';

export function RealTimeOrderManagement() {
  const { isConnected, orderStats, recentOrders, latestOrderUpdate, sendMessage } = useAdminRealtime();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  
  // Function to update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setProcessingAction(true);
      
      const result = await fetchWithAuth(`/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!result) {
        throw new Error('Failed to update order status');
      }
      
      toast({
        title: 'Order Updated',
        description: `Order status changed to ${newStatus}`,
        variant: 'default',
      });
      
      // The WebSocket will automatically update the UI
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update order status',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, icon: JSX.Element }> = {
      'pending': { color: 'bg-slate-500', icon: <Clock className="h-3 w-3" /> },
      'processing': { color: 'bg-blue-500', icon: <Package className="h-3 w-3" /> },
      'ready_for_pickup': { color: 'bg-amber-500', icon: <Package className="h-3 w-3" /> },
      'out_for_delivery': { color: 'bg-indigo-500', icon: <Truck className="h-3 w-3" /> },
      'delivered': { color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
      'cancelled': { color: 'bg-red-500', icon: <AlertTriangle className="h-3 w-3" /> },
    };
    
    const statusInfo = statusMap[status] || { color: 'bg-slate-500', icon: <Clock className="h-3 w-3" /> };
    
    return (
      <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
        {statusInfo.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };
  
  // Get payment status badge
  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { color: string }> = {
      'pending': { color: 'bg-slate-500' },
      'processing': { color: 'bg-blue-500' },
      'completed': { color: 'bg-green-500' },
      'failed': { color: 'bg-red-500' },
      'refunded': { color: 'bg-amber-500' },
    };
    
    const statusInfo = statusMap[status] || { color: 'bg-slate-500' };
    
    return (
      <Badge className={`${statusInfo.color} text-white text-xs`}>
        {status}
      </Badge>
    );
  };
  
  // Calculate delivery progress percentage
  const getProgressPercentage = (status: string) => {
    const statusMap: Record<string, number> = {
      'pending': 10,
      'processing': 30,
      'ready_for_pickup': 50,
      'out_for_delivery': 75,
      'delivered': 100,
      'cancelled': 100,
    };
    
    return statusMap[status] || 0;
  };
  
  // Get next possible status options based on current status
  const getNextStatusOptions = (currentStatus: string) => {
    const statusFlow: Record<string, string[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['ready_for_pickup', 'cancelled'],
      'ready_for_pickup': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    
    return statusFlow[currentStatus] || [];
  };
  
  return (
    <div className="space-y-6">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Real-Time Order Management</h2>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1.5 bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-medium">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Connecting...
            </div>
          )}
        </div>
      </div>
      
      {/* Stats cards */}
      {orderStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{orderStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg. ₹{orderStats.averageOrderValue.toFixed(2)} per order
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Delivery
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.processing + orderStats.ready_for_pickup + orderStats.out_for_delivery}</div>
              <p className="text-xs text-muted-foreground">
                {orderStats.out_for_delivery} out for delivery
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Delivered Today
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.delivered}</div>
              <p className="text-xs text-muted-foreground">
                {orderStats.cancelled} cancelled
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Recent Orders & Order Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 border rounded-lg ${selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {order.user?.name?.substring(0, 2) || 'CU'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{order.user?.name || 'Customer'}</div>
                          <div className="text-xs text-muted-foreground">Order #{order.id.substring(0, 8)}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-medium">₹{order.totalAmount}</div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Progress value={getProgressPercentage(order.status)} className="h-1.5" />
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Details
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No recent orders</h3>
                  <p className="text-sm text-muted-foreground">
                    New orders will appear here in real-time
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Order Detail */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOrder ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Order #{selectedOrder.id.substring(0, 8)}</h3>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer</span>
                      <span className="text-sm font-medium">{selectedOrder.user?.name || 'Guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <span className="text-sm font-medium">{selectedOrder.user?.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items</span>
                      <span className="text-sm font-medium">{selectedOrder.orderItems?.length || 0} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="text-sm font-medium">₹{selectedOrder.totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        {selectedOrder.paymentMethod}
                        {getPaymentBadge(selectedOrder.paymentStatus || 'pending')}
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.address?.address || 'No address provided'}
                      {selectedOrder.address?.city && `, ${selectedOrder.address.city}`}
                      {selectedOrder.address?.pincode && ` - ${selectedOrder.address.pincode}`}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {getNextStatusOptions(selectedOrder.status).map((status) => (
                        <Button
                          key={status}
                          variant={status === 'cancelled' ? 'destructive' : 'outline'}
                          size="sm"
                          className="h-8"
                          disabled={processingAction}
                          onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        >
                          {status === 'cancelled' ? 'Cancel Order' : `Mark as ${status.replace('_', ' ')}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium">No order selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select an order from the list to view details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Notifications Setup */}
          <OrderNotificationsSetup />
        </div>
      </div>
    </div>
  );
}
