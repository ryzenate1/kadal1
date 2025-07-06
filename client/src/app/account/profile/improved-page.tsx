"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { ImprovedEditProfileDialog } from "@/components/account/ImprovedEditProfileDialog";
import { useToast } from "@/components/ui/toast-notification";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  ChevronRight,
  Edit
} from "lucide-react";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4 // Only use duration for compatibility
    }
  }
};

export default function ImprovedProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [editField, setEditField] = useState<'name' | 'email' | 'phoneNumber' | 'password' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle edit button clicks
  const handleEdit = (field: 'name' | 'email' | 'phoneNumber' | 'password') => {
    setEditField(field);
    setIsDialogOpen(true);
  };

  // Profile field items
  const profileFields = [
    {
      id: 'name',
      label: 'Full Name',
      value: user?.name || 'Not provided',
      icon: UserIcon,
    },
    {
      id: 'email',
      label: 'Email Address',
      value: user?.email || 'Not provided',
      icon: Mail,
    },
    {
      id: 'phoneNumber',
      label: 'Phone Number',
      value: user?.phoneNumber ? `+91 ${user.phoneNumber}` : 'Not provided',
      icon: Phone,
    },
    {
      id: 'password',
      label: 'Password',
      value: '••••••••',
      icon: Lock,
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* Back Button */}
      <div className="mb-6">
        <BackButton href="/account" label="Back to Account" />
      </div>
      
      {/* Page Header with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
        <p className="text-gray-500 mt-1">Update your profile details</p>
      </motion.div>
      
      {/* Profile Fields */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {profileFields.map((field) => (
          <motion.div key={field.id} variants={itemVariants}>
            <Card className="overflow-hidden border border-gray-200 hover:border-tendercuts-red/30 hover:shadow-sm transition-all duration-300">
              <button 
                className="w-full text-left p-0" 
                onClick={() => handleEdit(field.id as any)}
              >
                <div className="flex items-center p-4">
                  <div className="bg-red-50 p-3 rounded-full mr-4 flex-shrink-0">
                    <field.icon className="h-5 w-5 text-tendercuts-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">{field.label}</p>
                    <p className="font-medium text-gray-900 truncate">{field.value}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 text-gray-400 hover:text-tendercuts-red transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </button>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Edit Profile Dialog */}
      <AnimatePresence>
        {editField && (
          <ImprovedEditProfileDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            fieldToEdit={editField}
            onSuccess={() => {
              showToast({
                message: `Your ${editField === 'password' ? 'password' : editField} has been updated successfully`,
                type: "success"
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
