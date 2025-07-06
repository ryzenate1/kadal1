"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrackingEvent {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
}

interface TrackingData {
  trackingNumber: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered';
  estimatedDelivery: string;
  currentLocation: string;
  events: TrackingEvent[];
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  in_transit: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  in_transit: 'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800'
};

export default function TrackingPage() {
  const router = useRouter();
  const params = useParams();
  const trackingNumber = params.trackingNumber as string;
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!trackingNumber) {
        setError("No tracking number provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Mock tracking data for demonstration
        const mockTrackingData: TrackingData = {
          trackingNumber,
          orderNumber: `KT2025${trackingNumber.slice(-3)}`,
          status: 'in_transit',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          currentLocation: 'Chennai Distribution Center',
          events: [
            {
              id: '1',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'confirmed',
              location: 'Kadal Thunai Warehouse',
              description: 'Order confirmed and being prepared'
            },
            {
              id: '2',
              timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'processing',
              location: 'Kadal Thunai Warehouse',
              description: 'Order packed and ready for pickup'
            },
            {
              id: '3',
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'shipped',
              location: 'Kadal Thunai Warehouse',
              description: 'Package picked up by delivery partner'
            },
            {
              id: '4',
              timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'in_transit',
              location: 'Chennai Distribution Center',
              description: 'Package arrived at distribution center'
            }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTrackingData(mockTrackingData);
        setError(null);
      } catch (error) {
        console.error('Error fetching tracking data:', error);
        setError('Failed to fetch tracking information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackingData();
  }, [trackingNumber]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tracking Information Not Found</h3>
              <p className="text-gray-600 mb-4">
                {error || "We couldn't find tracking information for this number."}
              </p>
              <Button onClick={() => router.push('/account/orders')} className="bg-red-600 hover:bg-red-700">
                View All Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[trackingData.status];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
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
            <h1 className="text-2xl font-bold text-gray-900">Track Order</h1>
            <p className="text-gray-600">Order #{trackingData.orderNumber}</p>
          </div>
        </div>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Badge className={statusColors[trackingData.status]}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {trackingData.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              <span className="text-sm text-gray-600">
                Tracking: {trackingData.trackingNumber}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Current Location: {trackingData.currentLocation}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Estimated Delivery: {formatDate(trackingData.estimatedDelivery)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingData.events
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((event, index) => {
                  const EventIcon = statusIcons[event.status as keyof typeof statusIcons] || Package;
                  const isLatest = index === 0;
                  
                  return (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${isLatest ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <EventIcon className={`h-4 w-4 ${isLatest ? 'text-red-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${isLatest ? 'text-red-600' : 'text-gray-900'}`}>
                            {event.description}
                          </p>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.location}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          <Button 
            onClick={() => router.push('/account/orders')} 
            variant="outline" 
            className="flex-1"
          >
            View All Orders
          </Button>
          <Button 
            onClick={() => router.push('/support')} 
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Need Help?
          </Button>
        </div>
      </div>
    </div>
  );
}
