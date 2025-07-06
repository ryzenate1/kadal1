"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImprovedEditProfileDialog } from "@/components/account/ImprovedEditProfileDialog";
import { useAuth } from "@/context/AuthContext";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Lock, User as UserIcon } from "lucide-react";

export default function AccountPage() {
  const { user } = useAuth();
  const [editField, setEditField] = useState<'name' | 'email' | 'phoneNumber' | 'password' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle edit button clicks
  const handleEdit = (field: 'name' | 'email' | 'phoneNumber' | 'password') => {
    setEditField(field);
    setIsDialogOpen(true);
  };

  return (
    <AccountLayout 
      title="My Account" 
      description="View and manage your account information"
    >
      <div className="space-y-6">
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="font-medium">{user?.name || "Not provided"}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => handleEdit('name')}
              >
                Edit
              </Button>
            </div>

            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="font-medium">{user?.email || "Not provided"}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => handleEdit('email')}
              >
                Edit
              </Button>
            </div>

            {/* Phone */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="font-medium">+91 {user?.phoneNumber || "XXXXXXXXXX"}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={() => handleEdit('phoneNumber')}
              >
                Edit
              </Button>
            </div>

            {/* Password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center mb-3 sm:mb-0">
                <div className="bg-amber-100 p-2 rounded-full mr-3">
                  <Lock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Password</p>
                  <p className="font-medium">••••••••</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                onClick={() => handleEdit('password')}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Login</p>
                  <p className="font-medium">Today, 3:45 PM</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Created</p>
                  <p className="font-medium">May 15, 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      {editField && (
        <ImprovedEditProfileDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          fieldToEdit={editField}
        />
      )}
    </AccountLayout>
  );
}
