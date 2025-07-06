"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { CartItem as ContextCartItem } from "@/context/CartContext";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CreditCard,
  Truck,
  Clock,
  Star,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Mail,
  Gift,
  Tag,
  Heart,
  Share2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Create Textarea component since it doesn't exist
const Textarea = ({ className = "", rows = 3, ...props }: any) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    rows={rows}
    {...props}
  />
);

// Create Separator component since it doesn't exist
const Separator = ({ className = "" }: { className?: string }) => (
  <div className={`h-px bg-border ${className}`} />
);

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
}

const CartPage = () => {
  const { user } = useAuth();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal
  } = useCart();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    notes: ""
  });
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");

  // Add login-required check
  const [loginRequired, setLoginRequired] = useState(false);

  // Helper function to get cart items count
  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const deliveryOptions = [
    {
      id: "express",
      name: "Express Delivery",
      description: "Within 2-4 hours",
      price: 99,
      icon: <Clock className="w-5 h-5" />
    },
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Next day delivery",
      price: 49,
      icon: <Truck className="w-5 h-5" />
    },
    {
      id: "scheduled",
      name: "Scheduled Delivery",
      description: "Choose your time slot",
      price: 79,
      icon: <MapPin className="w-5 h-5" />
    }
  ];

  const promoCodes = [
    { code: "FRESH20", discount: 20, minOrder: 500 },
    { code: "SEAFOOD15", discount: 15, minOrder: 300 },
    { code: "NEWUSER25", discount: 25, minOrder: 750 }
  ];

  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
    toast.success("Quantity updated");
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast.success("Item removed from cart");
  };

  const handleApplyPromo = () => {
    const promo = promoCodes.find(p => p.code === promoCode.toUpperCase());
    const cartTotal = getCartTotal(cart);
    
    if (!promo) {
      toast.error("Invalid promo code");
      return;
    }
    
    if (cartTotal < promo.minOrder) {
      toast.error(`Minimum order of ₹${promo.minOrder} required for this promo`);
      return;
    }
    
    setPromoDiscount(promo.discount);
    toast.success(`${promo.discount}% discount applied!`);
  };

  const handleCheckout = async () => {
    if (!validateCustomerInfo()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        items: cart,
        customer: customerInfo,
        total: getFinalTotal(),
        deliveryMethod,
        promoCode: promoDiscount > 0 ? promoCode : null,
        discount: promoDiscount
      };
      
      console.log("Order placed:", orderData);
      
      clearCart();
      toast.success("Order placed successfully!");
      router.push("/order-confirmation");
      
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is authenticated and handle cart actions
  const handleProceedToCheckout = () => {
    if (!user) {
      // If not logged in, redirect to login page with a return path
      router.push(`/auth/login?returnTo=${encodeURIComponent('/checkout')}`);
      toast("Please log in to continue with checkout");
      return;
    }
    
    // Check if there's at least one item in the cart
    if (cart.length === 0) {
      toast("Please add items to your cart before checkout");
      return;
    }
    
    // Redirect to checkout page
    router.push('/checkout');
  };

  // Redirect to login
  const redirectToLogin = () => {
    // Encode the current URL to redirect back after login
    const returnUrl = encodeURIComponent(window.location.pathname);
    router.push(`/auth/login?redirect=${returnUrl}`);
  };

  const validateCustomerInfo = () => {
    const required = ['name', 'email', 'phone', 'address', 'city', 'pincode'];
    const missing = required.filter(field => !customerInfo[field as keyof CustomerInfo]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    if (!/^\d{10}$/.test(customerInfo.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    
    return true;
  };

  const getSubtotal = () => getCartTotal(cart);
  const getDeliveryCharge = () => deliveryOptions.find(d => d.id === deliveryMethod)?.price || 0;
  const getDiscountAmount = () => (getSubtotal() * promoDiscount) / 100;
  const getFinalTotal = () => getSubtotal() + getDeliveryCharge() - getDiscountAmount();

  const renderCartItemActions = (item: ContextCartItem) => (
    <div className="flex items-center gap-2 item-actions">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
        disabled={item.quantity <= 1}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-8 text-center font-medium">{item.quantity}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-3 w-3" />
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleRemoveItem(item.id)}
        className="h-8 w-8 p-0 ml-2"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some fresh seafood to get started!</p>
              <Link href="/">
                <Button className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 cart-page">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600">{getCartItemsCount()} items in your cart</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => clearCart()}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 cart-items">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white hover:shadow-md transition-all"
                    >
                      {/* Product Image */}
                      <div className="relative w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.src}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 96px"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.type}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {item.netWeight}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-blue-600">
                                ₹{item.price}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">per piece</p>
                          </div>
                        </div>

                        {/* Product Benefits */}
                        <div className="flex flex-wrap gap-1">
                          {item.benefits?.slice(0, 3).map((benefit, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between pt-2">
                          {renderCartItemActions(item)}
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="font-bold text-lg text-blue-600">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Promo Code Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleApplyPromo} variant="outline">
                    Apply
                  </Button>
                </div>
                {promoDiscount > 0 && (
                  <div className="mt-2 text-green-600 text-sm">
                    ✓ {promoDiscount}% discount applied
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Options */}
                <div>
                  <h4 className="font-medium mb-3">Delivery Options</h4>
                  <div className="space-y-2">
                    {deliveryOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                          deliveryMethod === option.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="delivery"
                            value={option.id}
                            checked={deliveryMethod === option.id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryMethod(e.target.value)}
                            className="text-blue-600"
                          />
                          {option.icon}
                          <div>
                            <div className="font-medium text-sm">{option.name}</div>
                            <div className="text-xs text-gray-600">{option.description}</div>
                          </div>
                        </div>
                        <span className="font-medium">₹{option.price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>₹{getDeliveryCharge()}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({promoDiscount}%)</span>
                      <span>-₹{getDiscountAmount().toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{getFinalTotal().toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full proceed-button bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>

                {/* Trust Indicators */}
                <div className="pt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Fresh delivery guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Same day delivery available</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Form */}
            <AnimatePresence>
              {showCheckout && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Delivery Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Name *</label>
                          <Input
                            value={customerInfo.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone *</label>
                          <Input
                            value={customerInfo.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="10-digit mobile number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Email *</label>
                        <Input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Address *</label>
                        <Textarea
                          value={customerInfo.address}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Complete delivery address"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">City *</label>
                          <Input
                            value={customerInfo.city}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Your city"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Pincode *</label>
                          <Input
                            value={customerInfo.pincode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerInfo(prev => ({ ...prev, pincode: e.target.value }))}
                            placeholder="6-digit pincode"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Special Instructions</label>
                        <Textarea
                          value={customerInfo.notes}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any special delivery instructions..."
                          rows={2}
                        />
                      </div>

                      <Button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="w-full proceed-button"
                        size="lg"
                      >
                        {isLoading ? "Processing..." : `Place Order - ₹${getFinalTotal().toLocaleString()}`}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Login Required Modal */}
        {loginRequired && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-semibold mb-2">Login Required</h3>
              <p className="text-gray-600 mb-4">
                Please log in to continue with your purchase. Create an account to track your orders and manage your delivery preferences.
              </p>
              <div className="flex gap-3 mt-4">
                <Button 
                  onClick={() => setLoginRequired(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={redirectToLogin}
                  className="flex-1 bg-tendercuts-red hover:bg-tendercuts-red-dark text-white"
                >
                  Login or Register
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;