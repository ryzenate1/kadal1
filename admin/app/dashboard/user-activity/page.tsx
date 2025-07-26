"use client";

import { useEffect, useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, User, ShoppingCart, LogIn, LogOut, 
  Settings, Edit, Trash2, UserPlus, Lock,
  Clock, Search, Filter, Calendar, AlertTriangle, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/apiUtils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  resourceType: string;
  resourceId?: string;
  metadata?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}

const actionIcons: Record<string, any> = {
  'LOGIN': LogIn,
  'LOGOUT': LogOut,
  'ORDER': ShoppingCart,
  'PROFILE_UPDATE': Edit,
  'PASSWORD_CHANGE': Lock,
  'ACCOUNT_CREATED': UserPlus,
  'PRODUCT_VIEW': Activity,
  'CART_UPDATE': ShoppingCart,
  'ADDRESS_UPDATE': Settings,
  'ADMIN_ACTION': Settings,
  'DEFAULT': Activity
};

const actionColors: Record<string, string> = {
  'LOGIN': 'bg-green-100 text-green-800',
  'LOGOUT': 'bg-gray-100 text-gray-800',
  'ORDER': 'bg-blue-100 text-blue-800',
  'PROFILE_UPDATE': 'bg-yellow-100 text-yellow-800',
  'PASSWORD_CHANGE': 'bg-red-100 text-red-800',
  'ACCOUNT_CREATED': 'bg-purple-100 text-purple-800',
  'PRODUCT_VIEW': 'bg-indigo-100 text-indigo-800',
  'CART_UPDATE': 'bg-orange-100 text-orange-800',
  'ADDRESS_UPDATE': 'bg-teal-100 text-teal-800',
  'ADMIN_ACTION': 'bg-pink-100 text-pink-800',
  'DEFAULT': 'bg-gray-100 text-gray-800'
};

export default function UserActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        action: actionFilter === 'all' ? '' : actionFilter,
        dateFilter
      });

      const data = await fetchWithAuth(`/user-activity?${params.toString()}`);
      
      if (data) {
        setActivities(data.activities || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Error loading user activities:', err);
      setError(err.message || 'Failed to load user activities');
      toast({
        title: "Error Loading Activities",
        description: err.message || "Failed to load user activity data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, actionFilter, dateFilter, toast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActionIcon = (action: string) => {
    const IconComponent = actionIcons[action] || actionIcons['DEFAULT'];
    return <IconComponent className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    return actionColors[action] || actionColors['DEFAULT'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'action') {
      setActionFilter(value);
    } else if (filter === 'date') {
      setDateFilter(value);
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <DashboardHeader
        title="User Activity Monitor"
        description="Track all user actions, logins, orders, and system interactions in real-time."
      />

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-800">
            <Filter className="h-5 w-5 mr-2 text-red-500" />
            Filter Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user name, email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Action Type</label>
              <Select value={actionFilter} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="ORDER">Orders</SelectItem>
                  <SelectItem value="PROFILE_UPDATE">Profile Updates</SelectItem>
                  <SelectItem value="PASSWORD_CHANGE">Password Changes</SelectItem>
                  <SelectItem value="ACCOUNT_CREATED">Account Creation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Time Period</label>
              <Select value={dateFilter} onValueChange={(value) => handleFilterChange('date', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Actions</label>
              <Button onClick={fetchActivities} variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-gray-800">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-red-500" />
              Recent Activity
            </div>
            <Badge variant="secondary" className="bg-gray-100">
              {activities.length} activities
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              <span className="ml-2 text-gray-600">Loading activities...</span>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Activities</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchActivities} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && activities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Found</h3>
              <p className="text-gray-600">No user activities match your current filters.</p>
            </div>
          )}

          {!loading && !error && activities.length > 0 && (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors space-y-2 sm:space-y-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {activity.user.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.action.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {activity.user.email}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {activity.resourceType && (
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {activity.resourceType}
                        {activity.resourceId && ` #${activity.resourceId.slice(-6)}`}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
