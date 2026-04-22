'use client';

import React, { useEffect, useState } from 'react';
import {
  BadgeIndianRupee,
  ChevronRight,
  Clock,
  MoreVertical,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  activeCustomers: number;
  fulfilledRate: number;
  paymentSuccessRate: number;
  capturedPayments: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    shippingName: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const adminKey = localStorage.getItem('kadal_admin_key');
      if (!adminKey) return;

      try {
        const res = await fetch('/api/admin/dashboard-stats', {
          headers: { 'x-admin-key': adminKey },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Paid Revenue',
      value: `Rs ${stats?.totalRevenue.toLocaleString() || '0'}`,
      icon: TrendingUp,
      meta: 'Captured from verified payments',
    },
    {
      label: 'Total Orders',
      value: String(stats?.totalOrders || 0),
      icon: ShoppingBag,
      meta: 'Live order count',
    },
    {
      label: 'Active Products',
      value: String(stats?.activeProducts || 0),
      icon: Package,
      meta: 'Currently sellable',
    },
    {
      label: 'Active Customers',
      value: String(stats?.activeCustomers || 0),
      icon: Users,
      meta: 'Profiles with orders',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">Live operational and payment signals from the current store data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-2xl bg-red-50">
                  <stat.icon className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</h3>
                <p className="text-xs text-gray-400 mt-1">{stat.meta}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
        <Card className="border border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900">
              Recent Orders
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-[10px] font-bold text-red-600">LIVE</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              onClick={() => (window.location.href = '/admin/orders')}
            >
              View All <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-400 font-semibold border-b border-gray-100">
                    <th className="pb-3 text-xs uppercase tracking-wider">Order ID</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Customer</th>
                    <th className="pb-3 text-xs uppercase tracking-wider">Amount</th>
                    <th className="pb-3 text-xs uppercase tracking-wider text-center">Status</th>
                    <th className="pb-3 text-xs uppercase tracking-wider text-center">Payment</th>
                    <th className="pb-3 text-xs uppercase tracking-wider text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.recentOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-red-50/30 transition-colors">
                      <td className="py-3 font-bold text-gray-900">#{order.orderNumber}</td>
                      <td className="py-3 font-medium text-gray-600">{order.shippingName}</td>
                      <td className="py-3 font-bold text-gray-900">Rs {order.totalAmount}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : order.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : order.paymentStatus === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right text-gray-400 text-xs font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-gray-900">Store Performance</CardTitle>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>Orders Fulfilled</span>
                <span className="text-gray-600">{stats?.fulfilledRate ?? 0}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${stats?.fulfilledRate ?? 0}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>Payment Success Rate</span>
                <span className="text-gray-600">{stats?.paymentSuccessRate ?? 0}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{ width: `${stats?.paymentSuccessRate ?? 0}%` }} />
              </div>
            </div>

            <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100 mt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <BadgeIndianRupee className="w-5 h-5 text-red-600" />
                </div>
                <h4 className="font-bold text-sm text-gray-900">Captured Payments In Flight</h4>
              </div>
              <p className="text-2xl font-bold text-gray-900">Rs {stats?.capturedPayments?.toLocaleString() || '0'}</p>
              <p className="text-xs text-gray-500 mt-1">Verified paid orders that are not cancelled yet.</p>
              <Button variant="outline" className="w-full mt-4 rounded-xl border-red-200 bg-white hover:bg-red-50 hover:text-red-700 shadow-sm font-semibold transition-colors">
                <Clock className="w-4 h-4 mr-2" />
                Review live order flow
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
