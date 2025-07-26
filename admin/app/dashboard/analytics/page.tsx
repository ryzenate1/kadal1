'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Activity,
  Calendar,
  Filter
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Type definitions
interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
    productsChange: number;
  };
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  customerMetrics: {
    newCustomers: number;
    returningCustomers: number;
    customerGrowth: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const mockData = {
  overview: {
    totalRevenue: 15420.50,
    totalOrders: 342,
    totalCustomers: 128,
    totalProducts: 45,
    revenueChange: 12.5,
    ordersChange: 8.3,
    customersChange: 15.2,
    productsChange: 5.1
  },
  salesData: [
    { date: '2024-01-01', revenue: 1200, orders: 25 },
    { date: '2024-01-02', revenue: 1580, orders: 32 },
    { date: '2024-01-03', revenue: 890, orders: 18 },
    { date: '2024-01-04', revenue: 2100, orders: 41 },
    { date: '2024-01-05', revenue: 1750, orders: 35 },
    { date: '2024-01-06', revenue: 2300, orders: 46 },
    { date: '2024-01-07', revenue: 1950, orders: 38 }
  ],
  topProducts: [
    { name: 'Fresh Salmon', sales: 85, revenue: 2550 },
    { name: 'Ocean Prawns', sales: 72, revenue: 2160 },
    { name: 'Sea Bass', sales: 58, revenue: 1740 },
    { name: 'Tuna Steaks', sales: 45, revenue: 1350 },
    { name: 'Crab Legs', sales: 32, revenue: 960 }
  ],
  customerMetrics: {
    newCustomers: 45,
    returningCustomers: 83,
    customerGrowth: 15.2
  },
  recentActivity: [
    {
      id: '1',
      type: 'order',
      description: 'New order #1234 placed for Fresh Salmon',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'product',
      description: 'Product "Fresh Tuna" updated with new pricing',
      timestamp: '2024-01-15T09:45:00Z'
    },
    {
      id: '3',
      type: 'customer',
      description: 'New customer registration: john.doe@email.com',
      timestamp: '2024-01-15T09:15:00Z'
    },
    {
      id: '4',
      type: 'order',
      description: 'Order #1233 shipped to customer',
      timestamp: '2024-01-15T08:30:00Z'
    }
  ]
};

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Fetch all analytics data from your API endpoints
      const [dashboardRes, revenueRes, ordersRes, usersRes, productsRes, activityRes] = await Promise.all([
        fetch('/api/analytics/dashboard', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          credentials: 'include'
        }),
        fetch(`/api/analytics/revenue?period=${dateRange}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          credentials: 'include'
        }),
        fetch(`/api/analytics/orders?period=${dateRange}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          credentials: 'include'
        }),
        fetch(`/api/analytics/users?period=${dateRange}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          credentials: 'include'
        }),
        fetch('/api/analytics/products', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          credentials: 'include'
        }),
        fetch('/api/analytics/activity?limit=10', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          credentials: 'include'
        })
      ]);

      // Check if all requests were successful
      if (!dashboardRes.ok || !revenueRes.ok || !ordersRes.ok || !usersRes.ok || !productsRes.ok || !activityRes.ok) {
        const errorMessage = !dashboardRes.ok ? 'Dashboard data failed' :
                           !revenueRes.ok ? 'Revenue data failed' :
                           !ordersRes.ok ? 'Orders data failed' :
                           !usersRes.ok ? 'Users data failed' :
                           !productsRes.ok ? 'Products data failed' :
                           'Activity data failed';
        throw new Error(`${errorMessage} (${dashboardRes.status || revenueRes.status || ordersRes.status || usersRes.status || productsRes.status || activityRes.status})`);
      }

      // Parse all responses
      const [dashboard, revenue, orders, users, products, activity] = await Promise.all([
        dashboardRes.json(),
        revenueRes.json(),
        ordersRes.json(),
        usersRes.json(),
        productsRes.json(),
        activityRes.json()
      ]);      // Combine all data into the expected format
      const combinedData: AnalyticsData = {
        overview: {
          totalRevenue: dashboard.revenue?.total || 0,
          totalOrders: dashboard.orders?.total || 0,
          totalCustomers: dashboard.users?.total || 0,
          totalProducts: dashboard.products?.total || 0,
          revenueChange: dashboard.revenue?.growth || 0,
          ordersChange: dashboard.orders?.growth || 0,
          customersChange: dashboard.users?.growth || 0,
          productsChange: dashboard.products?.growth || 0
        },
        salesData: revenue.data || revenue.trend || [],
        topProducts: products.topProducts?.map((product: any) => ({
          name: product.name,
          sales: product.salesCount || product.sales,
          revenue: product.revenue
        })) || [],
        customerMetrics: {
          newCustomers: users.newCustomers || users.new || 0,
          returningCustomers: users.returningCustomers || users.returning || 0,
          customerGrowth: users.growth || 0
        },
        recentActivity: activity.data || activity.activities || []
      };

      setAnalyticsData(combinedData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Fallback to mock data if API fails
      setAnalyticsData(mockData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && !loading) {
      interval = setInterval(() => {
        fetchAnalytics();
      }, 30000); // 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, loading, dateRange]);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your fish marketplace performance and insights</p>
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">⚠️ {error}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)} 
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button 
            onClick={fetchAnalytics} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {analyticsData.overview.revenueChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  <span className={analyticsData.overview.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(analyticsData.overview.revenueChange)} from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalOrders.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {analyticsData.overview.ordersChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  <span className={analyticsData.overview.ordersChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(analyticsData.overview.ordersChange)} from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalCustomers.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {analyticsData.overview.customersChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  <span className={analyticsData.overview.customersChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(analyticsData.overview.customersChange)} from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalProducts.toLocaleString()}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {analyticsData.overview.productsChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  )}
                  <span className={analyticsData.overview.productsChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercentage(analyticsData.overview.productsChange)} from last period
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales">Sales Overview</TabsTrigger>
              <TabsTrigger value="products">Top Products</TabsTrigger>
              <TabsTrigger value="customers">Customer Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Daily revenue over the selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Orders Trend</CardTitle>
                    <CardDescription>Daily orders over the selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>Best selling products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs px-2 py-1">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.sales} sales</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(product.revenue / product.sales)} avg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Distribution</CardTitle>
                    <CardDescription>New vs returning customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'New Customers', value: analyticsData.customerMetrics.newCustomers },
                            { name: 'Returning Customers', value: analyticsData.customerMetrics.returningCustomers }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[{ name: 'New Customers' }, { name: 'Returning Customers' }].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Growth</CardTitle>
                    <CardDescription>Customer acquisition metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-900">New Customers</span>
                      <span className="text-2xl font-bold text-blue-600">{analyticsData.customerMetrics.newCustomers}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-900">Returning Customers</span>
                      <span className="text-2xl font-bold text-green-600">{analyticsData.customerMetrics.returningCustomers}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-900">Growth Rate</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatPercentage(analyticsData.customerMetrics.customerGrowth)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities and events</CardDescription>
                </div>
                {autoRefresh && (
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Live
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.recentActivity.length > 0 ? (
                  analyticsData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        <Badge variant={activity.type === 'order' ? 'default' : activity.type === 'product' ? 'secondary' : 'outline'}>
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}