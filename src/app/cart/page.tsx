"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

// Create Separator component since it doesn't exist
const Separator = ({ className = "" }: { className?: string }) => (
  <div className={`h-px bg-border ${className}`} />
);

const CartPage = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal
  } = useCart();

  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");

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

  // Check if user is authenticated and handle cart actions
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast("Please add items to your cart before checkout");
      return;
    }
    // Allow both logged-in and guest users to proceed to checkout
    router.push('/checkout');
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
      <div className="app-surface">
        <div className="app-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="app-title mb-2">Your cart is empty</h2>
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
    <div className="app-surface cart-page">
      <div className="app-container">
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
              <h1 className="app-title">Shopping Cart</h1>
              <p className="app-subtitle">{getCartItemsCount()} items in your cart</p>
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
                              <span className="text-lg font-bold text-primary">
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
                            <p className="font-bold text-lg text-primary">
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
                            ? "border-primary bg-primary/5"
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
                            className="text-primary"
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
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Fresh delivery guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Same day delivery available</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;