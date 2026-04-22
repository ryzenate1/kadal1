'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import {
  MapPin, CreditCard, Package, CheckCircle,
  Loader2, Home, Briefcase, ChevronRight, ShoppingBag,
} from 'lucide-react';
import Image from 'next/image';
import { fetchJson } from '@/lib/apiClient';
import { toast } from 'sonner';

type Step = 1 | 3 | 4;

interface AddressFormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const CheckoutPage = () => {
  const { cart, getCartSummary, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { currentAddress, addresses } = useLocation();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const [addressForm, setAddressForm] = useState<AddressFormData>({
    name: user?.name || '',
    phone: user?.phoneNumber || '',
    address: currentAddress?.address_string || '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  useEffect(() => {
    setAddressForm(prev => ({
      ...prev,
      name: user?.name || prev.name,
      phone: user?.phoneNumber || prev.phone,
      address: currentAddress?.address_string || prev.address,
    }));
  }, [user, currentAddress]);

  useEffect(() => {
    if (cart.length === 0 && step !== 4) {
      router.replace('/cart');
    }
  }, [cart, step, router]);

  const summary = getCartSummary();
  const { subtotal, deliveryFee, total, discount = 0 } = summary;

  const handleAddressNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name.trim() || !addressForm.phone.trim() || !addressForm.address.trim() ||
        !addressForm.city.trim() || !addressForm.pincode.trim()) {
      toast.error('Please fill all required address fields');
      return;
    }
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        items: cart.map(item => ({
          // Pass productId for server-side authoritative pricing
          productId: item.productId || undefined,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.src || item.image,
          weight: item.netWeight,
        })),
        totalAmount: total,
        pricing: { subtotal, deliveryFee, discount, tax: 0, total },
        paymentMethod: 'cod',
        shippingAddress: {
          name: addressForm.name,
          phone: addressForm.phone,
          address: addressForm.address,
          city: addressForm.city,
          state: addressForm.state,
          pincode: addressForm.pincode,
        },
      };

      const data = await fetchJson<any>('/api/orders', {
        method: 'POST',
        body: orderPayload,
      });

      setPlacedOrder(data);
      clearCart();
      setStep(4);
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCartSummary = () => (
    <div className="bg-gray-50 rounded-xl p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 text-red-500" /> Order Summary ({cart.length} item{cart.length !== 1 ? 's' : ''})
      </h3>
      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
        {cart.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
              {(item.src || item.image) && (
                <Image src={item.src || item.image || ''} alt={item.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}{item.netWeight ? ` · ${item.netWeight}` : ''}</p>
            </div>
            <p className="text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span><span>-₹{discount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t">
          <span>Total</span><span>₹{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" /> Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAuthenticated && addresses.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Saved Addresses</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                    addressForm.address === addr.address_string
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                  onClick={() => {
                    // Parse city/state/pincode from address_string
                    const parts = addr.address_string.split(',').map(s => s.trim());
                    const pincodeMatch = addr.address_string.match(/\b\d{6}\b/);
                    setAddressForm(prev => ({
                      ...prev,
                      address: addr.address_string,
                      name: addr.name || prev.name,
                      phone: addr.phone || prev.phone,
                      pincode: pincodeMatch?.[0] || prev.pincode,
                      city: parts.length >= 3 ? parts[parts.length - 3] : prev.city,
                      state: parts.length >= 2 ? parts[parts.length - 2] : prev.state,
                    }));
                  }}
                >
                  <div className="mt-0.5">
                    {addr.tag === 'home'
                      ? <Home className="w-4 h-4 text-red-500" />
                      : <Briefcase className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{addr.tag} — {addr.name}</p>
                    <p className="text-xs text-gray-500 truncate">{addr.address_string}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 mb-4">Or enter a new address below</p>
          </div>
        )}

        <form onSubmit={handleAddressNext} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={addressForm.name}
                onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                placeholder="Your full name" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input id="phone" type="tel" value={addressForm.phone}
                onChange={e => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="10-digit number" required className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Complete Address *</Label>
            <Input id="address" value={addressForm.address}
              onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
              placeholder="Door no, Street, Area" required className="mt-1" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input id="pincode" value={addressForm.pincode}
                onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="600001" required className="mt-1" maxLength={6} />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input id="city" value={addressForm.city}
                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                placeholder="Chennai" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={addressForm.state}
                onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                className="mt-1" />
            </div>
          </div>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white mt-2">
            Continue to Payment <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-red-500" /> Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderCartSummary()}

        <div className="space-y-2 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Payment Method</p>
          <div
            className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer border-red-500 bg-red-50"
          >
            <span className="text-xl">💵</span>
            <span className="font-medium text-gray-800">Cash on Delivery</span>
            <CheckCircle className="w-5 h-5 text-red-500 ml-auto" />
          </div>
          <p className="text-xs text-gray-400 text-center">Online payment (Razorpay) available on the full checkout page</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm text-blue-800">
          <p className="font-medium">Delivering to:</p>
          <p className="text-blue-600">{addressForm.name} · {addressForm.phone}</p>
          <p className="text-blue-600 text-xs">{addressForm.address}, {addressForm.city} – {addressForm.pincode}</p>
        </div>

        <div className="flex gap-3 mb-3">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            ← Edit Address
          </Button>
        </div>

        <Button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base font-semibold"
        >
          {isSubmitting
            ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Placing Order...</>
            : `Place Order · ₹${total.toLocaleString()}`}
        </Button>
        <p className="text-xs text-center text-gray-400 mt-2">
          By placing your order, you agree to our Terms of Service
        </p>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <div className="text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
      <p className="text-gray-600 mb-2">Your order has been confirmed and is being prepared.</p>
      {placedOrder && (
        <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto mb-6 text-left">
          <p className="text-sm text-gray-500">Order Number</p>
          <p className="font-bold text-gray-900">{placedOrder.orderNumber}</p>
          {placedOrder.trackingNumber && (
            <>
              <p className="text-sm text-gray-500 mt-2">Tracking</p>
              <p className="font-mono text-gray-900 text-sm">{placedOrder.trackingNumber}</p>
            </>
          )}
          {placedOrder.estimatedDelivery && (
            <>
              <p className="text-sm text-gray-500 mt-2">Estimated Delivery</p>
              <p className="font-medium text-green-700">
                {new Date(placedOrder.estimatedDelivery).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit',
                })} today
              </p>
            </>
          )}
        </div>
      )}
      <div className="flex gap-3 justify-center flex-wrap">
        <Button onClick={() => router.push('/account/orders')} className="bg-red-600 hover:bg-red-700 text-white">
          <Package className="w-4 h-4 mr-2" /> View My Orders
        </Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );

  const steps = [
    { n: 1, label: 'Address' },
    { n: 3, label: 'Payment' },
    { n: 4, label: 'Done' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Checkout</h1>

      {step < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <React.Fragment key={s.n}>
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= s.n ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.n ? <CheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className="text-xs mt-1 text-gray-500">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${step > s.n ? 'bg-red-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {step === 1 && renderStep1()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default CheckoutPage;
