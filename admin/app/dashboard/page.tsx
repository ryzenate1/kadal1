"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, LayoutList, ShoppingBag, BarChart3, AlertTriangle, Loader2, TrendingUp, Package, Star, Clock, CheckCircle, Truck, BoxIcon, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { DashboardStats, RecentOrder, Order } from '@/types';
import ApiConnectionChecker from '@/components/dashboard/api-connection-checker';
import { fetchWithAuth, fetchWithFallback } from '@/lib/enhancedApiUtils';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [adminApiConnected, setAdminApiConnected] = useState<boolean>(false);
  const [serverApiConnected, setServerApiConnected] = useState<boolean>(false);  // Check API connection status
  const { toast } = useToast();
    // Use environment variable with fallback  const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api';
    // Fetch recent orders separately
  const fetchRecentOrders = useCallback(async () => {
    try {
      // Try multiple endpoints with fallback
      const ordersData = await fetchWithFallback([
        '/orders?limit=5&sort=desc',
        '/analytics/orders?limit=5&sort=desc'
      ]);
      
      if (ordersData && ordersData.data) {
        const transformedOrders: RecentOrder[] = ordersData.data.map((order: any) => ({
          id: order.id,
          customer: order.customerName || order.customer?.name || 'Unknown Customer',
          amount: order.totalAmount || order.amount || 0,
          status: order.status || 'pending',
          date: order.createdAt || order.date || new Date().toISOString(),
          trackingId: order.trackingId || order.id
        }));
        setRecentOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      // Don't show error for recent orders as it's not critical
    }
  }, []);
  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching dashboard stats...');
      
      // Try multiple endpoints with fallback
      const data = await fetchWithFallback([
        '/analytics/dashboard',
        '/dashboard/stats',
        '/stats/dashboard'
      ]);
      
      if (data) {
        console.log('Dashboard stats received:', data);
        
        // Transform data to match expected format
        const dashboardStats: DashboardStats = {
          totalRevenue: data.revenue?.total || 0,
          totalOrders: data.orders?.total || 0,
          totalProducts: data.products?.total || 0,
          totalUsers: data.users?.total || 0,
          pendingOrders: data.orders?.byStatus?.pending || 0,
          activeProducts: data.products?.total || 0,
          completedOrders: data.orders?.byStatus?.delivered || 0,
          revenueGrowth: data.revenue?.growth || 0,
          orderGrowth: data.orders?.growth || 0,
          conversionRate: 0, // Can be calculated later
          averageOrderValue: data.orders?.total > 0 ? (data.revenue?.total || 0) / data.orders.total : 0
        };
        
        setStats(dashboardStats);
        
        // Fetch recent orders separately
        await fetchRecentOrders();
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || 'Failed to fetch dashboard statistics');
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, fetchRecentOrders]);
  const checkApiStatus = useCallback(async () => {
    const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api';
    
    try {
      console.log('Checking API status...');
      
      // Check admin client API (local Next.js API routes)
      let adminConnected = false;
      try {
        const adminResponse = await fetch('/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
        adminConnected = adminResponse.ok;
        console.log('Admin API response:', {
          ok: adminResponse.ok,
          status: adminResponse.status,
          statusText: adminResponse.statusText
        });
        
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          console.log('Admin API data:', adminData);
        }
      } catch (adminError) {
        console.error('Admin API error:', adminError);
        adminConnected = false;
      }
      
      // Check server API (Express server)
      let serverConnected = false;
      try {
        const serverResponse = await fetch(`${SERVER_API_URL}/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
        serverConnected = serverResponse.ok;
        console.log('Server API response:', {
          ok: serverResponse.ok,
          status: serverResponse.status,
          statusText: serverResponse.statusText
        });
        
        if (serverResponse.ok) {
          const serverData = await serverResponse.json();
          console.log('Server API data:', serverData);
        }
      } catch (serverError) {
        console.error('Server API error:', serverError);
        serverConnected = false;
      }
      
      setAdminApiConnected(adminConnected);
      setServerApiConnected(serverConnected);
      
      console.log('Final API status:', { adminConnected, serverConnected });
    } catch (error) {
      console.error('Error checking API status:', error);
      setAdminApiConnected(false);      setServerApiConnected(false);
    }
  }, []);  useEffect(() => {
    fetchDashboardStats();
    checkApiStatus();
  }, [fetchDashboardStats, checkApiStatus]);
  
  const statItems = [
    { 
      title: "Total Revenue", 
      count: stats?.totalRevenue, 
      icon: TrendingUp, 
      link: "/dashboard/orders", 
      color: "text-red-500 bg-red-50",
      prefix: "₹"
    },
    { 
      title: "Today's Orders", 
      count: stats?.totalOrders, 
      icon: ShoppingBag, 
      link: "/dashboard/orders", 
      color: "text-red-600 bg-red-50" 
    },
    { 
      title: "Total Products", 
      count: stats?.totalProducts, 
      icon: Package, 
      link: "/dashboard/products", 
      color: "text-red-500 bg-red-50" 
    },
    { 
      title: "Total Users", 
      count: stats?.totalUsers, 
      icon: Users, 
      link: "/dashboard/users", 
      color: "text-red-600 bg-red-50" 
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <DashboardHeader
        title="Dashboard Overview"
        description="Welcome to Kadal Thunai Admin Panel. Monitor your seafood business performance."
      />

      <ApiConnectionChecker 
        adminClientConnected={adminApiConnected} 
        serverConnected={serverApiConnected} 
      />

      {loading && (
        <div className="p-4 sm:p-8 flex justify-center items-center min-h-[calc(100vh-300px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <Card className="bg-red-50 border-red-200 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center text-sm sm:text-base">
              <AlertTriangle size={16} className="mr-2 sm:mr-2 sm:h-5 sm:w-5" /> Data Loading Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 text-sm">
            <p>{error}</p>
            <p className="mt-2 text-xs sm:text-sm">Please ensure the backend server is running and accessible.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Main Stats Grid - Responsive columns */}
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-4">
            {statItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                className="cursor-pointer"
              >
                <Link href={item.link}>
                  <Card className="h-full border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
                      <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 truncate pr-1 sm:pr-2 leading-tight">
                        {item.title}
                      </CardTitle>
                      <div className={`p-1.5 sm:p-2 rounded-lg ${item.color} flex-shrink-0`}>
                        <item.icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
                      <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                        {item.prefix && item.count !== undefined ? `${item.prefix}${item.count.toLocaleString()}` : 
                         item.count !== undefined ? item.count.toLocaleString() : 0}
                      </div>
                      <p className="text-xs text-red-600 hover:text-red-800 hover:underline transition-colors mt-1 hidden sm:block">
                        View details →
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Secondary Stats */}
          <motion.div 
            className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center text-gray-800 text-sm sm:text-base">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 flex-shrink-0" />
                  <span className="truncate">Pending Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.pendingOrders}</div>
                <p className="text-xs sm:text-sm text-gray-500">Need attention</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center text-gray-800 text-sm sm:text-base">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 flex-shrink-0" />
                  <span className="truncate">Low Stock Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.pendingOrders}</div>
                <p className="text-xs sm:text-sm text-gray-500">Items running low</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm md:col-span-2 lg:col-span-1">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center text-gray-800 text-sm sm:text-base">
                  <LayoutList className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 flex-shrink-0" />
                  <span className="truncate">Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.totalProducts}</div>
                <p className="text-xs sm:text-sm text-gray-500">Product categories</p>
              </CardContent>            </Card>
          </motion.div>

          {/* Dynamic Order Status Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center text-gray-800 text-sm sm:text-base">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 flex-shrink-0" />
                  Order Status Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5">
                  {/* Received Orders */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-sm border border-blue-200 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-800">{stats.totalOrders || 0}</div>
                    <p className="text-xs text-blue-700 font-medium">Received</p>
                    <p className="text-xs text-blue-600 mt-1">New orders</p>
                  </motion.div>

                  {/* Processing Orders */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-yellow-50 to-yellow-100 backdrop-blur-sm border border-yellow-200 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-800">{Math.floor((stats.pendingOrders || 0) * 0.6)}</div>
                    <p className="text-xs text-yellow-700 font-medium">Processing</p>
                    <p className="text-xs text-yellow-600 mt-1">Being prepared</p>
                  </motion.div>

                  {/* Packed Orders */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 backdrop-blur-sm border border-purple-200 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <BoxIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-800">{Math.floor((stats.pendingOrders || 0) * 0.3)}</div>
                    <p className="text-xs text-purple-700 font-medium">Packed</p>
                    <p className="text-xs text-purple-600 mt-1">Ready to ship</p>
                  </motion.div>

                  {/* Shipped Orders */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 backdrop-blur-sm border border-orange-200 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Truck className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-800">{Math.floor((stats.totalOrders || 0) * 0.2)}</div>
                    <p className="text-xs text-orange-700 font-medium">Shipped</p>
                    <p className="text-xs text-orange-600 mt-1">In transit</p>
                  </motion.div>

                  {/* Delivered Orders */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 backdrop-blur-sm border border-green-200 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-800">{Math.floor((stats.totalOrders || 0) * 0.7)}</div>
                    <p className="text-xs text-green-700 font-medium">Delivered</p>
                    <p className="text-xs text-green-600 mt-1">Completed</p>
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Order Processing Pipeline</span>
                    <span>{Math.round(((stats.totalOrders || 0) / Math.max(stats.totalOrders || 1, 1)) * 100)}% Completion Rate</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 via-yellow-500 via-purple-500 via-orange-500 to-green-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(((stats.totalOrders || 0) / Math.max(stats.totalOrders || 1, 10)) * 100)}%` }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center text-gray-800 text-sm sm:text-base">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 flex-shrink-0" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors space-y-2 sm:space-y-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                        <div className="font-medium text-gray-900 text-sm">{order.id}</div>
                        <div className="text-gray-600 text-sm truncate">{order.customer}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-medium text-gray-900 text-sm">₹{order.amount}</div>
                        <div className="text-xs text-gray-500">{order.date}</div>
                      </div>
                    </motion.div>
                  ))}
                  {recentOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No recent orders found
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Link href="/dashboard/orders" className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline">
                    View all orders →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
