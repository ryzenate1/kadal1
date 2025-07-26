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
import { Search, Loader2, Users, Star, Trophy, Calendar, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User, CustomerStats } from '@/types';
import { fetchWithAuth } from '@/lib/apiUtils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { toast } = useToast();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/users');
      
      if (data) {
        // Enhance customers with additional properties
        const enhancedCustomers = data.map((customer: any) => ({
          ...customer,
          loyaltyTier: customer.loyaltyPoints >= 1000 ? 'platinum' : 
                      customer.loyaltyPoints >= 500 ? 'gold' : 
                      customer.loyaltyPoints >= 100 ? 'silver' : 'bronze',
          isActive: customer.lastOrderDate ? 
                   (new Date().getTime() - new Date(customer.lastOrderDate).getTime()) < (30 * 24 * 60 * 60 * 1000) : 
                   false,
          customerTags: [
            ...(customer.totalOrders >= 10 ? ['trusted'] : []),
            ...(customer.totalOrders >= 50 ? ['vip'] : []),
            ...(customer.totalSpent >= 5000 ? ['high-value'] : []),
            ...((new Date().getTime() - new Date(customer.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000) ? ['new'] : [])
          ]
        }));
        
        setCustomers(enhancedCustomers);
        
        // Calculate stats
        const customerStats: CustomerStats = {
          totalCustomers: enhancedCustomers.length,
          activeCustomers: enhancedCustomers.filter((c: User) => c.isActive).length,
          trustedCustomers: enhancedCustomers.filter((c: User) => c.customerTags?.includes('trusted')).length,
          dailyCustomers: enhancedCustomers.filter((c: User) => 
            new Date(c.createdAt).toDateString() === new Date().toDateString()
          ).length,
          vipCustomers: enhancedCustomers.filter((c: User) => c.customerTags?.includes('vip')).length,
        };
        setStats(customerStats);
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to fetch customers');
      toast({
        title: "Error",
        description: "Failed to load customers. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateCustomerStatus = async (customerId: string, isActive: boolean) => {
    try {
      const result = await fetchWithAuth(`/users/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      
      if (result) {
        setCustomers(prev => prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, isActive }
            : customer
        ));
        
        toast({ 
          title: "Customer Updated", 
          description: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
          variant: "default"
        });
      }
    } catch (err: any) {
      toast({ 
        title: "Update Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const deleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      await fetchWithAuth(`/users/${customerId}`, { method: 'DELETE' });
      
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
      
      toast({ 
        title: "Customer Deleted", 
        description: "Customer has been permanently removed",
        variant: "default"
      });
    } catch (err: any) {
      toast({ 
        title: "Delete Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Trophy className="h-3 w-3" />;
      case 'gold': return <Star className="h-3 w-3" />;
      case 'silver': return <Star className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phoneNumber?.toLowerCase().includes(searchLower);
    
    const matchesTier = !tierFilter || customer.loyaltyTier === tierFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && customer.isActive) ||
      (statusFilter === 'inactive' && !customer.isActive);
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  if (loading && customers.length === 0 && !error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <DashboardHeader
        title="Customer Management"
        description="Manage customers, track loyalty points, and view customer insights."
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-lg font-bold text-blue-600">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-600">Active</p>
                  <p className="text-lg font-bold text-green-600">{stats.activeCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-600">Trusted</p>
                  <p className="text-lg font-bold text-yellow-600">{stats.trustedCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-600">Today</p>
                  <p className="text-lg font-bold text-purple-600">{stats.dailyCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-gray-600">VIP</p>
                  <p className="text-lg font-bold text-red-600">{stats.vipCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customers ({filteredCustomers.length})
            </CardTitle>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchCustomers} className="mt-4">Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">ID: {customer.id.slice(-8)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                          {customer.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{customer.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTierColor(customer.loyaltyTier || 'bronze')} flex items-center gap-1 w-fit`}>
                          {getTierIcon(customer.loyaltyTier || 'bronze')}
                          <span className="capitalize">{customer.loyaltyTier || 'Bronze'}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div>Orders: {customer.totalOrders || 0}</div>
                          <div>Spent: ₹{customer.totalSpent || 0}</div>
                          <div>Points: {customer.loyaltyPoints || 0}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {customer.customerTags?.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.isActive ? "default" : "secondary"}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCustomerStatus(customer.id, !customer.isActive)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
