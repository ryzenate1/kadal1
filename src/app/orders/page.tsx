'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Repeat, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchJson } from '@/lib/apiClient';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  trackingNumber?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    productImage: string | null;
    quantity: number;
    price: number;
    weight?: string | null;
  }>;
  address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
};

type ReorderResponse = {
  success: boolean;
  newOrderId: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusVariant(status: string) {
  if (status === 'delivered') return 'bg-green-100 text-green-800';
  if (status === 'cancelled') return 'bg-red-100 text-red-800';
  return 'bg-blue-100 text-blue-800';
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { addBulkToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/orders');
      return;
    }

    if (!isAuthenticated) return;

    const loadOrders = async () => {
      try {
        const data = await fetchJson<Order[]>('/api/user/orders');
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, [isAuthenticated, loading, router]);

  const activeOrders = useMemo(
    () => orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)),
    [orders]
  );

  const reorder = async (order: Order) => {
    try {
      const response = await fetchJson<ReorderResponse>('/api/user/reorder', {
        method: 'POST',
        body: { orderId: order.orderNumber },
      });
      toast.success('Reorder placed successfully');
      router.push(`/orders/${response.newOrderId}`);
    } catch (error) {
      console.error('Reorder failed:', error);
      addBulkToCart(
        order.items.map((item) => ({
          name: item.productName,
          price: item.price,
          quantity: item.quantity,
          src: item.productImage || '/images/fish/mackerel.jpg',
          type: 'Fish',
          netWeight: item.weight || '',
          omega3: 0,
          protein: 0,
          calories: 0,
          benefits: [],
          bestFor: [],
          rating: 4.5,
        }))
      );
      toast.success('Items added to cart instead');
      router.push('/cart');
    }
  };

  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            {activeOrders.length > 0
              ? `${activeOrders.length} active order${activeOrders.length === 1 ? '' : 's'}`
              : 'Track recent orders and reorder your favorites.'}
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900">No orders yet</h2>
            <p className="mt-2 text-sm text-gray-600">Your purchases will show up here once checkout completes.</p>
            <Link href="/" className="mt-6 inline-block">
              <Button>Start shopping</Button>
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-gray-900">#{order.orderNumber}</h2>
                    <Badge className={statusVariant(order.status)}>{order.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/orders/${order.orderNumber}`}>
                    <Button variant="outline">Details</Button>
                  </Link>
                  {order.trackingNumber ? (
                    <Link href={`/tracking/${order.orderNumber}`}>
                      <Button variant="outline">
                        <Truck className="mr-2 h-4 w-4" />
                        Track
                      </Button>
                    </Link>
                  ) : null}
                  <Button variant="outline" onClick={() => void reorder(order)}>
                    <Repeat className="mr-2 h-4 w-4" />
                    Reorder
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="relative h-14 w-14 overflow-hidden rounded-xl bg-gray-100">
                        <Image
                          src={item.productImage || '/images/fish/mackerel.jpg'}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <div className="text-sm text-gray-600">
                      <p>{order.items.length} item{order.items.length === 1 ? '' : 's'}</p>
                      <p className="font-medium text-gray-900">Rs. {order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.address.address}, {order.address.city}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
