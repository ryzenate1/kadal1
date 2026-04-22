'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Repeat, Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchJson } from '@/lib/apiClient';

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  createdAt: string;
  deliverySlot?: string | null;
  address: {
    name: string;
    phone?: string | null;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    productImage: string | null;
    quantity: number;
    price: number;
    weight?: string | null;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter();
  const { orderId } = use(params);
  const { isAuthenticated, loading } = useAuth();
  const { addBulkToCart } = useCart();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    const loadOrder = async () => {
      try {
        const data = await fetchJson<OrderDetail>(`/api/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        console.error('Failed to load order:', error);
        if (!isAuthenticated) {
          router.push(`/auth/login?redirect=/orders/${orderId}`);
          return;
        }
        toast.error(error instanceof Error ? error.message : 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrder();
  }, [isAuthenticated, loading, orderId, router]);

  const reorder = () => {
    if (!order) return;
    addBulkToCart(
      order.items.map((item) => ({
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        src: item.productImage || '/images/fish/vangaram.jpg',
        type: 'Fish',
        netWeight: item.weight || '',
        omega3: 0, protein: 0, calories: 0,
        benefits: [], bestFor: [], rating: 4.5,
      }))
    );
    toast.success('Items added to cart');
    router.push('/cart');
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button variant="ghost" onClick={() => router.push('/orders')} className="px-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to orders
        </Button>

        {!order ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-600 mb-4">Order not found.</p>
            <Link href="/categories">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Order #{order.orderNumber}</CardTitle>
                      <p className="mt-1 text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <Badge className="w-fit bg-blue-100 text-blue-800">{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Payment</p>
                    <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                    <p className="text-sm text-gray-600 capitalize">{order.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated delivery</p>
                    <p className="font-medium text-gray-900">{formatDate(order.estimatedDelivery)}</p>
                    <p className="text-sm text-gray-600">{order.deliverySlot || 'Standard slot'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="mb-2 text-sm text-gray-500">Delivery address</p>
                    <div className="flex gap-3 rounded-xl bg-gray-50 p-4">
                      <MapPin className="mt-0.5 h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium text-gray-900">{order.address.name}</p>
                        <p>{order.address.address}</p>
                        <p>{order.address.city}, {order.address.state} – {order.address.pincode}</p>
                        {order.address.phone && <p>{order.address.phone}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle>Items</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-xl border border-gray-100 p-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <Image
                          src={item.productImage || '/images/fish/vangaram.jpg'}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/images/fish/vangaram.jpg'; }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          Qty {item.quantity}{item.weight ? ` · ${item.weight}` : ''}
                        </p>
                        <p className="mt-2 font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Items</span>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-3">
                    <span>Total</span>
                    <span>₹{order.totalAmount.toFixed(0)}</span>
                  </div>
                  {order.trackingNumber && (
                    <Link href={`/tracking/${order.orderNumber}`} className="block">
                      <Button className="w-full" variant="outline">
                        <Truck className="mr-2 h-4 w-4" />
                        Track order
                      </Button>
                    </Link>
                  )}
                  <Button className="w-full" variant="outline" onClick={reorder}>
                    <Repeat className="mr-2 h-4 w-4" />
                    Reorder
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
