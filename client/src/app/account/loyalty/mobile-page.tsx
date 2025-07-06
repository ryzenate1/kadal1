"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Gift, Star, Zap, Loader2, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Mock data for development
const mockLoyaltyInfo: LoyaltyInfo = {
  id: "1",
  name: "Test User",
  loyaltyPoints: 850,
  loyaltyTier: "Silver",
  nextTier: "Gold",
  pointsToNextTier: 150,
  progressPercentage: 85
};

const mockActivities: LoyaltyActivity[] = [
  {
    id: "act1",
    points: 50,
    type: "earned",
    description: "Order #12345 completed",
    createdAt: "2025-05-20T10:30:00Z"
  },
  {
    id: "act2",
    points: 100,
    type: "earned",
    description: "First order bonus",
    createdAt: "2025-05-15T14:20:00Z"
  },
  {
    id: "act3",
    points: -25,
    type: "redeemed",
    description: "Discount coupon redeemed",
    createdAt: "2025-05-10T09:15:00Z"
  }
];

const mockOrders: LoyaltyOrder[] = [
  {
    id: "ord1",
    totalAmount: 1250,
    pointsEarned: 50,
    createdAt: "2025-05-20T10:30:00Z",
    status: "Delivered"
  },
  {
    id: "ord2",
    totalAmount: 2500,
    pointsEarned: 100,
    createdAt: "2025-05-15T14:20:00Z",
    status: "Delivered"
  }
];

interface MobileLoyaltyPageProps {
  loyaltyInfo?: LoyaltyInfo | null;
  activities?: LoyaltyActivity[];
  orders?: LoyaltyOrder[];
  loading?: boolean;
  error?: string | null;
}

export default function MobileLoyaltyPage({
  loyaltyInfo: propLoyaltyInfo,
  activities: propActivities,
  orders: propOrders,
  loading: propLoading,
  error: propError
}: MobileLoyaltyPageProps = {}) {
  const { user } = useAuth();
  
  // Use props if provided, otherwise use local state
  const [localLoyaltyInfo, setLocalLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [localActivities, setLocalActivities] = useState<LoyaltyActivity[]>([]);
  const [localOrders, setLocalOrders] = useState<LoyaltyOrder[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activities' | 'orders'>('activities');
  
  // Determine whether to use props or local state
  const loyaltyInfo = propLoyaltyInfo !== undefined ? propLoyaltyInfo : localLoyaltyInfo;
  const activities = propActivities || localActivities;
  const orders = propOrders || localOrders;
  const loading = propLoading !== undefined ? propLoading : localLoading;
  const error = propError !== undefined ? propError : localError;

  // Fetch loyalty data
  const fetchLoyaltyData = async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      
      // In a real app, you would fetch data from API
      // For now, we'll use mock data
      setTimeout(() => {
        setLocalLoyaltyInfo(mockLoyaltyInfo);
        setLocalActivities(mockActivities);
        setLocalOrders(mockOrders);
        setLocalError(null);
        setLocalLoading(false);
      }, 1000);
    } catch (err) {
      setLocalError('Failed to load loyalty data. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  // Get tier color based on loyalty tier
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'bg-amber-700';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Back Button */}
      <div className="mb-4">
        <BackButton href="/account" label="Back to Account" />
      </div>
      
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Program</h1>
        <p className="text-gray-500 mt-1">Earn and redeem points with every purchase</p>
      </motion.div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-tendercuts-red animate-spin mb-4" />
          <p className="text-gray-500">Loading loyalty information...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button 
              className="mt-4 bg-tendercuts-red hover:bg-tendercuts-red-dark"
              onClick={fetchLoyaltyData}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Loyalty Card */}
          {loyaltyInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-600 to-tendercuts-red">
                <CardContent className="p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium opacity-90">Loyalty Points</h3>
                      <p className="text-3xl font-bold">{loyaltyInfo.loyaltyPoints}</p>
                    </div>
                    <div className={`${getTierColor(loyaltyInfo.loyaltyTier)} rounded-full px-3 py-1 text-white text-sm font-medium`}>
                      {loyaltyInfo.loyaltyTier} Tier
                    </div>
                  </div>
                  
                  {loyaltyInfo.nextTier && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress to {loyaltyInfo.nextTier}</span>
                        <span>{loyaltyInfo.pointsToNextTier} points to go</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2.5">
                        <div 
                          className="bg-white h-2.5 rounded-full" 
                          style={{ width: `${loyaltyInfo.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Tabs for Activities and Orders */}
          <Tabs defaultValue="activities" value={activeTab} onValueChange={(value) => setActiveTab(value as 'activities' | 'orders')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="orders">Points History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activities" className="mt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <motion.div key={activity.id} variants={itemVariants}>
                      <Card className="overflow-hidden border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <div className={`p-2 rounded-full mr-3 flex-shrink-0 mt-1 ${
                                activity.type === 'earned' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {activity.type === 'earned' ? (
                                  <Plus className="h-4 w-4" />
                                ) : (
                                  <Minus className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{activity.description}</p>
                                <p className="text-sm text-gray-500">{formatDate(activity.createdAt)}</p>
                              </div>
                            </div>
                            <span className={`font-bold ${
                              activity.type === 'earned' ? 'text-green-600' : 'text-blue-600'
                            }`}>
                              {activity.type === 'earned' ? '+' : '-'}{activity.points}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="border border-gray-200">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">No activities found</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <motion.div key={order.id} variants={itemVariants}>
                      <Card className="overflow-hidden border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Order #{order.id}</p>
                              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                              <div className="mt-1 flex items-center">
                                <span className="text-sm text-gray-700">₹{order.totalAmount}</span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <span className="font-bold text-green-600">+{order.pointsEarned}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="border border-gray-200">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">No orders found</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// Helper components
const Plus = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const Minus = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
