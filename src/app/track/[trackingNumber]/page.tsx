'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchJson } from '@/lib/apiClient';

type TrackingPayload = {
  order: {
    id: string;
    status: string;
    estimatedDelivery?: string | null;
    address?: { address?: string; city?: string };
  };
  tracking: {
    progressPercentage: number;
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

export default function TrackingPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = use(params);
  const router = useRouter();
  const [data, setData] = useState<TrackingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchJson<TrackingPayload>(`/api/orders/${encodeURIComponent(trackingNumber)}/tracking`);
        setData(response);
      } catch (loadError) {
        console.error('Tracking page failed:', loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load tracking');
      }
    };

    void load();
  }, [trackingNumber]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="px-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {error ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : !data ? (
          <div className="rounded-xl bg-white p-8 shadow-sm">Loading tracking...</div>
        ) : (
          <>
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tracking #{trackingNumber}</CardTitle>
                  <p className="mt-1 text-sm text-gray-600">Order #{data.order.id}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{data.order.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{data.tracking.progressPercentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${data.tracking.progressPercentage}%` }} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      ETA
                    </div>
                    <p className="mt-1 font-medium text-gray-900">{formatDate(data.order.estimatedDelivery)}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      Destination
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
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.tracking.locationUpdates.map((event, index) => (
                  <div key={`${event.timestamp}-${index}`} className="flex gap-3 border-b border-gray-100 pb-4 last:border-0">
                    <div className="mt-1 rounded-full bg-emerald-100 p-2 text-emerald-700">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.description}</p>
                      <p className="text-sm text-gray-600">{event.metadata?.location || event.status}</p>
                      <p className="mt-1 text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
