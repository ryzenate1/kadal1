"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Loader2, 
  Search, 
  Lock, 
  UserCheck, 
  MapPin, 
  Calendar,
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

// Define activity types
const ACTIVITY_TYPES = [
  'login',
  'password_change',
  'name_change',
  'address_update',
  'profile_update',
  'order_placed',
  'logout'
];

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  activityType: typeof ACTIVITY_TYPES[number];
  details: string;
  ipAddress: string;
  timestamp: string;
  location?: string;
}

export default function UserActivityPage() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Function to fetch user activities
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be an API call
      // For now, we'll simulate the API response with mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock user activity data
      const mockActivities: UserActivity[] = [
        {
          id: '1',
          userId: 'USR001',
          userName: 'Ravi Kumar',
          userEmail: 'ravi@example.com',
          activityType: 'login',
          details: 'User logged in successfully',
          ipAddress: '192.168.1.1',
          timestamp: new Date().toISOString(),
          location: 'Chennai, Tamil Nadu'
        },
        {
          id: '2',
          userId: 'USR002',
          userName: 'Priya Sharma',
          userEmail: 'priya@example.com',
          activityType: 'password_change',
          details: 'User changed their password',
          ipAddress: '192.168.1.2',
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
          location: 'Mumbai, Maharashtra'
        },
        {
          id: '3',
          userId: 'USR003',
          userName: 'Ajith M',
          userEmail: 'ajith@example.com',
          activityType: 'name_change',
          details: 'Name updated from "Ajith" to "Ajith M"',
          ipAddress: '192.168.1.3',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          location: 'Coimbatore, Tamil Nadu'
        },
        {
          id: '4',
          userId: 'USR001',
          userName: 'Ravi Kumar',
          userEmail: 'ravi@example.com',
          activityType: 'address_update',
          details: 'Added new delivery address: "Office"',
          ipAddress: '192.168.1.4',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          location: 'Chennai, Tamil Nadu'
        },
        {
          id: '5',
          userId: 'USR004',
          userName: 'Karthi Selvam',
          userEmail: 'karthi@example.com',
          activityType: 'profile_update',
          details: 'Updated mobile number',
          ipAddress: '192.168.1.5',
          timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          location: 'Madurai, Tamil Nadu'
        },
        {
          id: '6',
          userId: 'USR002',
          userName: 'Priya Sharma',
          userEmail: 'priya@example.com',
          activityType: 'login',
          details: 'User logged in successfully',
          ipAddress: '192.168.1.6',
          timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
          location: 'Mumbai, Maharashtra'
        },
        {
          id: '7',
          userId: 'USR005',
          userName: 'Arun Vijay',
          userEmail: 'arun@example.com',
          activityType: 'order_placed',
          details: 'Placed order #ORD12345',
          ipAddress: '192.168.1.7',
          timestamp: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
          location: 'Trichy, Tamil Nadu'
        },
        {
          id: '8',
          userId: 'USR003',
          userName: 'Ajith M',
          userEmail: 'ajith@example.com',
          activityType: 'logout',
          details: 'User logged out',
          ipAddress: '192.168.1.8',
          timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
          location: 'Coimbatore, Tamil Nadu'
        },
        {
          id: '9',
          userId: 'USR001',
          userName: 'Ravi Kumar',
          userEmail: 'ravi@example.com',
          activityType: 'profile_update',
          details: 'Updated profile picture',
          ipAddress: '192.168.1.9',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
          location: 'Chennai, Tamil Nadu'
        },
        {
          id: '10',
          userId: 'USR006',
          userName: 'Deepa Nair',
          userEmail: 'deepa@example.com',
          activityType: 'login',
          details: 'User logged in successfully',
          ipAddress: '192.168.1.10',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 48 hours ago
          location: 'Kochi, Kerala'
        }
      ];
      
      setActivities(mockActivities);
      
    } catch (err: any) {
      setError(err.message);
      toast({ 
        title: "Error Fetching Activities", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);
  
  const getActivityTypeIcon = (activityType: string) => {
    switch (activityType) {
      case 'login': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'password_change': return <Lock className="h-4 w-4 text-blue-500" />;
      case 'name_change': return <UserCheck className="h-4 w-4 text-purple-500" />;
      case 'address_update': return <MapPin className="h-4 w-4 text-red-500" />;
      case 'profile_update': return <UserCheck className="h-4 w-4 text-orange-500" />;
      case 'order_placed': return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'logout': return <UserCheck className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getActivityTypeBadgeColor = (activityType: string) => {
    switch (activityType) {
      case 'login': return 'bg-green-100 text-green-800 border-green-200';
      case 'password_change': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'name_change': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'address_update': return 'bg-red-100 text-red-800 border-red-200';
      case 'profile_update': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'order_placed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'logout': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const formatActivityTime = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);
      
      if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return format(date, 'dd MMM yyyy, HH:mm');
      }
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Filter activities based on search term, activity type, and time range
  const filteredActivities = activities
    .filter(activity => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        activity.userName.toLowerCase().includes(searchLower) ||
        activity.userEmail.toLowerCase().includes(searchLower) ||
        activity.details.toLowerCase().includes(searchLower) ||
        (activity.location && activity.location.toLowerCase().includes(searchLower))
      );
    })
    .filter(activity => {
      if (!activityFilter || activityFilter === 'all') return true;
      return activity.activityType === activityFilter;
    })
    .filter(activity => {
      const activityTime = new Date(activity.timestamp).getTime();
      const now = new Date().getTime();
      
      switch (timeRange) {
        case '1h': return (now - activityTime) <= 3600000;
        case '6h': return (now - activityTime) <= 21600000;
        case '12h': return (now - activityTime) <= 43200000;
        case '24h': return (now - activityTime) <= 86400000;
        case '7d': return (now - activityTime) <= 604800000;
        case '30d': return (now - activityTime) <= 2592000000;
        default: return true;
      }
    });
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <DashboardHeader
          title="User Activity Monitoring"
          description="Track and monitor user activity across the platform"
        />
      </motion.div>

      {/* Activity Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Login Events</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.activityType === 'login').length}
              </div>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Password Changes</CardTitle>
              <Lock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {activities.filter(a => a.activityType === 'password_change').length}
              </div>
              <p className="text-xs text-gray-500">Security events</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Profile Updates</CardTitle>
              <UserCheck className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {activities.filter(a => a.activityType === 'profile_update' || a.activityType === 'name_change').length}
              </div>
              <p className="text-xs text-gray-500">Information changes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Address Updates</CardTitle>
              <MapPin className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {activities.filter(a => a.activityType === 'address_update').length}
              </div>
              <p className="text-xs text-gray-500">Delivery location changes</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Search className="h-5 w-5 mr-2 text-red-500" />
            Activity Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <Input
                placeholder="Search by user, email, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-200 focus:border-red-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Activity Type</label>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="border-gray-200 focus:border-red-500">
                  <SelectValue placeholder="All activities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="password_change">Password Change</SelectItem>
                  <SelectItem value="name_change">Name Change</SelectItem>
                  <SelectItem value="address_update">Address Update</SelectItem>
                  <SelectItem value="profile_update">Profile Update</SelectItem>
                  <SelectItem value="order_placed">Order Placed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="border-gray-200 focus:border-red-500">
                  <SelectValue placeholder="Last 24 hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="12h">Last 12 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Actions</label>
              <Button onClick={fetchActivities} className="w-full bg-red-600 hover:bg-red-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Activities
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
              <AlertTriangle size={20} className="mr-2" /> Error Loading Activities
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
          <span className="ml-2 text-gray-600">Loading activity data...</span>
        </div>
      )}

      {/* Activities Table */}
      {!loading && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center text-gray-800">
                <Clock className="h-5 w-5 mr-2 text-red-500" />
                Activity Log ({filteredActivities.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id} className="hover:bg-gray-50">
                      <TableCell className="whitespace-nowrap">
                        {formatActivityTime(activity.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{activity.userName}</div>
                          <div className="text-xs text-gray-500">{activity.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`flex items-center space-x-1 ${getActivityTypeBadgeColor(activity.activityType)}`}
                        >
                          {getActivityTypeIcon(activity.activityType)}
                          <span className="ml-1">
                            {activity.activityType.replace('_', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[200px] truncate" title={activity.details}>
                          {activity.details}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm" title={activity.location}>
                          {activity.location || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {activity.ipAddress}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedActivity(activity);
                            setIsDetailModalOpen(true);
                          }}
                          className="border-red-200 hover:bg-red-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredActivities.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No activities found matching your criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Detail Modal */}
      {isDetailModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Activity Type</h3>
                    <p className="font-medium flex items-center mt-1">
                      {getActivityTypeIcon(selectedActivity.activityType)}
                      <span className="ml-2 capitalize">{selectedActivity.activityType.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
                    <p className="font-medium mt-1">{format(parseISO(selectedActivity.timestamp), 'PPpp')}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">User</h3>
                  <div className="mt-1">
                    <p className="font-medium">{selectedActivity.userName}</p>
                    <p className="text-sm text-gray-500">{selectedActivity.userEmail}</p>
                    <p className="text-sm text-gray-500">ID: {selectedActivity.userId}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Details</h3>
                  <p className="mt-1">{selectedActivity.details}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">IP Address</h3>
                    <p className="font-mono mt-1">{selectedActivity.ipAddress}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1">{selectedActivity.location || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
} 