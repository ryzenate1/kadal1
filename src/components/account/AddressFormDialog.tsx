"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Create a simple checkbox component since the import is missing
const Checkbox = ({ checked, onCheckedChange, id }: { checked?: boolean, onCheckedChange?: (checked: boolean) => void, id?: string }) => {
  return (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      id={id}
      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
    />
  );
};
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import type { Variants } from 'framer-motion';

// Smooth animation variants
const dialogVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    transition: { 
      duration: 0.15,
      ease: 'easeInOut' as const
    }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.2,
      ease: 'easeOut' as const
    }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { 
      duration: 0.15,
      ease: 'easeIn' as const
    }
  }
};

const formVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.2,
      ease: 'easeOut' as const
    }
  }
};

const errorVariants: Variants = {
  hidden: { 
    opacity: 0, 
    height: 0 
  },
  visible: { 
    opacity: 1, 
    height: 'auto' as unknown as number, // Type assertion for height animation
    transition: { 
      duration: 0.2,
      ease: 'easeOut' as const
    }
  },
  exit: { 
    opacity: 0, 
    height: 0,
    transition: { 
      duration: 0.15,
      ease: 'easeIn' as const
    }
  }
};

export interface Address {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressToEdit?: Address | null;
  onSave: (address: Address) => void;
}

export function AddressFormDialog({ 
  open, 
  onOpenChange, 
  addressToEdit, 
  onSave 
}: AddressFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!addressToEdit;
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<Address>({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false
    }
  });

  // Set form values when editing an existing address
  useEffect(() => {
    if (addressToEdit) {
      setValue("name", addressToEdit.name);
      setValue("address", addressToEdit.address);
      setValue("city", addressToEdit.city);
      setValue("state", addressToEdit.state);
      setValue("pincode", addressToEdit.pincode);
      setValue("isDefault", addressToEdit.isDefault);
    } else {
      reset({
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false
      });
    }
  }, [addressToEdit, setValue, reset]);

  const onSubmit = async (data: Address) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay with smoother timing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Ensure we have a valid ID for the address
      // If editing, use the existing ID, otherwise create a new one
      const newAddress: Address = {
        ...data,
        id: addressToEdit?.id || `new-${Date.now()}`
      };
      
      // Call the parent component's onSave function immediately
      // This allows for faster UI updates
      onSave(newAddress);
      
      // Close the dialog with a slight delay for smooth transition
      setTimeout(() => {
        onOpenChange(false);
        // Reset form only after dialog is closed to avoid flickering
        setTimeout(() => {
          reset();
        }, 200);
      }, 50);
      
      console.log("Address saved:", newAddress);
    } catch (err) {
      console.error("Error saving address:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
            <motion.div
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader className="p-4 border-b">
                <DialogTitle className="text-lg font-medium">
                  {isEditing ? "Edit Address" : "Add New Address"}
                </DialogTitle>
              </DialogHeader>
              
              <motion.form 
                onSubmit={handleSubmit(onSubmit)} 
                className="p-4"
                variants={formVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Address Name</Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Address name is required" })}
                      placeholder="Home, Office, etc."
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      {...register("address", { required: "Street address is required" })}
                      placeholder="Enter your street address"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register("city", { required: "City is required" })}
                        placeholder="Enter your city"
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...register("state", { required: "State is required" })}
                        placeholder="Enter your state"
                      />
                      {errors.state && (
                        <p className="text-sm text-red-500">{errors.state.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      {...register("pincode", { 
                        required: "Pincode is required",
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: "Pincode must be 6 digits"
                        }
                      })}
                      placeholder="Enter your 6-digit pincode"
                    />
                    {errors.pincode && (
                      <p className="text-sm text-red-500">{errors.pincode.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox 
                      id="isDefault" 
                      {...register("isDefault")}
                      checked={watch("isDefault")}
                      onCheckedChange={(checked: boolean) => {
                        setValue("isDefault", checked);
                      }}
                    />
                    <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                      Set as default address
                    </Label>
                  </div>
                </div>
                
                {error && (
                  <motion.div
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="mt-4 p-3 bg-red-50 text-tendercuts-red rounded-md text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                
                <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full sm:w-auto order-2 sm:order-1" 
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full sm:w-auto bg-tendercuts-red hover:bg-tendercuts-red-dark order-1 sm:order-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      isEditing ? "Update Address" : "Save Address"
                    )}
                  </Button>
                </DialogFooter>
              </motion.form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
