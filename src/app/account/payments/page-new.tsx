"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Check,
  X,
  Star,
  Smartphone,
  Building,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  cardNumber?: string; // Last 4 digits only
  cardBrand?: string; // Visa, Mastercard, etc.
  cardHolderName?: string;
  expiryDate?: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string; // Last 4 digits only
  isDefault: boolean;
  nickname: string;
}

const paymentTypes = [
  { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'netbanking', label: 'Net Banking', icon: Building }
];

const cardBrands = ['Visa', 'Mastercard', 'RuPay', 'American Express'];

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "card" as 'card' | 'upi' | 'netbanking',
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cardBrand: "",
    upiId: "",
    bankName: "",
    accountNumber: "",
    nickname: "",
    isDefault: false
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/payments');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/payment-methods');
      if (response.ok) {
        const methodsData = await response.json();
        setPaymentMethods(methodsData);
      } else {
        throw new Error('Failed to fetch payment methods');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Mock data for development
      const mockMethods: PaymentMethod[] = [
        {
          id: "pm_001",
          type: "card",
          cardNumber: "4567",
          cardBrand: "Visa",
          cardHolderName: "Test User",
          expiryDate: "12/28",
          nickname: "Primary Card",
          isDefault: true
        },
        {
          id: "pm_002",
          type: "upi",
          upiId: "testuser@paytm",
          nickname: "Paytm UPI",
          isDefault: false
        }
      ];
      setPaymentMethods(mockMethods);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPaymentMethods();
    }
  }, [isAuthenticated]);

  // Reset form
  const resetForm = () => {
    setFormData({
      type: "card",
      cardNumber: "",
      cardHolderName: "",
      expiryDate: "",
      cardBrand: "",
      upiId: "",
      bankName: "",
      accountNumber: "",
      nickname: "",
      isDefault: false
    });
    setShowAddForm(false);
    setEditingMethod(null);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format card number for display
  const formatCardNumber = (number: string) => {
    return number.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  // Start editing payment method
  const startEdit = (method: PaymentMethod) => {
    setFormData({
      type: method.type,
      cardNumber: method.cardNumber || "",
      cardHolderName: method.cardHolderName || "",
      expiryDate: method.expiryDate || "",
      cardBrand: method.cardBrand || "",
      upiId: method.upiId || "",
      bankName: method.bankName || "",
      accountNumber: method.accountNumber || "",
      nickname: method.nickname,
      isDefault: method.isDefault
    });
    setEditingMethod(method);
    setShowAddForm(true);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.nickname.trim()) {
      toast.error("Nickname is required");
      return false;
    }

    if (formData.type === 'card') {
      if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 16) {
        toast.error("Please enter a valid 16-digit card number");
        return false;
      }
      if (!formData.cardHolderName.trim()) {
        toast.error("Card holder name is required");
        return false;
      }
      if (!formData.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        toast.error("Please enter expiry date in MM/YY format");
        return false;
      }
      if (!formData.cardBrand) {
        toast.error("Please select card brand");
        return false;
      }
    } else if (formData.type === 'upi') {
      if (!formData.upiId.trim() || !formData.upiId.includes('@')) {
        toast.error("Please enter a valid UPI ID");
        return false;
      }
    } else if (formData.type === 'netbanking') {
      if (!formData.bankName.trim()) {
        toast.error("Bank name is required");
        return false;
      }
      if (!formData.accountNumber.trim()) {
        toast.error("Account number is required");
        return false;
      }
    }

    return true;
  };

  // Save payment method
  const handleSaveMethod = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = editingMethod 
        ? `/api/user/payment-methods/${editingMethod.id}`
        : '/api/user/payment-methods';
      
      const method = editingMethod ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedMethod = await response.json();
        
        if (editingMethod) {
          setPaymentMethods(prev => prev.map(pm => 
            pm.id === editingMethod.id ? savedMethod : pm
          ));
          toast.success("Payment method updated successfully!");
        } else {
          setPaymentMethods(prev => [...prev, savedMethod]);
          toast.success("Payment method added successfully!");
        }
        
        resetForm();
        fetchPaymentMethods(); // Refresh to ensure consistency
      } else {
        throw new Error('Failed to save payment method');
      }
    } catch (error) {
      console.error('Save payment method error:', error);
      toast.error("Failed to save payment method");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete payment method
  const handleDeleteMethod = async (methodId: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;

    try {
      const response = await fetch(`/api/user/payment-methods/${methodId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== methodId));
        toast.success("Payment method deleted successfully!");
      } else {
        throw new Error('Failed to delete payment method');
      }
    } catch (error) {
      console.error('Delete payment method error:', error);
      toast.error("Failed to delete payment method");
    }
  };

  // Set default payment method
  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await fetch(`/api/user/payment-methods/${methodId}/default`, {
        method: 'POST'
      });

      if (response.ok) {
        setPaymentMethods(prev => prev.map(pm => ({
          ...pm,
          isDefault: pm.id === methodId
        })));
        toast.success("Default payment method updated!");
      } else {
        throw new Error('Failed to set default payment method');
      }
    } catch (error) {
      console.error('Set default error:', error);
      toast.error("Failed to set default payment method");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-gray-600">Manage your saved payment methods</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Method</span>
          </Button>
        </div>

        {/* Security Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Your payment information is secure</h3>
                <p className="text-sm text-blue-800">
                  We use industry-standard encryption to protect your payment details. 
                  Card numbers are masked and only the last 4 digits are stored.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Payment Method Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  placeholder="e.g., Primary Card, Work UPI"
                  disabled={isSubmitting}
                />
              </div>

              {/* Card Fields */}
              {formData.type === 'card' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={formatCardNumber(formData.cardNumber)}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardBrand">Card Brand</Label>
                      <Select
                        value={formData.cardBrand}
                        onValueChange={(value) => handleInputChange('cardBrand', value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {cardBrands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardHolderName">Card Holder Name</Label>
                      <Input
                        id="cardHolderName"
                        value={formData.cardHolderName}
                        onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                        placeholder="Name on card"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* UPI Fields */}
              {formData.type === 'upi' && (
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    value={formData.upiId}
                    onChange={(e) => handleInputChange('upiId', e.target.value)}
                    placeholder="yourname@paytm"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Net Banking Fields */}
              {formData.type === 'netbanking' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder="e.g., State Bank of India"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="Account number"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Default Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="isDefault">Set as default payment method</Label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={handleSaveMethod}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {editingMethod ? 'Update' : 'Save'} Method
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods saved</h3>
              <p className="text-gray-600 mb-4">Add your first payment method for faster checkout</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => {
              const MethodIcon = paymentTypes.find(type => type.value === method.type)?.icon || CreditCard;
              
              return (
                <Card key={method.id} className={`relative ${method.isDefault ? 'ring-2 ring-red-500' : ''}`}>
                  <CardContent className="p-4">
                    {/* Default Badge */}
                    {method.isDefault && (
                      <Badge className="absolute top-2 right-2 bg-red-100 text-red-800">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}

                    {/* Method Icon & Type */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <MethodIcon className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{method.nickname}</h3>
                        <p className="text-sm text-gray-600 capitalize">{method.type}</p>
                      </div>
                    </div>

                    {/* Method Details */}
                    <div className="text-sm text-gray-700 mb-4">
                      {method.type === 'card' && (
                        <>
                          <p>•••• •••• •••• {method.cardNumber}</p>
                          <p>{method.cardBrand} • Expires {method.expiryDate}</p>
                          <p>{method.cardHolderName}</p>
                        </>
                      )}
                      {method.type === 'upi' && (
                        <p>{method.upiId}</p>
                      )}
                      {method.type === 'netbanking' && (
                        <>
                          <p>{method.bankName}</p>
                          <p>•••• •••• •••• {method.accountNumber}</p>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(method)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                          className="flex-1"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Set Default
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMethod(method.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
