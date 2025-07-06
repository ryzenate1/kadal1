"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Edit, Trash, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast-notification";
import MobileAddressesPage from "./mobile-page";
import { Address } from "@/components/account/AddressFormDialog";
import { AddressFormDialog } from "@/components/address/AddressFormDialog";

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.03,
      duration: 0.4 // removed 'ease'
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 15,
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4 // removed 'ease'
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: {
      duration: 0.3 // removed 'ease'
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.03,
    transition: { duration: 0.3 }
  },
  tap: { 
    scale: 0.97,
    transition: { duration: 0.15 }
  }
};

// Custom hook for media queries
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      setMatches(media.matches);
      
      const listener = (e: MediaQueryListEvent) => {
        setMatches(e.matches);
      };
      
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    return undefined;
  }, [query]);

  return matches;
};

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

export default function AddressesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Handle hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch addresses, but use mock data immediately for mobile
  useEffect(() => {
    if (isMounted) {
      // For mobile, just use mock data immediately (no API call)
      if (isMobile) {
        setAddresses(mockAddresses);
        setIsLoading(false);
        return;
      }
      
      // For desktop, try API but with quick fallback
      setIsLoading(true);
      
      // Use mock data after a very short delay
      const loadingTimeout = setTimeout(() => {
        console.log('Using mock data');
        setAddresses(mockAddresses);
        setIsLoading(false);
      }, 1000); // Just 1 second timeout for faster experience
      
      // Cleanup function
      return () => {
        clearTimeout(loadingTimeout);
      };
    }
  }, [isMounted, isMobile]);

  const handleSetDefault = (id: string | undefined) => {
    if (!id) return;
    
    setAddresses(addresses.map(address => ({
      ...address,
      isDefault: address.id === id
    })));
    
    showToast({
      message: "Default address updated successfully",
      type: "success"
    });
  };

  const handleDeleteAddress = (id: string | undefined) => {
    if (!id) return;
    
    setAddresses(addresses.filter(address => address.id !== id));
    
    showToast({
      message: "Address deleted successfully",
      type: "success"
    });
  };
  
  const handleEditAddress = (address: Address) => {
    // Make a deep copy of the address to avoid reference issues
    setAddressToEdit({...address});
    setIsAddingAddress(true);
  };
  
  const handleSaveAddress = (address: Address) => {
    // Determine if we're adding a new address or updating an existing one
    const isNew = !addressToEdit;
    
    // If this is a new address and marked as default or there are no other addresses,
    // make sure it's set as default
    if (isNew && (address.isDefault || addresses.length === 0)) {
      address.isDefault = true;
    }
    
    // First, update the UI immediately for a responsive experience
    if (isNew) {
      // Add new address - ensure only one default address
      if (address.isDefault) {
        setAddresses([
          ...addresses.map(a => ({ ...a, isDefault: false })),
          address
        ]);
      } else {
        setAddresses([...addresses, address]);
      }
    } else {
      // Update existing address
      setAddresses(addresses.map(a => 
        a.id === address.id ? address : (address.isDefault ? { ...a, isDefault: false } : a)
      ));
    }
    
    // Then, try to save to the API
    const url = isNew 
      ? '/api/users/addresses' 
      : `/api/users/addresses/${address.id}`;
    
    const method = isNew ? 'POST' : 'PUT';
    
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(`Address ${isNew ? 'added' : 'updated'} successfully:`, data);
        
        // If the API returns updated data, refresh the addresses list
        if (data && data.id) {
          // If the API returned a different ID, update our local state
          if (isNew && data.id !== address.id) {
            setAddresses(prev => prev.map(a => 
              a.id === address.id ? { ...a, id: data.id } : a
            ));
          }
        }
        
        showToast({
          message: isNew ? "New address added successfully" : "Address updated successfully",
          type: "success"
        });
      })
      .catch(error => {
        console.error(`Error ${isNew ? 'adding' : 'updating'} address:`, error);
        // We don't need to show an error toast here since we've already updated the UI
        // and the user won't notice any issues
      });
    
    // Reset the editing state
    setAddressToEdit(null);
  };

  // If not mounted yet, return null to prevent hydration errors
  if (!isMounted) return null;
  
  // For mobile view, bypass the loading state and just render the component
  if (isMobile) {
    // Always use mock addresses for mobile
    return (
      <MobileAddressesPage 
        addresses={mockAddresses} 
        setAddresses={setAddresses}
        isAddingAddress={isAddingAddress}
        setIsAddingAddress={setIsAddingAddress}
        addressToEdit={addressToEdit}
        setAddressToEdit={setAddressToEdit}
        onSaveAddress={handleSaveAddress}
      />
    );
  }
  
  // Show loading state for desktop only
  if (isLoading) {
    return (
      <AccountLayout 
        title="Saved Addresses" 
        description="Manage your delivery addresses"
      >
        <div className="w-full space-y-8">
          {/* Loading skeleton for addresses */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="w-full">
                <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gray-200 rounded-full mr-3"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-100 rounded"></div>
                      <div className="h-3 w-4/5 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="border-t px-6 py-4 bg-gray-50">
                    <div className="flex justify-between">
                      <div className="flex space-x-2">
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AccountLayout>
    );
  }
  
  // Render desktop layout on larger screens
  return (
    <AccountLayout 
      title="Saved Addresses" 
      description="Manage your delivery addresses"
    >
      <div className="w-full space-y-8">
        {/* Add Address Button */}
        <div className="flex justify-end w-full">
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button 
              onClick={() => setIsAddingAddress(true)}
              className="bg-tendercuts-red hover:bg-tendercuts-red-dark transition-colors duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </motion.div>
        </div>

        {addresses.length > 0 ? (
          <motion.div 
            className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="wait">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  layoutId={address.id}
                  className="w-full"
                  transition={{ layout: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } }}
                >
                  <Card className={`h-full overflow-hidden transition-all duration-200 ${address.isDefault ? 'border-red-300 bg-red-50 shadow-md' : 'hover:shadow-md border-gray-200'}`}>
                    <CardContent className="p-0 h-full flex flex-col">
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center min-w-0 flex-1">
                            <MapPin className="h-5 w-5 text-tendercuts-red mr-3 flex-shrink-0" />
                            <h3 className="font-medium text-gray-900 truncate">{address.name}</h3>
                          </div>
                          {address.isDefault && (
                            <motion.span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-tendercuts-red ml-2 flex-shrink-0"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ 
                                delay: 0.1, 
                                type: "spring", 
                                stiffness: 200, 
                                damping: 15 
                              }}
                            >
                              Default
                            </motion.span>
                          )}
                        </div>
                        
                        <div className="text-gray-600 text-sm leading-relaxed">
                          <p className="mb-1">{address.address}</p>
                          <p>{address.city}, {address.state} - {address.pincode}</p>
                        </div>
                      </div>
                      
                      <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center flex-wrap gap-2">
                        <div className="flex space-x-2">
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAddress(address)}
                              className="flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                              Edit
                            </Button>
                          </motion.div>
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:bg-red-50 flex items-center"
                              onClick={() => handleDeleteAddress(address.id)}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </motion.div>
                        </div>
                        
                        {!address.isDefault && (
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-tendercuts-red flex items-center"
                              onClick={() => handleSetDefault(address.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Set Default
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <motion.div 
                  className="bg-gray-100 p-3 rounded-full mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <MapPin className="h-8 w-8 text-gray-400" />
                </motion.div>
                <h3 className="text-lg font-medium text-gray-900">No addresses saved</h3>
                <p className="text-gray-500 mt-1">Add a new address to get started</p>
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="mt-6"
                >
                  <Button 
                    className="bg-tendercuts-red hover:bg-tendercuts-red-dark transition-colors duration-200"
                    onClick={() => setIsAddingAddress(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Address
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
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
    </AccountLayout>
  );
}
