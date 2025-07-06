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
import { addressManager, Address, useAddressSync } from "@/utils/addressSync";

const addressTypes = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'work', label: 'Work', icon: Briefcase },
  { value: 'other', label: 'Other', icon: Building }
];

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  
  // Use address sync hook for seamless sync with checkout
  const {
    addresses,
    defaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    validateAddress,
    formatAddress
  } = useAddressSync();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phoneNumber: "",
    type: "home" as 'home' | 'work' | 'other',
    isDefault: false
  });
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/addresses');
    }
  }, [loading, isAuthenticated, router]);

  // Handle input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  // Save address
  const handleSaveAddress = async () => {
    // Validate form using address manager
    const errors = validateAddress(formData);
    if (errors.length > 0) {
      toast.error(errors[0]); // Show first error
      return;
    }

    setIsSubmitting(true);
    try {
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
      
      resetForm();
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
      const success = deleteAddress(addressId);
      if (!success) {
        toast.error("Failed to delete address");
      }
    } catch (error) {
      console.error('Delete address error:', error);
      toast.error("Failed to delete address");
    }
  };

  // Set default address
  const handleSetDefault = async (addressId: string) => {
    try {
      const success = setDefaultAddress(addressId);
      if (!success) {
        toast.error("Failed to set default address");
      }
    } catch (error) {
      console.error('Set default error:', error);
      toast.error("Failed to set default address");
    }
  };
  // Edit address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phoneNumber: address.phoneNumber,
      type: address.type,
      isDefault: address.isDefault
    });
    setShowAddForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phoneNumber: "",
      type: "home",
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddForm(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Saved Addresses</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your delivery addresses</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 flex items-center justify-center space-x-2 w-full sm:w-auto"
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
                  <Label>Address Type</Label>
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
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="House/Flat number, Street name, Area"
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
                    placeholder="600001"
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
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
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
              <p className="text-gray-600 mb-4">
                Add your first delivery address to start shopping
              </p>
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="bg-red-600 hover:bg-red-700"
              >
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => {
              const TypeIcon = addressTypes.find(t => t.value === address.type)?.icon || Home;
              
              return (
                <Card key={address.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <TypeIcon className="h-5 w-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">{address.name}</h3>
                          {address.isDefault && (
                            <Badge className="bg-red-100 text-red-600">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-1">{address.address}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.pincode}
                        </p>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                          className="flex items-center space-x-1 flex-1 sm:flex-none"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                        
                        {!address.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(address.id)}
                            className="flex items-center space-x-1 flex-1 sm:flex-none"
                          >
                            <Star className="h-4 w-4" />
                            <span>Set Default</span>
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </div>
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
