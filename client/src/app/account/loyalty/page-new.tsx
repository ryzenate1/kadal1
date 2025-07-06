"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Award, 
  Star, 
  ArrowLeft,
  Gift,
  TrendingUp,
  Clock,
  ShoppingBag,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LoyaltyActivity {
  id: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  createdAt: string;
  orderId?: string;
}

interface LoyaltyTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  color: string;
}

const loyaltyTiers: LoyaltyTier[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    benefits: ['1 point per ₹20 spent', 'Birthday discount'],
    color: 'bg-orange-100 text-orange-800'
  },
  {
    name: 'Silver',
    minPoints: 500,
    maxPoints: 1499,
    benefits: ['1.5 points per ₹20 spent', 'Free delivery on orders ₹500+', 'Early access to sales'],
    color: 'bg-gray-100 text-gray-800'
  },
  {
    name: 'Gold',
    minPoints: 1500,
    maxPoints: 2999,
    benefits: ['2 points per ₹20 spent', 'Free delivery on all orders', 'Priority customer support'],
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    name: 'Platinum',
    minPoints: 3000,
    maxPoints: 9999,
    benefits: ['3 points per ₹20 spent', 'Exclusive products', 'Personal shopper service'],
    color: 'bg-purple-100 text-purple-800'
  }
];

export default function LoyaltyPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState({
    currentPoints: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    currentTier: 'Bronze',
    nextTier: 'Silver',
    pointsToNextTier: 500
  });
  const [activities, setActivities] = useState<LoyaltyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/loyalty');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch loyalty data
  const fetchLoyaltyData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/loyalty');
      if (response.ok) {
        const data = await response.json();
        setLoyaltyData(data.summary);
        setActivities(data.activities);
      } else {
        throw new Error('Failed to fetch loyalty data');
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      // Mock data for development
      const mockData = {
        currentPoints: 750,
        totalEarned: 1250,
        totalRedeemed: 500,
        currentTier: 'Silver',
        nextTier: 'Gold',
        pointsToNextTier: 750
      };

      const mockActivities: LoyaltyActivity[] = [
        {
          id: "la_001",
          type: "earned",
          points: 45,
          description: "Points earned from order #KT2025001",
          createdAt: "2025-06-10T15:45:00Z",
          orderId: "ord_001"
        },
        {
          id: "la_002",
          type: "redeemed",
          points: -100,
          description: "Redeemed for ₹10 discount",
          createdAt: "2025-06-05T12:30:00Z"
        },
        {
          id: "la_003",
          type: "earned",
          points: 65,
          description: "Points earned from order #KT2025002",
          createdAt: "2025-06-15T11:20:00Z",
          orderId: "ord_002"
        },
        {
          id: "la_004",
          type: "earned",
          points: 20,
          description: "Birthday bonus points",
          createdAt: "2025-06-01T00:00:00Z"
        }
      ];

      setLoyaltyData(mockData);
      setActivities(mockActivities);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLoyaltyData();
    }
  }, [isAuthenticated]);

  // Get current tier info
  const getCurrentTier = () => {
    return loyaltyTiers.find(tier => tier.name === loyaltyData.currentTier) || loyaltyTiers[0];
  };

  // Get next tier info
  const getNextTier = () => {
    const currentTierIndex = loyaltyTiers.findIndex(tier => tier.name === loyaltyData.currentTier);
    return currentTierIndex < loyaltyTiers.length - 1 ? loyaltyTiers[currentTierIndex + 1] : null;
  };

  // Calculate progress to next tier
  const getProgressToNextTier = () => {
    const currentTier = getCurrentTier();
    const nextTier = getNextTier();
    
    if (!nextTier) return 100; // Already at highest tier
    
    const progress = ((loyaltyData.currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle redeem points
  const handleRedeemPoints = async (points: number) => {
    if (points > loyaltyData.currentPoints) {
      toast.error("Insufficient points");
      return;
    }

    try {
      const response = await fetch('/api/user/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points })
      });

      if (response.ok) {
        toast.success(`Successfully redeemed ${points} points!`);
        fetchLoyaltyData(); // Refresh data
      } else {
        throw new Error('Failed to redeem points');
      }
    } catch (error) {
      console.error('Redeem error:', error);
      toast.error("Failed to redeem points");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progress = getProgressToNextTier();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loyalty Points</h1>
            <p className="text-gray-600">Track and redeem your reward points</p>
          </div>
        </div>

        {/* Points Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-red-600" />
              <span>Your Points Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {loyaltyData.currentPoints}
              </div>
              <p className="text-gray-600">Available Points</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{loyaltyData.totalEarned}</div>
                <div className="text-sm text-gray-600">Total Earned</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{loyaltyData.totalRedeemed}</div>
                <div className="text-sm text-gray-600">Total Redeemed</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">₹{Math.floor(loyaltyData.currentPoints / 10)}</div>
                <div className="text-sm text-gray-600">Cash Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Tier & Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Membership Tier</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Badge className={currentTier.color}>
                {currentTier.name} Member
              </Badge>
              {nextTier && (
                <span className="text-sm text-gray-600">
                  {loyaltyData.pointsToNextTier} points to {nextTier.name}
                </span>
              )}
            </div>            {nextTier && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Your Benefits:</h4>
              <ul className="space-y-1">
                {currentTier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Redeem Points */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-600" />
              <span>Redeem Points</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-lg font-bold text-gray-900 mb-2">₹5 Discount</div>
                <div className="text-sm text-gray-600 mb-3">50 Points</div>
                <Button
                  size="sm"
                  disabled={loyaltyData.currentPoints < 50}
                  onClick={() => handleRedeemPoints(50)}
                  className="w-full"
                >
                  Redeem
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <div className="text-lg font-bold text-gray-900 mb-2">₹10 Discount</div>
                <div className="text-sm text-gray-600 mb-3">100 Points</div>
                <Button
                  size="sm"
                  disabled={loyaltyData.currentPoints < 100}
                  onClick={() => handleRedeemPoints(100)}
                  className="w-full"
                >
                  Redeem
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg text-center">
                <div className="text-lg font-bold text-gray-900 mb-2">₹25 Discount</div>
                <div className="text-sm text-gray-600 mb-3">250 Points</div>
                <Button
                  size="sm"
                  disabled={loyaltyData.currentPoints < 250}
                  onClick={() => handleRedeemPoints(250)}
                  className="w-full"
                >
                  Redeem
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Points History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-600">Your points activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'earned' ? 'bg-green-100' :
                        activity.type === 'redeemed' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {activity.type === 'earned' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : activity.type === 'redeemed' ? (
                          <Gift className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-600">{formatDate(activity.createdAt)}</p>
                      </div>
                    </div>
                    <div className={`text-right ${
                      activity.type === 'earned' ? 'text-green-600' :
                      activity.type === 'redeemed' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <div className="font-bold">
                        {activity.type === 'redeemed' ? '' : '+'}{activity.points}
                      </div>
                      <div className="text-xs">points</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
