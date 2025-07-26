"use client";

import { useEffect, useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Eye, Loader2, Search, Edit2, UserPlus, Star, Crown, Users, Trophy, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const SERVER_API_URL = 'http://localhost:5001/api';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  customerTags?: string[];
  isActive?: boolean;
  joinedDate?: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  trustedCustomers: number;
  dailyCustomers: number;
  vipCustomers: number;
}

const customerTags = ["trusted", "daily-customer", "vip", "new", "inactive", "high-value"];
const loyaltyTiers = ["bronze", "silver", "gold", "platinum"];
const userRoles = ["admin", "customer", "moderator"];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_API_URL}/users`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: `Error fetching users: ${res.statusText}` }));
        throw new Error(errData.message);
      }
      const data: User[] = await res.json();
      
      // Enhance user data with mock loyalty and customer insights
      const enhancedUsers = data.map(user => ({
        ...user,
        loyaltyPoints: Math.floor(Math.random() * 500) + 50,
        loyaltyTier: loyaltyTiers[Math.floor(Math.random() * loyaltyTiers.length)],
        totalOrders: Math.floor(Math.random() * 20) + 1,
        totalSpent: Math.floor(Math.random() * 5000) + 200,
        lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customerTags: Math.random() > 0.5 ? [customerTags[Math.floor(Math.random() * customerTags.length)]] : [],
        isActive: Math.random() > 0.2,
        joinedDate: user.createdAt
      }));
      
      setUsers(enhancedUsers);
      
      // Calculate stats
      const customerStats: CustomerStats = {
        totalCustomers: enhancedUsers.filter(u => u.role === 'customer').length,
        activeCustomers: enhancedUsers.filter(u => u.role === 'customer' && u.isActive).length,
        trustedCustomers: enhancedUsers.filter(u => u.customerTags?.includes('trusted')).length,
        dailyCustomers: enhancedUsers.filter(u => u.customerTags?.includes('daily-customer')).length,
        vipCustomers: enhancedUsers.filter(u => u.customerTags?.includes('vip')).length
      };
      setStats(customerStats);
      
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error Fetching Users", description: err.message, variant: "destructive" });
      
      // Mock data for demonstration
      const mockUsers: User[] = [
        {
          id: 'USR001',
          name: 'Ravi Kumar',
          email: 'ravi@example.com',
          phoneNumber: '+91 9876543210',
          role: 'customer',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          loyaltyPoints: 450,
          loyaltyTier: 'gold',
          totalOrders: 15,
          totalSpent: 3200,
          lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerTags: ['trusted', 'daily-customer'],
          isActive: true,
          joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'USR002',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phoneNumber: '+91 9876543211',
          role: 'customer',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          loyaltyPoints: 280,
          loyaltyTier: 'silver',
          totalOrders: 8,
          totalSpent: 1800,
          lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerTags: ['trusted'],
          isActive: true,
          joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          id: 'USR003',
          name: 'Ajith M',
          email: 'ajith@example.com',
          phoneNumber: '+91 9876543212',
          role: 'customer',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          loyaltyPoints: 150,
          loyaltyTier: 'bronze',
          totalOrders: 3,
          totalSpent: 650,
          lastOrderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerTags: ['new'],
          isActive: true,
          joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
      setUsers(mockUsers);
      
      const mockStats: CustomerStats = {
        totalCustomers: 3,
        activeCustomers: 3,
        trustedCustomers: 2,
        dailyCustomers: 1,
        vipCustomers: 0
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUserTags = async (userId: string, newTags: string[]) => {
    try {
      const res = await fetch(`${SERVER_API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerTags: newTags })
      });
      
      if (!res.ok) throw new Error('Failed to update user tags');
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, customerTags: newTags } : user
      ));
      
      toast({ 
        title: "Tags Updated", 
        description: "Customer tags have been updated successfully",
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

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setEditingTags(user.customerTags || []);
    setIsDetailModalOpen(true);
  };

  const handleTagToggle = (tag: string) => {
    setEditingTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const saveUserTags = () => {
    if (selectedUser) {
      updateUserTags(selectedUser.id, editingTags);
      setIsDetailModalOpen(false);
    }
  };

  const handleEditRoleClick = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (!editingUser || !selectedRole || selectedRole === editingUser.role) {
      setIsRoleModalOpen(false);
      toast({title: "No change", description: "User role is already set to this value."}) 
      return;
    }
    setIsUpdatingRole(true);
    try {
      const res = await fetch(`${SERVER_API_URL}/users/${editingUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: `Failed to update role: ${res.statusText}`}));
        throw new Error(errData.message);
      }
      const updatedUser = await res.json();
      setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      toast({ title: "User Role Updated", description: `${editingUser.name}'s role changed to ${updatedUser.role}.` });
      setIsRoleModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      toast({ title: "Role Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'trusted': return 'bg-green-100 text-green-800 border-green-200';
      case 'daily-customer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'high-value': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'new': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Trophy className="h-4 w-4 text-amber-600" />;
      case 'silver': return <Trophy className="h-4 w-4 text-gray-400" />;
      case 'gold': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'platinum': return <Crown className="h-4 w-4 text-purple-500" />;
      default: return <Star className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredUsers = users
    .filter(user => 
      roleFilter === "all" || !roleFilter ? true : user.role === roleFilter
    )
    .filter(user => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phoneNumber.includes(searchTerm)
      );
    })
    .filter(user => {
      if (!tagFilter || tagFilter === "all") return true;
      return user.customerTags?.includes(tagFilter);
    });

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <DashboardHeader
        title="Customer Management"
        description="Manage customer accounts, roles, and loyalty information"
      />

      {/* Customer Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalCustomers}</div>
              <p className="text-xs text-gray-500">All registered customers</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Customers</CardTitle>
              <Star className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
              <p className="text-xs text-gray-500">Currently active</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Trusted Customers</CardTitle>
              <Trophy className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.trustedCustomers}</div>
              <p className="text-xs text-gray-500">Verified trusted</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Daily Customers</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.dailyCustomers}</div>
              <p className="text-xs text-gray-500">Daily regular buyers</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">VIP Customers</CardTitle>
              <Crown className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.vipCustomers}</div>
              <p className="text-xs text-gray-500">Premium members</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Search className="h-5 w-5 mr-2 text-red-500" />
            Customer Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-200 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Role Filter</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="border-gray-200 focus:border-red-500">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tag Filter</label>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="border-gray-200 focus:border-red-500">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {customerTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Actions</label>
              <Button onClick={fetchUsers} className="w-full bg-red-600 hover:bg-red-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Refresh Users
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 border-red-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle size={20} className="mr-2" /> Error Loading Users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-600">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          <span className="ml-2 text-gray-600">Loading customers...</span>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center text-gray-800">
                <Users className="h-5 w-5 mr-2 text-red-500" />
                Customer List ({filteredUsers.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Loyalty Tier</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' :
                            user.role === 'moderator' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.loyaltyTier && (
                          <div className="flex items-center space-x-2">
                            {getTierIcon(user.loyaltyTier)}
                            <span className="text-sm font-medium capitalize">{user.loyaltyTier}</span>
                            <span className="text-xs text-gray-500">({user.loyaltyPoints} pts)</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.customerTags?.map(tag => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className={`text-xs ${getTagColor(tag)}`}
                            >
                              {tag.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{user.totalOrders || 0}</div>
                          <div className="text-gray-500">orders</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">₹{user.totalSpent || 0}</div>
                          <div className="text-gray-500">total</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.isActive
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUserDetail(user)}
                            className="border-red-200 hover:bg-red-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRoleClick(user)}
                            className="border-blue-200 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No customers found matching your criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-red-500" />
              Customer Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900">{selectedUser.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <Badge className="bg-blue-100 text-blue-800">{selectedUser.role}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loyalty Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    {getTierIcon(selectedUser.loyaltyTier || '')}
                    <span className="ml-2">Loyalty Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Loyalty Points</label>
                      <p className="text-lg font-bold text-red-600">{selectedUser.loyaltyPoints || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tier</label>
                      <p className="text-sm font-medium capitalize">{selectedUser.loyaltyTier || 'Bronze'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Orders</label>
                      <p className="text-sm font-medium">{selectedUser.totalOrders || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Spent</label>
                      <p className="text-sm font-medium">₹{selectedUser.totalSpent || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {customerTags.map(tag => (
                        <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingTags.includes(tag)}
                            onChange={() => handleTagToggle(tag)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
                            {tag.replace('-', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveUserTags} className="bg-red-600 hover:bg-red-700">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Edit Modal */}
      {isRoleModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit User Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{editingUser.name}</p>
                  <p className="text-xs text-gray-500">{editingUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Role</label>
                  <Badge className="ml-2">{editingUser.role}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">New Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map(role => (
                        <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={() => { setIsRoleModalOpen(false); setEditingUser(null);}} disabled={isUpdatingRole}>
                    Cancel
                  </Button>
                  <Button onClick={handleRoleUpdate} disabled={isUpdatingRole || selectedRole === editingUser.role}>
                    {isUpdatingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Role"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
