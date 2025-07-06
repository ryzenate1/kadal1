"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldToEdit: "name" | "email" | "phoneNumber" | "password";
  onSuccess: () => void;
}

export function EditProfileDialog({ 
  open, 
  onOpenChange, 
  fieldToEdit, 
  onSuccess 
}: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateUserProfile } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      [fieldToEdit]: fieldToEdit !== 'password' ? (user?.[fieldToEdit as keyof typeof user] as string || "") : "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

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
    setIsLoading(true);
    setError(null);
    
    try {
      // Special handling for password change
      if (fieldToEdit === "password") {
        if (data.newPassword !== data.confirmPassword) {
          setError("New passwords don't match");
          setIsLoading(false);
          return;
        }
        
        // In a real app, we would call an API to change the password
        // For now, we'll just simulate success
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSuccess();
        onOpenChange(false);
      } else {
        // For other fields, update the profile
        const result = await updateUserProfile({ [fieldToEdit]: data[fieldToEdit] });
        
        if (result.success) {
          onSuccess();
          onOpenChange(false);
        } else {
          setError(result.message || "Failed to update profile");
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {getFieldLabel()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
            >
              {error}
            </motion.div>
          )}
          
          {fieldToEdit === "password" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...register("currentPassword", { required: "Current password is required" })}
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message as string}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register("newPassword", { 
                    required: "New password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.newPassword.message as string}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", { 
                    required: "Please confirm your new password",
                    validate: (value, formValues) => 
                      value === formValues.newPassword || "Passwords don't match"
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message as string}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={fieldToEdit}>{getFieldLabel()}</Label>
              <Input
                id={fieldToEdit}
                type={fieldToEdit === "email" ? "email" : "text"}
                {...register(fieldToEdit, { 
                  required: `${getFieldLabel()} is required`,
                  ...(fieldToEdit === "email" && {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  }),
                  ...(fieldToEdit === "phoneNumber" && {
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit phone number"
                    }
                  })
                })}
              />
              {errors[fieldToEdit] && (
                <p className="text-red-500 text-xs mt-1">{errors[fieldToEdit]?.message as string}</p>
              )}
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-tendercuts-red hover:bg-tendercuts-red/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
