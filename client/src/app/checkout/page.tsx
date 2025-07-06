'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CheckCircle, ChevronRight, CreditCard, Truck, Wallet, MapPin, Clock, Banknote, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import LocationFormatter from '@/components/address/LocationFormatter';
import OrderSuccess from '@/components/checkout/OrderSuccess';
import { useSound } from '@/hooks/useOrderEffects';
import { ORDER_SUCCESS_SOUND_BASE64 } from '@/config/sounds';
import { addressManager, Address, useAddressSync } from '@/utils/addressSync';

// Types
type CheckoutStep = 'address' | 'delivery' | 'payment' | 'review';

interface DeliverySlot {
  id: string;
  display: string;
  available: boolean;
}

interface OrderSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

// Mock data for delivery slots
const deliverySlots: DeliverySlot[] = [
  { id: 'morning', display: 'Morning (9 AM - 12 PM)', available: true },
  { id: 'afternoon', display: 'Afternoon (12 PM - 4 PM)', available: true },
  { id: 'evening', display: 'Evening (4 PM - 8 PM)', available: true },
];

// Payment methods
const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', icon: <Wallet className="w-5 h-5" /> },
  { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'upi', name: 'UPI Payment', icon: <Truck className="w-5 h-5" /> },
];

const CheckoutPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { cart: cartItems, getCartTotal, clearCart } = useCart();
  const [isClient, setIsClient] = useState(false);
  
  // Use address sync hook for seamless address management
  const {
    addresses: savedAddresses,
    defaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    validateAddress,
    formatAddress
  } = useAddressSync();
  
  // State for checkout steps
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('address');
  
  // Function to navigate between steps
  const goToStep = (step: CheckoutStep) => {
    setCheckoutStep(step);
  };
  
  // State for address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Handle address selection
  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };
  
  // State for delivery slots
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState<string | null>(null);
  
  // Handle delivery slot selection
  const handleDeliverySlotSelect = (slotId: string) => {
    setSelectedDeliverySlot(slotId);
  };
  
  // State for payment
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  
  // State for order processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  
  // Initialize sound effect
  const { play: playSuccessSound } = useSound('/sounds/order-success.mp3');
  
  // Form data for new address
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    name: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home',
    isDefault: false
  });
  
  // Order summary
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    discount: 0,
    deliveryFee: 40,
    total: 0
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle address form submission
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form using address manager
    const errors = validateAddress(formData);
    if (errors.length > 0) {
      toast.error(errors[0]); // Show first error
      return;
    }
    
    let savedAddress: Address;
    
    if (editingAddress) {
      // Update existing address
      const updated = updateAddress(editingAddress.id, formData);
      if (!updated) return;
      savedAddress = updated;
    } else {
      // Create new address
      savedAddress = addAddress(formData);
    }
    
    // Set as selected address
    setSelectedAddress(savedAddress);
    setShowAddressForm(false);
    setEditingAddress(null);
    
    // Reset form
    setFormData({
      name: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      type: 'home',
      isDefault: false
    });
  };

  // Handle edit address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phoneNumber: address.phoneNumber,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: address.type || 'home',
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  // Handle delete address
  const handleDeleteAddress = (addressId: string) => {
    const success = deleteAddress(addressId);
    
    if (success && selectedAddress?.id === addressId) {
      // If deleted address was selected, select default or first available
      const newDefault = defaultAddress || savedAddresses[0];
      setSelectedAddress(newDefault || null);
    }
  };

  // Update order summary when cart changes
  useEffect(() => {
    if (isClient) {
      const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const finalDeliveryFee = cartTotal > 500 ? 0 : 49; // Assuming 49 is the default delivery fee
      
      setOrderSummary(prev => ({
        ...prev,
        subtotal: cartTotal,
        deliveryFee: finalDeliveryFee,
        total: cartTotal + finalDeliveryFee - prev.discount
      }));
    }
  }, [cartItems, isClient]);

  // Set client-side flag and initialize addresses
  useEffect(() => {
    setIsClient(true);
    
    // Initialize addresses with user data
    addressManager.initializeWithMockData({
      name: user?.name,
      phoneNumber: user?.phoneNumber
    });
    
    // Set default address as selected if none selected
    if (!selectedAddress && defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [user, defaultAddress, selectedAddress]);

  // Update selected address when default changes
  useEffect(() => {
    if (!selectedAddress && defaultAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress, selectedAddress]);

  // Handle hydration and authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, isAuthenticated, router]);

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedDeliverySlot || !paymentMethod) {
      toast.error('Please complete all checkout steps');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Calculate order totals
      const { subtotal, deliveryFee, discount, total } = calculateOrderSummary();
      
      // Prepare order data for API
      const orderRequestData = {
        userId: user?.id || 'guest-user', // Handle guest checkout if needed
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: (item as any).image || (item as any).imageUrl || ''
        })),
        totalAmount: total,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentMethod: paymentMethod,
        shippingAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phoneNumber,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        },
        deliverySlot: deliverySlots.find(slot => slot.id === selectedDeliverySlot)?.display,
        orderDate: new Date().toISOString()
      };

      // Try to use real API endpoint, fallback to demo endpoint, then to mock for demo purposes
      let order;
      try {
        // First try authenticated endpoint
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify(orderRequestData)
        });
        
        if (!response.ok) {
          throw new Error('API order creation failed');
        }
        
        order = await response.json();
      } catch (apiError) {
        console.warn('Failed to create order via authenticated API, trying demo endpoint:', apiError);
        
        try {
          // Try demo endpoint as fallback
          const demoResponse = await fetch('/api/orders/demo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderRequestData)
          });
          
          if (!demoResponse.ok) {
            throw new Error('Demo API order creation failed');
          }
          
          order = await demoResponse.json();
        } catch (demoError) {
          console.warn('Failed to create order via demo API, using mock data:', demoError);
          // Last resort: client-side mock
          order = {
            id: `ORD-${Math.floor(Math.random() * 10000)}`,
            trackingNumber: `TRK${Math.floor(Math.random() * 100000)}`,
            status: 'confirmed',
            estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString(), // 45 minutes from now
            ...orderRequestData
          };
        }
      }
      
      // Store order in localStorage for tracking/demo purposes
      localStorage.setItem('recentOrder', JSON.stringify(order));
      
      // Clear cart after successful order
      localStorage.removeItem('cartItems');
      // Use cart context to clear cart if available
      if (clearCart) {
        clearCart();
      }
      
      // Set order data for success screen
      setOrderData(order);
      setOrderSuccess(true);
      
      // Play success sound
      playSuccessSound();
      
      // Don't immediately redirect - show success screen first
      toast.success(`Order placed successfully! Tracking number: ${order.trackingNumber || order.id}`);
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error('An error occurred while placing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format price helper
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate order summary
  const calculateOrderSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 500 ? 0 : 49;
    const discount = orderSummary.discount;
    const total = subtotal + deliveryFee - discount;

    return { subtotal, deliveryFee, discount, total };
  };

  const { subtotal, deliveryFee, discount, total } = calculateOrderSummary();

  // Handle step navigation with type safety
  const handleNextStep = () => {
    switch (checkoutStep) {
      case 'address':
        if (selectedAddress) goToStep('delivery');
        break;
      case 'delivery':
        if (selectedDeliverySlot) goToStep('payment');
        break;
      case 'payment':
        goToStep('review');
        break;
      case 'review':
        // Handle order placement
        handlePlaceOrder();
        break;
    }
  };

  // Helper functions for the checkout button
  const canProceed = () => {
    switch (checkoutStep) {
      case 'address':
        return !!selectedAddress;
      case 'delivery':
        return !!selectedDeliverySlot;
      case 'payment':
        return !!paymentMethod;
      case 'review':
        return !!selectedAddress && !!selectedDeliverySlot && !!paymentMethod;
      default:
        return false;
    }
  };

  const getNextButtonText = () => {
    switch (checkoutStep) {
      case 'address':
        return 'Continue to Delivery Time';
      case 'delivery':
        return 'Continue to Payment';
      case 'payment':
        return 'Review Order';
      case 'review':
        return isProcessing ? 'Processing...' : 'Place Order';
      default:
        return 'Continue';
    }
  };

  // Render the checkout steps
  const renderStepContent = () => {
    switch (checkoutStep) {
      case 'address':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Delivery Address</h2>
              
              {savedAddresses.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium">Saved Addresses</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {savedAddresses.map((address) => (
                      <div 
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAddress?.id === address.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAddressSelect(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{address.name}</h4>
                              {address.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>{address.address}</p>
                              <p>{address.city}, {address.state} - {address.pincode}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Phone: {address.phoneNumber}</p>
                            
                            {/* Edit/Delete buttons */}
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(address);
                                }}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </button>
                              {savedAddresses.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this address?')) {
                                      handleDeleteAddress(address.id);
                                    }
                                  }}
                                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-200 hover:border-red-300 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>
                              )}
                              {!address.isDefault && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDefaultAddress(address.id);
                                    setSelectedAddress(address);
                                  }}
                                  className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded border border-green-200 hover:border-green-300 transition-colors"
                                >
                                  Set Default
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <span>+ Add New Address</span>
                </button>

                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="mt-4 space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="font-medium text-gray-900">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          required
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                          Address Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="home">🏠 Home</option>
                          <option value="work">🏢 Work</option>
                          <option value="other">📍 Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Complete Address *
                        </label>
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          required
                          placeholder="House/Flat number, Street name, Area"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <Input
                          id="state"
                          name="state"
                          type="text"
                          required
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <Input
                          id="pincode"
                          name="pincode"
                          type="text"
                          required
                          value={formData.pincode}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          id="isDefault"
                          name="isDefault"
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                          Set as default address
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setFormData({
                            name: '',
                            phoneNumber: '',
                            address: '',
                            city: '',
                            state: '',
                            pincode: '',
                            type: 'home',
                            isDefault: false
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingAddress ? 'Update Address' : 'Save Address'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => handleNextStep()}
                disabled={!selectedAddress}
              >
                Continue to Delivery
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'delivery':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Choose Delivery Slot</h2>
              <div className="space-y-4">
                <h3 className="font-medium">Available Time Slots</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {deliverySlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleDeliverySlotSelect(slot.id)}
                      disabled={!slot.available}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedDeliverySlot === slot.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!slot.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${
                          selectedDeliverySlot === slot.id 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedDeliverySlot === slot.id && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{slot.display}</p>
                          {!slot.available && (
                            <p className="text-xs text-red-500 mt-1">Not available</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCheckoutStep('address')}
              >
                Back
              </Button>
              <Button 
                onClick={() => handleNextStep()}
                disabled={!selectedDeliverySlot}
              >
                Continue to Payment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Select Payment Method</h2>
              
              <Tabs defaultValue="online" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="online" onClick={() => setPaymentMethod('online')}>
                    Online Payment
                  </TabsTrigger>
                  <TabsTrigger value="cod" onClick={() => setPaymentMethod('cod')}>
                    Cash on Delivery
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="online" className="mt-6">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-medium">Credit/Debit Card</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        <Input placeholder="Card Number" className="w-full" />
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="MM/YY" />
                          <Input placeholder="CVV" />
                        </div>
                        <Input placeholder="Name on Card" />
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="font-medium">UPI</span>
                      </div>
                      <div className="mt-4">
                        <Input placeholder="Enter UPI ID" className="w-full" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cod" className="mt-6">
                  <div className="border rounded-lg p-6 text-center">
                    <Truck className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Pay with Cash on Delivery</h3>
                    <p className="text-gray-600 mb-4">
                      Pay when you receive your order
                    </p>
                    <p className="text-sm text-gray-500">
                      An additional ₹20 will be charged for cash payment
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCheckoutStep('delivery')}
              >
                Back
              </Button>
              <Button 
                onClick={() => handleNextStep()}
                disabled={!paymentMethod}
              >
                Review Order
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Delivery Address</h3>
                  <div className="border rounded-lg p-4">
                    <p className="font-medium">{selectedAddress?.name}</p>
                    <div className="text-sm text-gray-600">
                      <LocationFormatter coordinates={selectedAddress?.address || null} />
                      <p>{selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}</p>
                    </div>
                    <p className="text-gray-600">Phone: {selectedAddress?.phoneNumber}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Delivery Slot</h3>
                  <div className="border rounded-lg p-4">
                    {deliverySlots.find(slot => slot.id === selectedDeliverySlot)?.display || 'Not selected'}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Payment Method</h3>
                  <div className="border rounded-lg p-4">
                    {paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="border rounded-lg p-4 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                            <Image 
                              src={item.src} 
                              alt={item.name} 
                              width={48} 
                              height={48}
                              className="object-cover h-full w-full"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    ))}

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₹{discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCheckoutStep('payment')}
              >
                Back
              </Button>
              <Button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Handle viewing tracking from success screen
  const handleViewTracking = () => {
    if (orderData) {
      router.push(`/track-order?id=${orderData.id}`);
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show order success screen
  if (orderSuccess && orderData) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <OrderSuccess
          orderId={orderData.id}
          trackingNumber={orderData.trackingNumber}
          onViewTracking={handleViewTracking}
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
        
        {/* Checkout Progress */}
        <div className="flex justify-between items-center mb-8">
          {[
            { step: 'address', label: '1', display: 'Address' },
            { step: 'delivery', label: '2', display: 'Delivery' },
            { step: 'payment', label: '3', display: 'Payment' },
            { step: 'review', label: '4', display: 'Review' }
          ].map((s, index) => (
            <div key={s.step} className="flex items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                (checkoutStep === s.step) || 
                (checkoutStep === 'delivery' && index === 0) ||
                (checkoutStep === 'payment' && index <= 1) ||
                (checkoutStep === 'review' && index <= 2)
                  ? 'bg-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {((checkoutStep === 'delivery' && index === 0) ||
                  (checkoutStep === 'payment' && index <= 1) ||
                  (checkoutStep === 'review' && index <= 2)) && checkoutStep !== s.step
                  ? <CheckCircle className="w-5 h-5" /> 
                  : s.label}
              </div>
              {index < 3 && (
                <div className={`w-full h-1 ${
                  (checkoutStep === 'delivery' && index === 0) ||
                  (checkoutStep === 'payment' && index <= 1) ||
                  (checkoutStep === 'review' && index <= 2)
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                }`} style={{ width: '50px' }}></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Step 1: Delivery Address */}
        {checkoutStep === 'address' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-blue-600" />
              <h2 className="text-xl font-semibold">Delivery Address</h2>
            </div>
            
            <div className="space-y-4">
              {/* Mock addresses - in a real app, these would come from the user's saved addresses */}
              {savedAddresses.length === 0 && (
                <>
                  {[
                    {
                      id: '1',
                      name: 'John Doe',
                      phoneNumber: '9876543210',
                      address: '123 Main Street, Apartment 4B',
                      city: 'Chennai',
                      state: 'Tamil Nadu',
                      pincode: '600001',
                      type: 'home' as const,
                      isDefault: true
                    },
                    {
                      id: '2',
                      name: 'John Doe',
                      phoneNumber: '9876543210',
                      address: '456 Business District, Office Complex',
                      city: 'Chennai', 
                      state: 'Tamil Nadu',
                      pincode: '600002',
                      type: 'work' as const,
                      isDefault: false
                    }
                  ].map((address) => (
                    <div 
                      key={address.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedAddress?.id === address.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{address.isDefault ? 'Home (Default)' : 'Office'}</p>
                          <div className="text-sm text-gray-600 mt-1">
                            <p>{address.address}</p>
                            <p>{address.city}, {address.state} - {address.pincode}</p>
                            <p>Phone: {address.phoneNumber}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-blue-600 hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAddress(address);
                          }}
                        >
                          Deliver Here <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {/* Saved addresses from localStorage/API */}
              {savedAddresses.map((address) => (
                <div 
                  key={address.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedAddress?.id === address.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setSelectedAddress(address)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{address.name}</p>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} - {address.pincode}</p>
                        <p>Phone: {address.phoneNumber}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAddress(address);
                      }}
                    >
                      Deliver Here <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push('/account/addresses?redirect=/checkout')}
              >
                + Add New Address
              </Button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => setCheckoutStep('delivery')}
                disabled={!selectedAddress}
                className="px-6"
              >
                Continue to Delivery Time
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 2: Delivery Time */}
        {checkoutStep === 'delivery' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-blue-600" />
              <h2 className="text-xl font-semibold">Delivery Time</h2>
            </div>
            
            <div className="space-y-3">
              {deliverySlots.map((slot) => (
                <div 
                  key={slot.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedDeliverySlot === slot.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setSelectedDeliverySlot(slot.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Clock className="text-blue-600 w-5 h-5" />
                      <span>{slot.display}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeliverySlot(slot.id);
                      }}
                    >
                      Select <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCheckoutStep('address')}
              >
                Back
              </Button>
              <Button 
                onClick={() => setCheckoutStep('payment')}
                disabled={!selectedDeliverySlot}
                className="px-6"
              >
                Continue to Payment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 3: Payment Method */}
        {checkoutStep === 'payment' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-blue-600" />
              <h2 className="text-xl font-semibold">Payment Method</h2>
            </div>
            
            <div className="space-y-3">
              {['online', 'cod'].map((method) => (
                <div 
                  key={method} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {method === 'online' ? (
                        <>
                          <CreditCard className="text-blue-600 w-5 h-5" />
                          <span>Online Payment (Card/UPI/Netbanking)</span>
                        </>
                      ) : (
                        <>
                          <Truck className="text-blue-600 w-5 h-5" />
                          <span>Cash on Delivery</span>
                        </>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentMethod(method);
                      }}
                    >
                      Select <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCheckoutStep('delivery')}
              >
                Back
              </Button>
              <Button 
                onClick={() => setCheckoutStep('review')}
                disabled={!paymentMethod}
                className="px-6"
              >
                Review Order
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 4: Order Review */}
        {checkoutStep === 'review' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Order Review</h2>
            
            <div className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Items ({cartItems.length})</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100">
                        <Image 
                          src={item.src} 
                          alt={item.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.type} • {item.netWeight}</p>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm">{item.quantity} × {formatPrice(item.price)}</p>
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Delivery Details */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-3">Delivery Details</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Home</p>
                      <div className="text-sm text-gray-600 text-sm mt-1">
                        <LocationFormatter coordinates={selectedAddress?.address || null} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <p className="text-sm text-gray-600">{deliverySlots.find(s => s.id === selectedDeliverySlot)?.display}</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-3">Payment Method</h3>
                <div className="flex items-center gap-2">
                  {paymentMethod === 'online' ? (
                    <>
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <p className="text-sm text-gray-600">Online Payment</p>
                    </>
                  ) : (
                    <>
                      <Truck className="w-5 h-5 text-gray-500" />
                      <p className="text-sm text-gray-600">Cash on Delivery</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm">{formatPrice(subtotal)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Delivery Fee</p>
                    <p className="text-sm">{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</p>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Discount</p>
                      <p className="text-sm text-green-600">-{formatPrice(discount)}</p>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <p>Total</p>
                    <p className="text-blue-600">{formatPrice(total)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCheckoutStep('payment')}
              >
                Back
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isProcessing}
                onClick={handlePlaceOrder}
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </div>
        )}
        
        {/* Side Cart Summary - Only shows when not on review step */}
        {checkoutStep !== 'review' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <span className="text-sm text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p>{formatPrice(subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Delivery Fee</p>
                <p>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</p>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <p className="text-gray-600">Discount</p>
                  <p className="text-green-600">-{formatPrice(discount)}</p>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <p>Total</p>
                <p className="text-blue-600">{formatPrice(total)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
