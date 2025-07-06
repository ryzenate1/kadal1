"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Check,
  X,
  Star,
  Home,
  Building,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

const addressTypes = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'work', label: 'Work', icon: Briefcase },
  { value: 'other', label: 'Other', icon: Building }
];

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    type: "home" as 'home' | 'work' | 'other',
    isDefault: false
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/addresses');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/addresses');
      if (response.ok) {
        const addressesData = await response.json();
        setAddresses(addressesData);
      } else {
        throw new Error('Failed to fetch addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Mock data for development
      const mockAddresses: Address[] = [
        {
          id: "addr_001",
          name: "Home",
          address: "123 Main Street, Apartment 4B",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600001",
          type: "home",
          isDefault: true
        },
        {
          id: "addr_002",
          name: "Office",
          address: "456 Tech Park, 3rd Floor",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600113",
          type: "work",
          isDefault: false
        }
      ];
      setAddresses(mockAddresses);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      type: "home",
      isDefault: false
    });
    setShowAddForm(false);
    setEditingAddress(null);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Start editing address
  const startEdit = (address: Address) => {
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      type: address.type,
      isDefault: address.isDefault
    });
    setEditingAddress(address);
    setShowAddForm(true);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Address name is required");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!formData.state.trim()) {
      toast.error("State is required");
      return false;
    }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }
    return true;
  };

  // Save address
  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = editingAddress 
        ? `/api/user/addresses/${editingAddress.id}`
        : '/api/user/addresses';
      
      const method = editingAddress ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedAddress = await response.json();
        
        if (editingAddress) {
          setAddresses(prev => prev.map(addr => 
            addr.id === editingAddress.id ? savedAddress : addr
          ));
          toast.success("Address updated successfully!");
        } else {
          setAddresses(prev => [...prev, savedAddress]);
          toast.success("Address added successfully!");
        }
        
        resetForm();
        fetchAddresses(); // Refresh to ensure consistency
      } else {
        throw new Error('Failed to save address');
      }
    } catch (error) {
      console.error('Save address error:', error);
      toast.error("Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        toast.success("Address deleted successfully!");
      } else {
        throw new Error('Failed to delete address');
      }
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error("Failed to delete address");
    }
  };

  // Set default address
  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'POST'
      });

      if (response.ok) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        })));
        toast.success("Default address updated!");
      } else {
        throw new Error('Failed to set default address');
      }
    } catch (error) {
      console.error('Set default error:', error);
      toast.error("Failed to set default address");
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
              <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
              <p className="text-gray-600">Manage your delivery addresses</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Address</span>
          </Button>
        </div>

        {/* Add/Edit Address Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Address Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Home, Office"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Address Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Address Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {addressTypes.map((type) => (
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
              </div>

              {/* Full Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="House/Flat number, Street, Area"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    disabled={isSubmitting}
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Default Address Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="isDefault">Set as default address</Label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={handleSaveAddress}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {editingAddress ? 'Update' : 'Save'} Address
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

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
              <p className="text-gray-600 mb-4">Add your first delivery address to get started</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Add Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => {
              const AddressTypeIcon = addressTypes.find(type => type.value === address.type)?.icon || Home;
              
              return (
                <Card key={address.id} className={`relative ${address.isDefault ? 'ring-2 ring-red-500' : ''}`}>
                  <CardContent className="p-4">
                    {/* Default Badge */}
                    {address.isDefault && (
                      <Badge className="absolute top-2 right-2 bg-red-100 text-red-800">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}

                    {/* Address Type Icon & Name */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <AddressTypeIcon className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{address.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{address.type}</p>
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="text-sm text-gray-700 mb-4">
                      <p>{address.address}</p>
                      <p>{address.city}, {address.state} {address.pincode}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(address)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          className="flex-1"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Set Default
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
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
