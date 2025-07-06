"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast-notification";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldToEdit: "name" | "email" | "phoneNumber" | "password";
  onSuccess?: () => void;
}

export function ImprovedEditProfileDialog({ 
  open, 
  onOpenChange, 
  fieldToEdit, 
  onSuccess 
}: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      [fieldToEdit]: fieldToEdit !== 'password' ? (user?.[fieldToEdit as keyof typeof user] as string || "") : "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user && fieldToEdit !== 'password') {
      setValue(fieldToEdit, user[fieldToEdit as keyof typeof user] as string || "");
    }
  }, [user, fieldToEdit, setValue]);

  // Reset form and error state when dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(false);
      if (fieldToEdit !== 'password') {
        setValue(fieldToEdit, user?.[fieldToEdit as keyof typeof user] as string || "");
      } else {
        setValue('currentPassword', '');
        setValue('newPassword', '');
        setValue('confirmPassword', '');
      }
    }
  }, [open, fieldToEdit, user, setValue]);

  const getFieldLabel = () => {
    switch (fieldToEdit) {
      case "name": return "Full Name";
      case "email": return "Email Address";
      case "phoneNumber": return "Phone Number";
      case "password": return "Password";
      default: return "";
    }
  };

  const onSubmit = async (data: any) => {
    // Don't submit if no changes were made (except for password)
    if (fieldToEdit !== 'password' && 
        user && 
        data[fieldToEdit] === user[fieldToEdit as keyof typeof user]) {
      showToast({
        message: "No changes were made",
        type: "info"
      });
      onOpenChange(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Handle password update separately
      if (fieldToEdit === 'password') {
        if (data.newPassword !== data.confirmPassword) {
          setError("New passwords don't match");
          setIsLoading(false);
          return;
        }
        
        // Use any type to handle password update which isn't in the User type
        const result = await updateUserProfile({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        } as any);
        
        if (result.success) {
          // Show success animation before closing
          setSuccess(true);
          
          // Reset form fields
          reset({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          
          // Notify the parent component if needed
          if (onSuccess) onSuccess();
          
          // Close dialog after a short delay to show success animation
          setTimeout(() => {
            onOpenChange(false);
            
            // Show toast notification after dialog closes
            showToast({
              message: "Password updated successfully",
              type: "success"
            });
          }, 600);
        } else {
          setError(result.message || "Failed to update password. Please check your current password.");
        }
      } else {
        // Handle other profile fields
        const result = await updateUserProfile({
          [fieldToEdit]: data[fieldToEdit]
        });
        
        if (result.success) {
          // Show success animation before closing
          setSuccess(true);
          
          // Notify the parent component if needed
          if (onSuccess) onSuccess();
          
          // Close dialog after a shorter delay to feel more responsive
          setTimeout(() => {
            onOpenChange(false);
            
            // Show toast notification after dialog closes
            showToast({
              message: `Your ${getFieldLabel().toLowerCase()} has been updated successfully`,
              type: "success"
            });
          }, 400);
        } else {
          setError(result.message || `Failed to update ${getFieldLabel().toLowerCase()}`);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing the dialog while loading
      if (isLoading) return;
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg font-medium">
            Edit {getFieldLabel()}
          </DialogTitle>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-8 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25 
                }}
                className="rounded-full bg-green-100 p-3 mb-4"
              >
                <CheckCircle className="h-8 w-8 text-green-600" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {fieldToEdit === 'password' ? 'Password Updated' : `${getFieldLabel()} Updated`}
              </h3>
              <p className="text-center text-gray-600">
                Your changes have been saved successfully
              </p>
            </motion.div>
          ) : (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit(onSubmit)} 
              className="p-4"
            >
              {fieldToEdit !== 'password' ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={fieldToEdit}>{getFieldLabel()}</Label>
                    <Input
                      id={fieldToEdit}
                      {...register(fieldToEdit, { 
                        required: `${getFieldLabel()} is required`,
                        ...(fieldToEdit === 'email' && {
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        }),
                        ...(fieldToEdit === 'phoneNumber' && {
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Phone number must be 10 digits"
                          }
                        })
                      })}
                      placeholder={`Enter your ${getFieldLabel().toLowerCase()}`}
                      className="col-span-3"
                      autoComplete={fieldToEdit === 'email' ? 'email' : fieldToEdit === 'name' ? 'name' : 'tel'}
                    />
                    {errors[fieldToEdit] && (
                      <p className="text-sm text-red-500">{errors[fieldToEdit]?.message as string}</p>
                    )}
                    
                    {fieldToEdit === 'name' && (
                      <p className="text-xs text-gray-500 mt-1">
                        This name will be used for all your orders and communications.
                      </p>
                    )}
                    
                    {fieldToEdit === 'email' && (
                      <p className="text-xs text-gray-500 mt-1">
                        We'll send order confirmations and receipts to this email address.
                      </p>
                    )}
                    
                    {fieldToEdit === 'phoneNumber' && (
                      <p className="text-xs text-gray-500 mt-1">
                        This number will be used for delivery updates and communication.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...register('currentPassword', { required: "Current password is required" })}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-red-500">{errors.currentPassword.message as string}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...register('newPassword', { 
                        required: "New password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters"
                        }
                      })}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-red-500">{errors.newPassword.message as string}</p>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-1">
                      <p>Password must be at least 8 characters long</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword', { 
                        required: "Please confirm your new password",
                        validate: (value, formValues) => 
                          value === formValues.newPassword || "Passwords don't match"
                      })}
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword.message as string}</p>
                    )}
                  </div>
                </div>
              )}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm"
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
                  disabled={isLoading}
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
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
