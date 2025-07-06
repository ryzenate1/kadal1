import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { UserLocation } from '@/context/CartContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// Remove radio-group import as it's not available
import { Label } from '../ui/label';
import { MapPin, Clock, CreditCard, Package, CheckCircle } from 'lucide-react';

interface AddressFormData {
  name: string;
  contactNumber: string;
  pincode: string;
  address: string;
  city: string;
  state: string;
}

const CheckoutPage = () => {
  const {
    cart,
    userLocation,
    userPreferences,
    deliverySlots,
    selectedDeliverySlot,
    setSelectedDeliverySlot,
    setUserLocation,
    updateUserPreferences,
    checkout,
    getCartSummary,
    isLoading,
    error,
  } = useCart();
  
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    name: userPreferences?.savedAddresses?.[0]?.name || '',
    contactNumber: userPreferences?.contactNumber || '',
    pincode: userLocation?.pincode || '',
    address: userLocation?.address || '',
    city: userLocation?.city || '',
    state: userLocation?.state || '',
  });
  
  // Initialize form with user's default address if available
  useEffect(() => {
    if (userPreferences?.savedAddresses?.[0]) {
      const defaultAddress = userPreferences.savedAddresses[0];
      const newForm = {
        name: defaultAddress.name || '',
        contactNumber: defaultAddress.phone || '',
        pincode: defaultAddress.pincode || '',
        address: defaultAddress.address || '',
        city: defaultAddress.city || '',
        state: defaultAddress.state || '',
      };
      
      // Only update if there are actual changes
      if (JSON.stringify(newForm) !== JSON.stringify(addressForm)) {
        setAddressForm(newForm);
      }
    }
  }, [userPreferences?.savedAddresses?.[0]?.pincode]);
  
  const cartSummary = getCartSummary();
  const { total, subtotal, deliveryFee, discount = 0 } = cartSummary;
  
  useEffect(() => {
    // Redirect if cart is empty
    if (cart.length === 0 && activeStep !== 4) {
      router.push('/cart');
    }
  }, [cart, activeStep, router]);
  
  useEffect(() => {
    // Initialize form with saved address if available
    if (userLocation) {
      setAddressForm(prev => ({
        ...prev,
        address: userLocation.address,
        pincode: userLocation.pincode,
        city: userLocation.city || '',
        state: userLocation.state || '',
      }));
    }
    
    if (userPreferences?.contactNumber) {
      setAddressForm(prev => ({
        ...prev,
        contactNumber: userPreferences.contactNumber || prev.contactNumber || '',
        name: userPreferences.savedAddresses?.[0]?.name || prev.name,
      }));
    }
  }, [userLocation, userPreferences]);
  
  
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, contactNumber, ...address } = addressForm;
    
    // Create updated address object
    const updatedAddress: UserLocation = {
      ...(userLocation || { address: '', pincode: '' } as UserLocation),
      ...address,
      name,
      phone: contactNumber,
    };

    // Update user preferences with the new address
    updateUserPreferences({
      contactNumber,
      savedAddresses: [
        updatedAddress,
        ...(userPreferences?.savedAddresses || [])
          .filter(addr => addr.pincode !== address.pincode)
          .slice(0, 4) // Keep max 5 addresses
      ]
    });
    
    setActiveStep(2);
  };
  
  const handlePayment = async () => {
    try {
      const result = await checkout(paymentMethod);
      if (result.success) {
        setActiveStep(4); // Show success screen
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };
  
  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name">Full Name</label>
                    <Input
                      id="name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact">Contact Number</label>
                    <Input
                      id="contact"
                      type="tel"
                      value={addressForm.contactNumber}
                      onChange={(e) => setAddressForm({...addressForm, contactNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="address">Complete Address</label>
                  <Input
                    id="address"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="pincode">Pincode</label>
                    <Input
                      id="pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city">City</label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="state">State</label>
                    <Input
                      id="state"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full mt-4">
                  Deliver to this address
                </Button>
              </form>
            </CardContent>
          </Card>
        );
        
      case 2:
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Delivery Slot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {deliverySlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedDeliverySlot === slot.id ? 'default' : 'outline'}
                    onClick={() => setSelectedDeliverySlot(slot.id)}
                    disabled={!slot.available}
                  >
                    {slot.display}
                  </Button>
                ))}
              </div>
              <Button 
                onClick={() => setActiveStep(3)} 
                disabled={!selectedDeliverySlot}
                className="w-full mt-6"
              >
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        );
        
      case 3:
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t my-2"></div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Select Payment Method</h3>
                  <div className="space-y-2">
                    {['Credit/Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery'].map((method) => (
                      <div 
                        key={method}
                        className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === method ? 'border-primary' : ''}`}
                        onClick={() => setPaymentMethod(method)}
                      >
                        {method}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handlePayment} 
                    disabled={!paymentMethod || isLoading}
                    className="w-full mt-4"
                  >
                    {isLoading ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case 4:
        return (
          <div className="text-center py-12">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-8">Your order has been placed and is being processed.</p>
            <div className="space-x-4">
              <Button onClick={() => router.push('/orders')}>
                View Orders
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Continue Shopping
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeStep >= step ? 'bg-primary text-white' : 'bg-gray-200'
                  }`}
                >
                  {step}
                </div>
                <span className="text-sm mt-2">
                  {['Address', 'Delivery', 'Payment', 'Confirm'][step - 1]}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(activeStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {renderStep()}
      </div>
    </div>
  );
};

export default CheckoutPage;
