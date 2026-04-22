'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { fetchJson } from '@/lib/apiClient';
import { clientStorage } from '@/lib/clientStorage';
import { subscribeToAddressBookUpdates } from '@/lib/addressSync';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const deliverySlots = [
  { id: 's1', label: 'Today', time: '6 PM - 8 PM' },
  { id: 's2', label: 'Tomorrow', time: '9 AM - 12 PM' },
  { id: 's3', label: 'Tomorrow', time: '4 PM - 7 PM' },
] as const;
type DeliverySlot = (typeof deliverySlots)[number];

const STEPS = ['Address', 'Slot', 'Payment', 'Review'] as const;
type Step = 0 | 1 | 2 | 3;

interface GuestAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

type FinalizeState = {
  checkoutToken: string;
  verifiedPaymentToken: string;
};

type PaymentIssue = {
  stage: 'payment' | 'finalization';
  title: string;
  message: string;
  retryLabel: string;
  retryAction: 'payment' | 'finalization';
  finalizeState?: FinalizeState;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const { cart, clearCart, getCartSummary } = useCart();

  const [step, setStep] = useState<Step>(0);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [guestAddress, setGuestAddress] = useState<GuestAddress>({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot>(deliverySlots[0]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [suppressCartRedirect, setSuppressCartRedirect] = useState(false);
  const [claimedCouponCode, setClaimedCouponCode] = useState('');
  const [claimedCouponDiscount, setClaimedCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [razorpayScriptLoaded, setRazorpayScriptLoaded] = useState(false);
  const [paymentIssue, setPaymentIssue] = useState<PaymentIssue | null>(null);

  const paymentMethod = 'razorpay' as const;
  const summary = getCartSummary();
  const effectiveTotal = Math.max(0, summary.total - claimedCouponDiscount);

  useEffect(() => {
    if (!loading && cart.length === 0 && !suppressCartRedirect) {
      router.push('/cart');
    }
  }, [cart.length, loading, router, suppressCartRedirect]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAddresses = async () => {
      try {
        const data = await fetchJson<any>('/api/user/addresses', { authenticated: true });
        const list = Array.isArray(data) ? data : data?.addresses || [];
        setSavedAddresses(list);
        if (list.length > 0) {
          setSelectedAddressId((prev) => {
            if (prev && list.some((address: any) => address.id === prev)) {
              return prev;
            }
            const defaultAddress = list.find((address: any) => address.isDefault) || list[0];
            return defaultAddress.id;
          });
          return;
        }

        setSelectedAddressId(null);
      } catch {
        if (user?.defaultAddress) {
          setSavedAddresses([user.defaultAddress]);
          setSelectedAddressId(user.defaultAddress.id);
        }
      }
    };

    void fetchAddresses();

    return subscribeToAddressBookUpdates(() => {
      void fetchAddresses();
    });
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setGuestAddress((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      phone: prev.phone || user.phoneNumber || '',
    }));
  }, [isAuthenticated, user]);

  const selectedAddress = savedAddresses.find((address) => address.id === selectedAddressId) || savedAddresses[0] || null;
  const shippingAddress = isAuthenticated && selectedAddress
    ? {
        name: selectedAddress.name || user?.name || '',
        phone: selectedAddress.phoneNumber || selectedAddress.phone || user?.phoneNumber || '',
        address: selectedAddress.address || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || 'Tamil Nadu',
        pincode: selectedAddress.pincode || '',
      }
    : {
        name: guestAddress.name,
        phone: guestAddress.phone,
        address: guestAddress.address,
        city: guestAddress.city,
        state: guestAddress.state,
        pincode: guestAddress.pincode,
      };

  const guestAddressComplete =
    guestAddress.name.trim() &&
    guestAddress.phone.trim().length === 10 &&
    guestAddress.address.trim() &&
    guestAddress.city.trim() &&
    guestAddress.pincode.trim().length === 6;

  const canAdvanceFromAddress = isAuthenticated ? !!selectedAddress : !!guestAddressComplete;

  const buildCheckoutPayload = () => ({
    items: cart.map((item) => ({
      productId: item.productId || item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image || item.src,
      weight: item.netWeight || '',
    })),
    totalAmount: effectiveTotal,
    pricing: {
      subtotal: summary.subtotal,
      deliveryFee: summary.deliveryFee,
      discount: (summary.discount || 0) + claimedCouponDiscount,
      tax: summary.tax || 0,
      total: effectiveTotal,
    },
    paymentMethod,
    shippingAddress,
    deliverySlot: `${selectedSlot.label} - ${selectedSlot.time}`,
    claimedCouponCode: claimedCouponCode.trim() || undefined,
  });

  const finalizeOrder = async (finalizeState: FinalizeState) => {
    try {
      const payload = await fetchJson<any>('/api/orders', {
        method: 'POST',
        body: {
          checkoutToken: finalizeState.checkoutToken,
          verifiedPaymentToken: finalizeState.verifiedPaymentToken,
        },
      });

      setSuppressCartRedirect(true);
      setPaymentIssue(null);
      if (payload?.sessionToken && !clientStorage.auth.getToken()) {
        clientStorage.auth.setSession(payload.sessionToken, {
          ttlMs: 1000 * 60 * 60 * 24 * 7,
        });
      }
      clientStorage.orders.add({
        ...payload,
        sessionToken: undefined,
      });
      clearCart();

      const orderId = payload.orderNumber || payload.id;
      router.replace(`/order-confirmation?orderId=${encodeURIComponent(orderId)}`);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Payment was captured, but we could not confirm your order yet.';
      setPaymentIssue({
        stage: 'finalization',
        title: 'Payment received, confirmation pending',
        message,
        retryLabel: 'Retry confirmation',
        retryAction: 'finalization',
        finalizeState,
      });
      toast.error(message);
      return false;
    }
  };

  const placeOrder = async () => {
    if (!shippingAddress.address) {
      toast.error('Please fill in your delivery address');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!razorpayScriptLoaded || !window.Razorpay) {
      toast.error('Payment service is loading. Please try again in a moment.');
      return;
    }

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      toast.error('Payment configuration missing. Please contact support.');
      return;
    }

    setPlacingOrder(true);
    setPaymentIssue(null);

    try {
      const razorpayOrder = await fetchJson<{
        order_id: string;
        amount: number;
        currency: string;
        checkoutToken: string;
      }>('/api/create-order', {
        method: 'POST',
        body: {
          ...buildCheckoutPayload(),
          currency: 'INR',
          receipt: `kt_${Date.now()}`,
        },
      });

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Kadal Thunai',
        description: 'Order payment',
        order_id: razorpayOrder.order_id,
        prefill: {
          name: shippingAddress.name,
          email: user?.email || undefined,
          contact: shippingAddress.phone || undefined,
        },
        theme: {
          color: '#dc2626',
        },
        modal: {
          ondismiss: () => {
            const message = 'Payment was cancelled before completion.';
            setPaymentIssue({
              stage: 'payment',
              title: 'Payment not completed',
              message,
              retryLabel: 'Retry payment',
              retryAction: 'payment',
            });
            setPlacingOrder(false);
            toast.error(message);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verification = await fetchJson<{ verifiedPaymentToken: string }>('/api/verify-payment', {
              method: 'POST',
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                checkoutToken: razorpayOrder.checkoutToken,
              },
            });

            await finalizeOrder({
              checkoutToken: razorpayOrder.checkoutToken,
              verifiedPaymentToken: verification.verifiedPaymentToken,
            });
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Payment verification failed. Please retry.';
            setPaymentIssue({
              stage: 'payment',
              title: 'Payment verification failed',
              message,
              retryLabel: 'Retry payment',
              retryAction: 'payment',
            });
            toast.error(message);
          } finally {
            setPlacingOrder(false);
          }
        },
      });

      rzp.on('payment.failed', (event: any) => {
        const message =
          event?.error?.description ||
          event?.error?.reason ||
          'Payment failed. Please try again.';
        setPaymentIssue({
          stage: 'payment',
          title: 'Payment failed',
          message,
          retryLabel: 'Retry payment',
          retryAction: 'payment',
        });
        toast.error(message);
        setPlacingOrder(false);
      });

      rzp.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize payment';
      setSuppressCartRedirect(false);
      setPaymentIssue({
        stage: 'payment',
        title: 'Unable to start payment',
        message,
        retryLabel: 'Retry payment',
        retryAction: 'payment',
      });
      toast.error(message);
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  const renderStepAddress = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Delivery Address</h2>
          <p className="text-xs text-gray-500">Where should we deliver?</p>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="space-y-3">
          {savedAddresses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">No saved addresses yet.</p>
              <Link href="/account/addresses">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">Add Address</Button>
              </Link>
            </div>
          ) : (
            savedAddresses.map((addr: any) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => setSelectedAddressId(addr.id)}
                className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                  selectedAddressId === addr.id
                    ? 'border-red-400 bg-red-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{addr.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{addr.address}</p>
                    <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-xs text-gray-400 mt-1">{addr.phoneNumber || addr.phone}</p>
                  </div>
                  {selectedAddressId === addr.id && (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
          <Link href="/account/addresses" className="text-sm text-red-600 px-1">
            Manage addresses
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Full Name *</label>
              <Input
                placeholder="Your name"
                value={guestAddress.name}
                onChange={(e) => setGuestAddress((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-xl border-gray-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Phone *</label>
              <Input
                placeholder="10-digit mobile"
                value={guestAddress.phone}
                maxLength={10}
                onChange={(e) => setGuestAddress((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                className="rounded-xl border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Address *</label>
            <Input
              placeholder="House no., Street, Area"
              value={guestAddress.address}
              onChange={(e) => setGuestAddress((prev) => ({ ...prev, address: e.target.value }))}
              className="rounded-xl border-gray-200"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'city', label: 'City *', ph: 'City' },
              { key: 'state', label: 'State', ph: 'State' },
              { key: 'pincode', label: 'Pincode *', ph: '6-digit' },
            ].map(({ key, label, ph }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-gray-600">{label}</label>
                <Input
                  placeholder={ph}
                  value={(guestAddress as any)[key]}
                  maxLength={key === 'pincode' ? 6 : undefined}
                  onChange={(e) =>
                    setGuestAddress((prev) => ({
                      ...prev,
                      [key]: key === 'pincode' ? e.target.value.replace(/\D/g, '') : e.target.value,
                    }))
                  }
                  className="rounded-xl border-gray-200"
                />
              </div>
            ))}
          </div>

          <div className="pt-1 text-xs text-gray-500">
            Have an account?{' '}
            <Link href="/auth/login?redirect=/checkout" className="text-red-600 font-medium">Login</Link>{' '}
            to use saved addresses.
          </div>
        </div>
      )}
    </div>
  );

  const renderStepSlot = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Delivery Slot</h2>
          <p className="text-xs text-gray-500">Choose when to receive your order</p>
        </div>
      </div>
      <div className="grid gap-3">
        {deliverySlots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => setSelectedSlot(slot)}
            className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
              selectedSlot.id === slot.id
                ? 'border-orange-400 bg-orange-50 shadow-sm'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{slot.label}</p>
                <p className="text-sm text-gray-500">{slot.time}</p>
              </div>
              {selectedSlot.id === slot.id && (
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStepPayment = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Payment</h2>
          <p className="text-xs text-gray-500">Your payment is captured only through Razorpay checkout.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Razorpay Secure Checkout</p>
          <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-md">
            Live Gateway
          </span>
        </div>
        <p className="text-sm text-gray-700">
          Card, UPI, net banking and wallet options open inside the real Razorpay modal.
        </p>
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="text-xs text-gray-500">Payable Amount</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">Rs {effectiveTotal.toFixed(0)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Claimed Coupon</div>
        <div className="flex gap-2">
          <Input
            value={claimedCouponCode}
            onChange={(e) => setClaimedCouponCode(e.target.value.toUpperCase())}
            placeholder="Enter claimed coupon code"
            className="rounded-xl"
          />
          <Button
            type="button"
            disabled={validatingCoupon || !claimedCouponCode.trim()}
            onClick={async () => {
              setValidatingCoupon(true);
              try {
                const res = await fetch('/api/user/claimed-coupons/validate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-name': user?.name || '',
                    'x-user-email': user?.email || '',
                    'x-user-phone': user?.phoneNumber || '',
                  },
                  body: JSON.stringify({ code: claimedCouponCode, subtotal: summary.total }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || 'Invalid coupon');
                setClaimedCouponDiscount(Number(data.discountAmount || 0));
                toast.success(`Coupon applied: -Rs ${Number(data.discountAmount || 0).toFixed(0)}`);
              } catch (error) {
                setClaimedCouponDiscount(0);
                toast.error(error instanceof Error ? error.message : 'Failed to apply coupon');
              } finally {
                setValidatingCoupon(false);
              }
            }}
            className="rounded-xl bg-red-600 hover:bg-red-700"
          >
            {validatingCoupon ? 'Checking...' : 'Apply'}
          </Button>
        </div>
        {claimedCouponDiscount > 0 && (
          <p className="text-xs text-green-700">Claimed coupon applied: -Rs {claimedCouponDiscount.toFixed(0)}</p>
        )}
      </div>
    </div>
  );

  const renderStepReview = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Review Order</h2>
          <p className="text-xs text-gray-500">Confirm the address, slot and amount before paying.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Deliver to</div>
        <p className="font-semibold text-gray-900">{shippingAddress.name}</p>
        <p className="text-sm text-gray-600">{shippingAddress.address}</p>
        <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
        <p className="text-xs text-gray-400">{shippingAddress.phone}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Slot</div>
          <p className="font-semibold text-gray-900">{selectedSlot.label}</p>
          <p className="text-sm text-gray-500">{selectedSlot.time}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</div>
          <p className="font-semibold text-gray-900">Razorpay</p>
          <p className="text-sm text-gray-500">Verified before order creation</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Items ({cart.length})
        </div>
        <div className="divide-y divide-gray-50">
          {cart.map((item) => (
            <div key={item.id} className="px-4 py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">x{item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900">Rs {(item.price * item.quantity).toFixed(0)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const stepContent = [renderStepAddress, renderStepSlot, renderStepPayment, renderStepReview];

  const canAdvance = () => {
    if (step === 0) return canAdvanceFromAddress;
    if (step === 1) return !!selectedSlot;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayScriptLoaded(true)}
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => (step === 0 ? router.push('/cart') : setStep((step - 1) as Step))}
            className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">Back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <p className="text-xs text-gray-500">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((label, index) => (
            <div key={label} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  index <= step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < step ? <Check className="w-3.5 h-3.5" /> : index + 1}
              </div>
              <span className={`text-xs ml-1 hidden sm:block ${index === step ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                {label}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full ${index < step ? 'bg-red-200' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
            {stepContent[step]()}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 h-fit lg:sticky lg:top-28">
            <div className="font-semibold text-sm text-gray-700">Order Summary</div>

            <div className="space-y-2 text-sm max-h-36 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between gap-2 text-gray-600">
                  <span className="truncate">{item.name} x{item.quantity}</span>
                  <span className="font-medium text-gray-900 flex-shrink-0">Rs {(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>Rs {summary.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>{summary.deliveryFee > 0 ? `Rs ${summary.deliveryFee.toFixed(0)}` : 'Free'}</span>
              </div>
              {claimedCouponDiscount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Claimed coupon</span>
                  <span>-Rs {claimedCouponDiscount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
                <span>Total</span>
                <span>Rs {effectiveTotal.toFixed(0)}</span>
              </div>
            </div>

            {paymentIssue && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">{paymentIssue.title}</p>
                    <p className="text-xs text-amber-800 mt-1">{paymentIssue.message}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                    onClick={() => {
                      if (paymentIssue.retryAction === 'finalization' && paymentIssue.finalizeState) {
                        setPlacingOrder(true);
                        finalizeOrder(paymentIssue.finalizeState).finally(() => setPlacingOrder(false));
                        return;
                      }
                      placeOrder();
                    }}
                    disabled={placingOrder}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {paymentIssue.retryLabel}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => router.push('/cart')}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep((step + 1) as Step)}
                disabled={!canAdvance()}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-5 font-semibold"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={placeOrder}
                disabled={placingOrder}
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-5 font-semibold"
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>Pay Securely - Rs {effectiveTotal.toFixed(0)}</>
                )}
              </Button>
            )}

            <div className="text-center text-xs text-gray-400">Secure checkout</div>
          </div>
        </div>
      </div>
    </div>
  );
}
