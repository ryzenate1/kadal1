"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Gift, Star, Zap, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import MobileLoyaltyPage from "./mobile-page";

// Custom hook for media queries
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      setMatches(media.matches);
      
      const listener = (e: MediaQueryListEvent) => {
        setMatches(e.matches);
      };
      
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    return undefined;
  }, [query]);

  return matches;
};

// Types for loyalty data
type LoyaltyInfo = {
  id: string;
  name: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  nextTier: string | null;
  pointsToNextTier: number;
  progressPercentage: number;
};

type LoyaltyActivity = {
  id: string;
  points: number;
  type: string;
  description: string;
  createdAt: string;
};

type LoyaltyOrder = {
  id: string;
  totalAmount: number;
  pointsEarned: number;
  createdAt: string;
  status: string;
};

export default function LoyaltyPage() {
  const { user } = useAuth();
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [activities, setActivities] = useState<LoyaltyActivity[]>([]);
  const [orders, setOrders] = useState<LoyaltyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activities' | 'orders'>('activities');
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Handle hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    if (!user) {
      setLoading(false);
      setError("Please login to view your loyalty points");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Mock loyalty data for development
      const mockLoyaltyInfo: LoyaltyInfo = {
        id: "1",
        name: user.name || "Customer",
        loyaltyPoints: 1250,
        loyaltyTier: "Silver",
        nextTier: "Gold",
        pointsToNextTier: 750,
        progressPercentage: 62.5
      };
      
      const mockActivities: LoyaltyActivity[] = [
        {
          id: "1",
          points: 150,
          type: "ORDER",
          description: "Points earned from order #12345",
          createdAt: "2025-05-20T10:30:00Z"
        },
        {
          id: "2",
          points: 100,
          type: "REFERRAL",
          description: "Referral bonus",
          createdAt: "2025-05-15T14:20:00Z"
        },
        {
          id: "3",
          points: 200,
          type: "ORDER",
          description: "Points earned from order #12340",
          createdAt: "2025-05-10T09:15:00Z"
        }
      ];
      
      const mockOrders: LoyaltyOrder[] = [
        {
          id: "12345",
          totalAmount: 1500,
          pointsEarned: 150,
          createdAt: "2025-05-20T10:30:00Z",
          status: "DELIVERED"
        },
        {
          id: "12340",
          totalAmount: 2000,
          pointsEarned: 200,
          createdAt: "2025-05-10T09:15:00Z",
          status: "DELIVERED"
        }
      ];
      
      // Use mock data for now
      setLoyaltyInfo(mockLoyaltyInfo);
      setActivities(mockActivities);
      setOrders(mockOrders);
      
      // Uncomment these when API is ready
      // const infoData = await api.get('/loyalty/info');
      // setLoyaltyInfo(infoData);
      // const activityData = await api.get('/loyalty/activity');
      // setActivities(activityData.activities || []);
      // setOrders(activityData.orders || []);
      
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      setError("Failed to load loyalty data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (loading) {
    return (
      <AccountLayout 
        title="Loyalty Points" 
        description="Earn points with every order and get rewards"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AccountLayout>
    );
  }

  if (error) {
    return (
      <AccountLayout 
        title="Loyalty Points" 
        description="Earn points with every order and get rewards"
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <Award className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{error}</h3>
            <Button 
              className="mt-6"
              onClick={fetchLoyaltyData}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </AccountLayout>
    );
  }

  // If not mounted yet, return null to prevent hydration errors
  if (!isMounted) return null;
  
  // Render mobile layout on small screens
  if (isMobile) {
    return (
      <MobileLoyaltyPage 
        loyaltyInfo={loyaltyInfo}
        activities={activities}
        orders={orders}
        loading={loading}
        error={error}
      />
    );
  }
  
  return (
    <AccountLayout 
      title="Loyalty Points" 
      description="Earn points with every order and get rewards"
    >
      <div className="space-y-6">
        {/* Loyalty Status Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{loyaltyInfo?.loyaltyPoints || 0} Points</h2>
                  <p className="opacity-90">{loyaltyInfo?.loyaltyTier || "Bronze"} Member</p>
                </div>
              </div>
              
              {loyaltyInfo?.nextTier && (
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm mb-1">Next Tier: {loyaltyInfo.nextTier}</p>
                  <div className="w-full bg-white/20 rounded-full h-2.5 mb-1">
                    <div 
                      className="bg-white h-2.5 rounded-full" 
                      style={{ width: `${loyaltyInfo.progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs opacity-80">{loyaltyInfo.pointsToNextTier} more points needed</p>
                </div>
              )}
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Gift className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-500">Rewards</p>
                <p className="font-medium">3 Available</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Star className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                <p className="text-sm text-gray-500">Current Tier</p>
                <p className="font-medium">{loyaltyInfo?.loyaltyTier || "Bronze"}</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Zap className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-500">Earning Rate</p>
                <p className="font-medium">10% of Order</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Award className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-500">Total Earned</p>
                <p className="font-medium">{loyaltyInfo?.loyaltyPoints || 0} Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Loyalty History */}
        <Card>
          <CardHeader>
            <CardTitle>Loyalty History</CardTitle>
            <div className="flex mt-2 space-x-2">
              <Button 
                variant={activeTab === 'activities' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveTab('activities')}
                className={activeTab === 'activities' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                Activities
              </Button>
              <Button 
                variant={activeTab === 'orders' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveTab('orders')}
                className={activeTab === 'orders' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                Orders
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {activeTab === 'activities' ? (
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(activity.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+{activity.points} Points</p>
                        <p className="text-xs text-gray-500">{activity.type}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No activities found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+{order.pointsEarned} Points</p>
                        <p className="text-xs text-gray-500">₹{order.totalAmount}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AccountLayout>
  );
}
