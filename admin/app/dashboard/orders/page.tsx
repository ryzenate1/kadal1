"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Loader2, Search, Package, Truck, CheckCircle, Clock, Star, MapPin, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Order, OrderStats, OrderItem } from '@/types';
import { ApiStatus } from '@/components/dashboard/api-status';
import { downloadInvoice, printInvoice, InvoiceData } from '@/lib/invoiceUtils';
import { fetchWithAuth } from '@/lib/apiUtils';
import { RealTimeOrderManagement } from '@/components/admin/real-time-order-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const { toast } = useToast();  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/orders');
      
      if (data) {
        // Enhance orders with additional properties if needed
        const enhancedOrders = data.map((order: any) => ({
          ...order,
          loyaltyPoints: Math.floor(order.totalAmount * 0.1), // 10% of total as points
          pointsEarned: order.status === 'delivered' ? Math.floor(order.totalAmount * 0.1) : 0,
          trackingNumber: order.trackingId || (order.status !== 'pending' ? `TRK${order.id.slice(-6)}` : undefined),
          estimatedDelivery: order.status === 'shipped' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
        }));
        
        setOrders(enhancedOrders);        // Calculate stats
        const stats: OrderStats = {
          total: enhancedOrders.length,
          pending: enhancedOrders.filter((o: Order) => o.status === 'received').length, // 'received' is the initial status
          processing: enhancedOrders.filter((o: Order) => o.status === 'processing').length,
          shipped: enhancedOrders.filter((o: Order) => o.status === 'shipped').length,
          delivered: enhancedOrders.filter((o: Order) => o.status === 'delivered').length,
          cancelled: enhancedOrders.filter((o: Order) => o.status === 'cancelled').length,
          totalRevenue: enhancedOrders.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0),
          averageOrderValue: enhancedOrders.length > 0 ? enhancedOrders.reduce((sum: number, o: Order) => sum + (o.totalAmount || 0), 0) / enhancedOrders.length : 0
        };
        setStats(stats);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
      toast({
        title: "Error",
        description: "Failed to load orders. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const result = await fetchWithAuth(`/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!result) {
        throw new Error('Failed to update order status - authentication required');
      }
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              pointsEarned: newStatus === 'delivered' ? order.loyaltyPoints : 0,
              updatedAt: new Date().toISOString()
            }
          : order
      ));
      
      toast({ 
        title: "Order Updated", 
        description: `Order ${orderId} status changed to ${newStatus}`,
        variant: "default"
      });
    } catch (err: any) {
      toast({ 
        title: "Update Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };
  
  const updatePaymentStatus = async (orderId: string, newStatus: 'pending' | 'paid' | 'failed') => {
    try {
      const result = await fetchWithAuth(`/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      
      if (!result) {
        throw new Error('Failed to update payment status - authentication required');
      }
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              paymentStatus: newStatus,
              updatedAt: new Date().toISOString()
            }
          : order
      ));
      
      toast({ 
        title: "Payment Updated", 
        description: `Order ${orderId} payment status changed to ${newStatus}`,
        variant: "default"
      });
    } catch (err: any) {
      console.error('Failed to update payment status:', err);
      toast({ 
        title: "Update Failed", 
        description: err.message || 'Failed to update payment status',
        variant: "destructive"
      });
    }
  };

  const generateInvoice = (order: Order, type: 'download' | 'print') => {
    const invoiceData: InvoiceData = {
      orderId: order.id,
      customerName: order.user?.name || 'Customer',
      customerEmail: order.user?.email || '',
      customerPhone: 'N/A', // Phone not available in current user type
      orderDate: order.createdAt,      items: order.orderItems?.map((item: OrderItem) => ({
        name: item.productName || 'Product',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })) || [],
      subtotal: order.totalAmount * 0.85, // Assuming 15% tax included
      tax: order.totalAmount * 0.15,
      deliveryFee: 50, // Default delivery fee
      total: order.totalAmount,
      address: {
        street: 'Address not available',
        city: 'N/A',
        state: 'N/A',
        pincode: 'N/A'
      },
      loyaltyPointsEarned: order.pointsEarned || 0
    };

    if (type === 'download') {
      downloadInvoice(invoiceData);
    } else {
      printInvoice(invoiceData);
    }

    toast({
      title: "Invoice Generated",
      description: `Invoice for order ${order.id} has been ${type === 'download' ? 'downloaded' : 'sent to printer'}`,
      variant: "default"
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'received': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'packed': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
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

  const filteredOrders = orders
    .filter(order => 
      (orderStatusFilter === "all" || !orderStatusFilter) ? true : order.status === orderStatusFilter
    )
    .filter(order => 
      (paymentStatusFilter === "all" || !paymentStatusFilter) ? true : order.paymentStatus === paymentStatusFilter
    )
    .filter(order => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower) ||
        order.trackingNumber?.toLowerCase().includes(searchLower)
      );
    });

  const orderStatuses: Order['status'][] = ['received', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];

  if (loading && orders.length === 0 && !error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader title="Orders" description="Manage customer orders and view order history" />
      
      <ApiStatus endpoint="/orders" />
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
          <TabsTrigger value="list">Order List</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          {/* Original Order List Content */}
          <div className="flex flex-col gap-6">
            {/* Order stats cards */}
            {stats && (
              <motion.div 
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {[
                  { label: 'Total Orders', value: stats.total, color: 'text-red-600' },
                  { label: 'Processing', value: stats.processing, color: 'text-blue-600' },
                  { label: 'Shipped', value: stats.shipped, color: 'text-indigo-600' },
                  { label: 'Delivered', value: stats.delivered, color: 'text-green-600' },
                  { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
                  { label: 'Cancelled', value: stats.cancelled, color: 'text-red-600' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">{stat.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      </CardContent>
                    </Card>
                  </motion.div>                ))}
              </motion.div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <Package className="h-5 w-5 mr-2 text-red-500" />
                  Order Tracking & Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search orders, customers, tracking..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {orderStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>Using demo data. Backend connection: {error}</span>
                  </div>
                )}

                {filteredOrders.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No orders found matching your criteria.</p>
                  </div>
                )}

                {filteredOrders.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-4">
                      {filteredOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.01, y: -2 }}
                        >
                          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="font-mono text-sm font-medium">{order.id}</div>
                                <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                                  {getStatusIcon(order.status)}
                                  <span className="text-xs">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                                </Badge>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm">{order.user?.name || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">{order.user?.email || order.userId}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-red-600">₹{order.totalAmount.toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'} className="text-xs">
                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span className="text-xs">{order.pointsEarned || 0}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}>
                                    <SelectTrigger className="w-24 h-7 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {orderStatuses.map(status => (
                                        <SelectItem key={status} value={status} className="text-xs">
                                          {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => generateInvoice(order, 'download')}
                                    title="Download Invoice"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => generateInvoice(order, 'print')}
                                    title="Print Invoice"
                                  >
                                    <Printer className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/dashboard/orders/${order.id}`}>
                                      <Eye className="h-3 w-3" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>

                              {order.trackingNumber && (
                                <div className="bg-gray-50 p-2 rounded text-xs">
                                  <div className="font-mono">{order.trackingNumber}</div>
                                  {order.estimatedDelivery && (
                                    <div className="text-gray-500 flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3" />
                                      ETA: {order.estimatedDelivery}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead>Order Details</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Loyalty Points</TableHead>
                            <TableHead>Tracking</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order, index) => (
                            <motion.tr
                              key={order.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.02 }}
                              className="hover:bg-gray-50"
                            >
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-mono text-sm font-medium">{order.id}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount.toFixed(2)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{order.user?.name || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">{order.user?.email || order.userId}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                                  {getStatusIcon(order.status)}
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </TableCell>                        <TableCell>
                                <div className="space-y-2">
                                  <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                  </Badge>
                                  <Select value={order.paymentStatus} onValueChange={(value) => updatePaymentStatus(order.id, value as 'pending' | 'paid' | 'failed')}>
                                    <SelectTrigger className="w-20 h-6 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-medium">
                                    {order.pointsEarned || 0}
                                  </span>
                                  {order.status === 'delivered' && (
                                    <span className="text-xs text-green-600">(earned)</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {order.trackingNumber ? (
                                  <div className="space-y-1">
                                    <div className="font-mono text-xs">{order.trackingNumber}</div>
                                    {order.estimatedDelivery && (
                                      <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        ETA: {order.estimatedDelivery}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">Not assigned</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                  <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}>
                                    <SelectTrigger className="w-32 h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {orderStatuses.map(status => (
                                        <SelectItem key={status} value={status} className="text-xs">
                                          {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => generateInvoice(order, 'download')}
                                    title="Download Invoice"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => generateInvoice(order, 'print')}
                                    title="Print Invoice"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/dashboard/orders/${order.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="realtime">
          <RealTimeOrderManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}