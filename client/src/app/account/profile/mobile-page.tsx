"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} as const;

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
} as const;

export default function MobileProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [editField, setEditField] = useState<'name' | 'email' | 'phoneNumber' | 'password' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ensure user is redirected if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      router.push('/auth/login?redirect=/account/profile');
    } else {
      // Simulate loading data
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [isAuthenticated, router]);

  // Handle edit button clicks
  const handleEdit = (field: 'name' | 'email' | 'phoneNumber' | 'password') => {
    setEditField(field);
    setIsDialogOpen(true);
  };

  // Handle profile updates
  const handleProfileUpdate = (field: string, value: string) => {
    showToast({
      message: `${field} updated successfully`,
      type: 'success'
    });
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tendercuts-red"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md pb-20">
      <div className="sticky top-0 z-10 bg-white p-4 border-b flex items-center">
        <BackButton href="/account" />
        <h1 className="text-xl font-bold ml-4">Personal Information</h1>
      </div>

      <motion.div 
        className="mt-6 space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Profile Details */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-tendercuts-red/10 p-2 rounded-full">
                    <UserIcon className="h-5 w-5 text-tendercuts-red" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{user?.name || 'Not set'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-tendercuts-red"
                  onClick={() => handleEdit('name')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-tendercuts-red/10 p-2 rounded-full">
                    <Mail className="h-5 w-5 text-tendercuts-red" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-tendercuts-red"
                  onClick={() => handleEdit('email')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-tendercuts-red/10 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-tendercuts-red" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{user?.phoneNumber ? `+91 ${user.phoneNumber}` : 'Not set'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-tendercuts-red"
                  onClick={() => handleEdit('phoneNumber')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-tendercuts-red/10 p-2 rounded-full">
                    <Lock className="h-5 w-5 text-tendercuts-red" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Password</p>
                    <p className="font-medium">••••••••</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-tendercuts-red"
                  onClick={() => handleEdit('password')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Edit Profile Dialog */}
      {editField && (
        <ImprovedEditProfileDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          fieldToEdit={editField}
          onSuccess={() => {
            showToast({
              message: `${editField} updated successfully`,
              type: 'success'
            });
          }}
        />
      )}
    </div>
  );
}
