'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock3, Loader2, PackageCheck, Receipt, Truck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { fetchJson } from '@/lib/apiClient';
import { clientStorage, type StoredOrder } from '@/lib/clientStorage';
import { toast } from 'sonner';

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoadingOrder(false);
        return;
      }

      try {
        const payload = await fetchJson<StoredOrder>(`/api/orders/${encodeURIComponent(orderId)}`);
        setOrder(payload);
        clientStorage.orders.add(payload);
      } catch {
        setOrder(null);
      } finally {
        setLoadingOrder(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const copyOrderId = () => {
    if (!order?.orderNumber && !order?.id) return;
    navigator.clipboard.writeText(order.orderNumber || order.id).then(() => toast.success('Order ID copied'));
  };

  if (loadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white px-4 py-10">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">We could not verify this order</h1>
              <p className="mt-1 text-sm text-gray-700">
                If your payment succeeded, return to checkout and use retry confirmation. Otherwise you can safely retry payment.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button type="button" onClick={() => router.push('/checkout')} className="bg-red-600 hover:bg-red-700">
              Return to checkout
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/account/orders')}>
              View my orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const etaText = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'We will update your ETA shortly';

  const isPaid = order.paymentStatus === 'paid';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-full p-2 ${isPaid ? 'bg-green-50' : 'bg-amber-50'}`}>
            <CheckCircle2 className={`h-5 w-5 ${isPaid ? 'text-green-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {isPaid ? 'Order placed successfully' : 'Order created with pending payment'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {isPaid
                ? 'Your payment was verified and your order is confirmed.'
                : 'We created the order, but payment is still pending review.'}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-medium text-gray-500">Order ID</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="font-mono text-sm font-semibold text-gray-900">{order.orderNumber || order.id}</div>
            <Button type="button" variant="outline" size="sm" onClick={copyOrderId}>
              Copy
            </Button>
          </div>
        </div>

        <div className={`rounded-xl p-4 ${isPaid ? 'border border-orange-200 bg-orange-50' : 'border border-amber-200 bg-amber-50'}`}>
          <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${isPaid ? 'text-orange-700' : 'text-amber-700'}`}>
            <Clock3 className="h-4 w-4" />
            Delivery Estimate
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">{etaText}</p>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Order Status</div>
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">Order status: {order.status}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Receipt className={`h-4 w-4 ${isPaid ? 'text-green-600' : 'text-amber-600'}`} />
              <span className="font-medium text-gray-900">Payment: {order.paymentStatus}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <PackageCheck className="h-4 w-4 text-red-600" />
              <span className="font-medium text-gray-900">Amount: Rs {order.totalAmount.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Track updates in your orders page</span>
            </div>
          </div>
        </div>

        {user && (
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500">Customer</div>
            <div className="mt-1 text-sm font-semibold text-gray-900">{user.name || 'Customer'}</div>
            {user.phoneNumber && <div className="mt-0.5 text-xs text-gray-600">{user.phoneNumber}</div>}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          <Button type="button" onClick={() => router.push('/account/orders')} className="bg-red-600 hover:bg-red-700">
            View order
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/')}>
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
