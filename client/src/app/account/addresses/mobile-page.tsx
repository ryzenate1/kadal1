"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Edit, Trash, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast-notification";
import Link from "next/link";
import { Address } from "@/components/account/AddressFormDialog";
import { AddressFormDialog } from "@/components/address/AddressFormDialog";

// Mock addresses for development
const mockAddresses: Address[] = [
  {
    id: "1",
    name: "Home",
    address: "123 Main Street, Apartment 4B",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
    isDefault: true
  },
  {
    id: "2",
    name: "Office",
    address: "456 Business Park, Tower 2, Floor 5",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600002",
    isDefault: false
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

interface MobileAddressesPageProps {
  addresses?: Address[];
  setAddresses?: React.Dispatch<React.SetStateAction<Address[]>>;
  isAddingAddress?: boolean;
  setIsAddingAddress?: React.Dispatch<React.SetStateAction<boolean>>;
  addressToEdit?: Address | null;
  setAddressToEdit?: React.Dispatch<React.SetStateAction<Address | null>>;
  onSaveAddress?: (address: Address) => void;
}

export default function MobileAddressesPage({
  addresses: propAddresses,
  setAddresses: propSetAddresses,
  isAddingAddress: propIsAddingAddress,
  setIsAddingAddress: propSetIsAddingAddress,
  addressToEdit: propAddressToEdit,
  setAddressToEdit: propSetAddressToEdit,
  onSaveAddress
}: MobileAddressesPageProps = {}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Always have fallback data
  const fallbackAddresses = mockAddresses;
  
  // Use props if provided, otherwise use local state
  const [localAddresses, setLocalAddresses] = useState(fallbackAddresses);
  const [localIsAddingAddress, setLocalIsAddingAddress] = useState(false);
  const [localAddressToEdit, setLocalAddressToEdit] = useState<Address | null>(null);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  
  // Determine whether to use props or local state
  // Always ensure we have addresses data - use fallback if nothing is provided
  const addresses = propAddresses?.length ? propAddresses : (localAddresses.length ? localAddresses : fallbackAddresses);
  const setAddresses = propSetAddresses || setLocalAddresses;
  const isAddingAddress = propIsAddingAddress !== undefined ? propIsAddingAddress : localIsAddingAddress;
  const setIsAddingAddress = propSetIsAddingAddress || setLocalIsAddingAddress;
  const addressToEdit = propAddressToEdit !== undefined ? propAddressToEdit : localAddressToEdit;
  const setAddressToEdit = propSetAddressToEdit || setLocalAddressToEdit;

  // Make sure we use mock data immediately and reliably
  useEffect(() => {
    // Always set mock data immediately for mobile
    setLocalAddresses(fallbackAddresses);
  }, []);

  const handleSetDefault = (id: string) => {
    // Set loading state
    setIsSettingDefault(id);
    
    // Immediately update the UI for better user experience
    setTimeout(() => {
      setAddresses(addresses.map(address => ({
        ...address,
        isDefault: address.id === id
      })));
      
      // Show feedback to user
      showToast({
        message: "Default address updated successfully",
        type: "success"
      });
      
      // Clear loading state and close the actions menu
      setIsSettingDefault(null);
      setShowActions(null);
    }, 600);
  };

  const handleDeleteAddress = (id: string | undefined) => {
    if (!id) return;
    
    // Set loading state
    setIsDeleting(id);
    
    // Simulate API call with delay
    setTimeout(() => {
      // Immediately update the UI for better user experience
      setAddresses(addresses.filter(address => address.id !== id));
      
      // Show feedback to user
      showToast({
        message: "Address deleted successfully",
        type: "success"
      });
      
      // Clear loading state and close the actions menu
      setIsDeleting(null);
      setShowActions(null);
    }, 600);
  };

  const toggleActions = (id: string) => {
    if (showActions === id) {
      setShowActions(null);
    } else {
      setShowActions(id);
    }
  };

  const handleEditAddress = (address: Address) => {
    // Make a deep copy of the address to avoid reference issues
    setAddressToEdit({...address});
    setIsAddingAddress(true);
    setShowActions(null);
  };
  
  const handleSaveAddress = (address: Address) => {
    // If parent component provided onSaveAddress, use that
    if (onSaveAddress) {
      onSaveAddress(address);
      return;
    }
    
    // Otherwise, handle locally
    if (addressToEdit) {
      // Update existing address
      setAddresses(addresses.map(a => 
        a.id === address.id ? address : a
      ));
      
      showToast({
        message: "Address updated successfully",
        type: "success"
      });
    } else {
      // Add new address
      // If this is the first address or marked as default, make it the default
      if (addresses.length === 0 || address.isDefault) {
        // Make this address the default and ensure no other address is default
        setAddresses([
          ...addresses.map(a => ({ ...a, isDefault: false })),
          { ...address, isDefault: true }
        ]);
      } else {
        // Just add the new address
        setAddresses([...addresses, address]);
      }
      
      showToast({
        message: "New address added successfully",
        type: "success"
      });
    }
    
    // Reset the editing state
    setAddressToEdit(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Back Button */}
      <div className="mb-4">
        <BackButton href="/account" label="Back to Account" />
      </div>
      
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 400, damping: 30 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
        <p className="text-gray-500 mt-1">Manage your delivery addresses</p>
      </motion.div>
      
      {/* Add Address Button */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-6"
      >
        <Button 
          onClick={() => setIsAddingAddress(true)}
          className="w-full bg-tendercuts-red hover:bg-tendercuts-red-dark shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </motion.div>
      
      {/* Addresses List */}
      {addresses.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {addresses.map((address) => (
            <motion.div
              key={address.id}
              variants={itemVariants}
              layout
              className="relative"
            >
              <Card 
                className={`overflow-hidden border ${address.isDefault ? 'border-tendercuts-red/30 shadow-sm' : 'border-gray-200'}`}
              >
                <CardContent className="p-0">
                  <button 
                    className="w-full text-left" 
                    onClick={() => address.id ? toggleActions(address.id) : null}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="bg-red-50 p-2 rounded-full mr-3 flex-shrink-0 mt-1">
                            <MapPin className="h-4 w-4 text-tendercuts-red" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">{address.name}</h3>
                              {address.isDefault && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-tendercuts-red">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-0.5">
                              <p className="line-clamp-1">{address.address}</p>
                              <p>{address.city}, {address.state} - {address.pincode}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Action Buttons - Only shown when address is selected */}
                  <AnimatePresence>
                    {showActions === address.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="border-t overflow-hidden"
                      >
                        <div className="p-3 bg-gray-50 grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center justify-center"
                            onClick={() => {
                              if (address && address.id) {
                                const addressToEdit = addresses.find(a => a.id === address.id);
                                if (addressToEdit) {
                                  handleEditAddress(addressToEdit);
                                }
                              }
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center justify-center text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (address && address.id) {
                                handleDeleteAddress(address.id);
                              }
                            }}
                            disabled={isDeleting === address.id}
                          >
                            {isDeleting === address.id ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-red-600 border-opacity-50 border-t-red-600 rounded-full mr-1"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash className="h-4 w-4 mr-1" />
                                Delete
                              </>
                            )}
                          </Button>
                          
                          {!address.isDefault && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="col-span-2 flex items-center justify-center text-tendercuts-red hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (address && address.id) {
                                  handleSetDefault(address.id);
                                }
                              }}
                              disabled={isSettingDefault === address.id}
                            >
                              {isSettingDefault === address.id ? (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-tendercuts-red border-opacity-50 border-t-tendercuts-red rounded-full mr-1"></div>
                                  Setting...
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Set as Default
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="overflow-hidden border border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-tendercuts-red" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No addresses saved</h3>
              <p className="text-gray-500 mt-1 text-center">Add a new address to get started</p>
              <Button 
                className="mt-6 bg-tendercuts-red hover:bg-tendercuts-red-dark shadow-sm"
                onClick={() => setIsAddingAddress(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Address Form Dialog */}
      <AddressFormDialog
        open={isAddingAddress}
        onOpenChange={(open) => {
          setIsAddingAddress(open);
          if (!open) setAddressToEdit(null);
        }}
        address={addressToEdit || undefined}
        onSave={handleSaveAddress}
      />
    </div>
  );
}
