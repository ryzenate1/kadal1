'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Package, Search, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { fetchJson } from '@/lib/apiClient';

type TrackingPayload = {
  order: {
    id: string;
    status: string;
    createdAt: string;
    estimatedDelivery?: string | null;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    user?: { name?: string; phoneNumber?: string };
    address?: { address?: string; city?: string; state?: string; pincode?: string };
    orderItems: Array<{
      id: string;
      quantity: number;
      price: number;
      product?: { name?: string; imageUrl?: string };
    }>;
  };
  tracking: {
    eta: number;
    progressPercentage: number;
    currentStatus: string;
    locationUpdates: Array<{
      status: string;
      description: string;
      timestamp: string;
      metadata?: { location?: string };
    }>;
  };
};

function formatDate(value?: string | null) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TrackOrderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [data, setData] = useState<TrackingPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runLookup = async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchJson<TrackingPayload>(`/api/orders/${encodeURIComponent(value)}/tracking`);
      setData(response);
    } catch (lookupError) {
      console.error('Tracking lookup failed:', lookupError);
      setData(null);
      setError(lookupError instanceof Error ? lookupError.message : 'Unable to track order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingId) {
      void runLookup(trackingId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()} className="px-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Track order</h1>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Lookup by order number or tracking number</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              value={trackingId}
              onChange={(event) => setTrackingId(event.target.value)}
              placeholder="Enter order number"
            />
            <Button onClick={() => void runLookup(trackingId)} disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Checking...' : 'Track'}
            </Button>
          </CardContent>
        </Card>

        {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        {data ? (
          <>
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Order #{data.order.id}</CardTitle>
                  <p className="mt-1 text-sm text-gray-600">Placed {formatDate(data.order.createdAt)}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{data.order.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                    <span>Order progress</span>
                    <span>{data.tracking.progressPercentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${data.tracking.progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      ETA
                    </div>
                    <p className="mt-1 font-medium text-gray-900">
                      {data.order.estimatedDelivery ? formatDate(data.order.estimatedDelivery) : `${data.tracking.eta} mins`}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      Delivery address
                    </div>
                    <p className="mt-1 font-medium text-gray-900">
                      {data.order.address?.address}, {data.order.address?.city}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Tracking updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.tracking.locationUpdates.map((update, index) => (
                  <div key={`${update.timestamp}-${index}`} className="flex gap-3 border-b border-gray-100 pb-4 last:border-0">
                    <div className="mt-1 rounded-full bg-emerald-100 p-2 text-emerald-700">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{update.description}</p>
                      <p className="text-sm text-gray-600">{update.metadata?.location || update.status}</p>
                      <p className="mt-1 text-xs text-gray-500">{formatDate(update.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.product?.name || 'Item'}</p>
                      <p className="text-sm text-gray-600">Qty {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-8">Loading tracking...</div>}>
      <TrackOrderInner />
    </Suspense>
  );
}
