'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, MapPin, X, Home, Briefcase, MapPinned } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackButton } from '@/components/ui/back-button';
import { CustomDialogContent } from './CustomDialogContent';

export interface Address {
  id?: string;
  type?: 'home' | 'work' | 'other';
  name: string;
  phoneNumber?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (address: Omit<Address, 'id'>) => void;
  address?: Address;
}

export const AddressFormDialog = ({ open, onOpenChange, onSave, address }: AddressFormDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | undefined>(
    address?.coordinates
  );
  const [step, setStep] = useState(1);
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>(address?.type || 'home');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Omit<Address, 'id'>>({    
    defaultValues: {
      type: 'home',
      name: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
      isDefault: false,
      coordinates: { lat: 0, lng: 0 },
      ...address
    }
  });

  const handleMapClick = (e: any) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedLocation({ lat, lng });
      
      // You could add reverse geocoding here to fill address fields
      console.log(`Selected location: ${lat}, ${lng}`);
      
      // Close the map modal
      setShowMap(false);
    }
  };

  const onSubmit = async (data: Omit<Address, 'id'>) => {
    setIsLoading(true);
    try {
      // Simulate API call with shorter delay for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
      onSave({
        ...data,
        coordinates: selectedLocation,
      });
      
      // First close the dialog
      onOpenChange(false);
      
      // Reset form state after animation completes
      setTimeout(() => {
        reset({
          type: 'home',
          name: '',
          phoneNumber: '',
          address: '',
          city: '',
          state: 'Tamil Nadu',
          pincode: '',
          isDefault: false,
        });
        setStep(1);
        setAddressType('home');
        setSelectedLocation(undefined);
      }, 300);
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set form values when editing an existing address
  useEffect(() => {
    if (address) {
      const { id, ...rest } = address;
      reset({
        ...rest,
        address: rest.address || '',
        phoneNumber: rest.phoneNumber || '',
        type: rest.type || 'home',
      });
      if (rest.coordinates) {
        setSelectedLocation(rest.coordinates);
      }
      
      // If editing, set the address type
      setAddressType(rest.type || 'home');
    } else {
      reset({
        type: 'home',
        name: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: 'Tamil Nadu',
        pincode: '',
        isDefault: false,
      });
      setSelectedLocation(undefined);
    }
    
    // Reset to first step when dialog opens
    if (open) {
      setStep(1);
    }
  }, [address, open, reset]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Only handle closing animation here
        if (!newOpen) {
          onOpenChange(false);
          // Reset after animation completes
          setTimeout(() => {
            setStep(1);
          }, 500);
        } else {
          onOpenChange(true);
        }
      }}
    >
      <CustomDialogContent 
        className="max-w-md sm:max-w-lg md:max-w-xl"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          // Reset the form state after closing animation completes
          setTimeout(() => {
            setStep(1);
            setAddressType(address?.type || 'home');
          }, 300);
        }}
      >
        <DialogHeader className="relative">
          {step > 1 && (
            <div className="absolute left-0 top-0">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setStep(step - 1)}
                className="text-gray-500 hover:text-tendercuts-red"
              >
                <X className="h-4 w-4 mr-1" /> Back
              </Button>
            </div>
          )}
          <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          
          {/* Single close button in the top-right */}
          <div className="absolute right-0 top-0">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-tendercuts-red"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <p className="text-gray-500">Choose address type</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {[{ type: 'home', icon: Home, label: 'Home' }, 
                  { type: 'work', icon: Briefcase, label: 'Work' }, 
                  { type: 'other', icon: MapPinned, label: 'Other' }].map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={item.type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setAddressType(item.type as 'home' | 'work' | 'other');
                        setValue('type', item.type as 'home' | 'work' | 'other');
                        setStep(2);
                      }}
                      className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border-2 ${addressType === item.type ? 'border-tendercuts-red bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <Icon className={`h-8 w-8 mb-2 ${addressType === item.type ? 'text-tendercuts-red' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${addressType === item.type ? 'text-tendercuts-red' : 'text-gray-700'}`}>{item.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
          
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  className="w-full"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <Input
                  id="phoneNumber"
                  placeholder="10-digit mobile number"
                  className="w-full"
                  {...register('phoneNumber', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number',
                    },
                  })}
                />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
              </div>
              
              <Button 
                type="button" 
                onClick={() => {
                  const nameValue = watch('name');
                  const phoneValue = watch('phoneNumber');
                  
                  // Trigger validation
                  if (!nameValue) {
                    setValue('name', '', { shouldValidate: true });
                  }
                  
                  if (!phoneValue || !/^[0-9]{10}$/.test(phoneValue)) {
                    setValue('phoneNumber', phoneValue || '', { shouldValidate: true });
                  }
                  
                  // Only proceed if both fields are valid
                  if (nameValue && phoneValue && /^[0-9]{10}$/.test(phoneValue)) {
                    setStep(3);
                  }
                }} 
                className="w-full bg-tendercuts-red hover:bg-tendercuts-red/90"
              >
                Continue
              </Button>
            </motion.div>
          )}
          
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="text-xs text-tendercuts-red hover:text-tendercuts-red/80 flex items-center"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Use map
                  </button>
                </div>
                <Input
                  id="address"
                  placeholder="House/Flat No., Building, Street"
                  className="w-full"
                  {...register('address', { required: 'Address is required' })}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <Input
                    id="city"
                    placeholder="City"
                    className="w-full"
                    {...register('city', { required: 'City is required' })}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <Input
                    id="pincode"
                    placeholder="6-digit pincode"
                    className="w-full"
                    {...register('pincode', { 
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Please enter a valid 6-digit pincode',
                      },
                    })}
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">State</label>
                <Input
                  id="state"
                  placeholder="State"
                  className="w-full"
                  defaultValue="Tamil Nadu"
                  {...register('state', { required: 'State is required' })}
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
              </div>

              <div className="flex items-center pt-2">
                <input
                  id="isDefault"
                  type="checkbox"
                  className="h-4 w-4 text-tendercuts-red focus:ring-tendercuts-red rounded"
                  {...register('isDefault')}
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  Set as default address
                </label>
              </div>
            </motion.div>
          )}
          
          <DialogFooter className="mt-6">
            {step === 3 && (
              <Button type="submit" 
                className="w-full bg-tendercuts-red hover:bg-tendercuts-red/90" 
                disabled={isLoading}
                onClick={(e) => {
                  // Get all required fields for step 3
                  const addressValue = watch('address');
                  const cityValue = watch('city');
                  const pincodeValue = watch('pincode');
                  const stateValue = watch('state');
                  
                  // Trigger validation for all fields
                  if (!addressValue) {
                    setValue('address', '', { shouldValidate: true });
                  }
                  
                  if (!cityValue) {
                    setValue('city', '', { shouldValidate: true });
                  }
                  
                  if (!pincodeValue || !/^[0-9]{6}$/.test(pincodeValue)) {
                    setValue('pincode', pincodeValue || '', { shouldValidate: true });
                  }
                  
                  if (!stateValue) {
                    setValue('state', '', { shouldValidate: true });
                  }
                  
                  // Stop form submission if validation fails
                  if (!addressValue || !cityValue || !pincodeValue || !stateValue || !/^[0-9]{6}$/.test(pincodeValue)) {
                    e.preventDefault();
                    
                    // Scroll to the first error field
                    const firstErrorField = document.querySelector('.text-red-500')?.parentElement;
                    firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Address'
                )}
              </Button>
            )}
          </DialogFooter>
          </AnimatePresence>
        </form>
      </CustomDialogContent>

      {/* Map Dialog */}
      <Dialog 
        open={showMap} 
        onOpenChange={(newOpen) => {
          if (newOpen !== showMap) {
            setShowMap(newOpen);
          }
        }}
      >
        <CustomDialogContent 
          className="max-w-4xl h-[80vh] p-0"
          onEscapeKeyDown={(e) => {
            // Prevent weird animation by handling ESC key properly
            e.preventDefault();
            setShowMap(false);
          }}
        >
          <div className="h-full flex flex-col">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Select Location</h3>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
            </div>
            <div className="flex-1 relative">
              {/* Google Maps will be rendered here */}
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-tendercuts-red mx-auto mb-2" />
                  <p className="font-medium">Map will be displayed here</p>
                  <p className="text-sm text-gray-500 mt-1">Click on the map to select a location</p>
                </div>
              </div>
              
              {/* This is where you'd integrate Google Maps */}
              {/* <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={selectedLocation || { lat: 13.0827, lng: 80.2707 }} // Default to Chennai
                zoom={15}
                onClick={(e) => {
                  if (e.latLng) {
                    handleLocationSelect(e.latLng.lat(), e.latLng.lng());
                  }
                }}
              >
                {selectedLocation && (
                  <Marker
                    position={{
                      lat: selectedLocation.lat,
                      lng: selectedLocation.lng,
                    }}
                  />
                )}
              </GoogleMap> */}
            </div>
            <div className="border-t p-4 flex justify-end">
              <Button
                type="button"
                onClick={() => setShowMap(false)}
                disabled={!selectedLocation}
              >
                Confirm Location
              </Button>
            </div>
          </div>
        </CustomDialogContent>
      </Dialog>
    </Dialog>
  );
}
