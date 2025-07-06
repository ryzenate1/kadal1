"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Camera,
  Save,
  ArrowLeft,
  Edit,
  Check,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  memberSince: string;
  totalOrders: number;
  savedAmount: number;
  loyaltyPoints: number;
  notificationsEnabled: boolean;
  isActive: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, loading } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: ""
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/profile');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phoneNumber
        });
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle profile image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setIsUpdating(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('profileImage', file);
      
      const response = await fetch('/api/user/upload-image', {
        method: 'POST',
        body: formDataObj
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      setUser(prev => prev ? {
        ...prev,
        profileImage: result.imageUrl
      } : null);

      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image");
    } finally {
      setIsUpdating(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.phoneNumber.trim() || !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Update error:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber
      });
    }
    setIsEditing(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
            <p className="text-gray-600">Manage your account details</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Profile Information</span>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profileImage || undefined} />
                  <AvatarFallback className="bg-red-100 text-red-600 text-2xl font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 bg-red-500 text-white p-2 rounded-full cursor-pointer hover:bg-red-600 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUpdating}
                  />
                </label>
                {isUpdating && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Click the camera icon to update your profile picture</p>
                <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span>Full Name</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isUpdating}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>Email Address</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isUpdating}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>Phone Number</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Enter your phone number"
                    disabled={isUpdating}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900">+91 {user.phoneNumber}</p>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span>Member Since</span>
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-gray-900">{user.memberSince}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{user.totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">₹{user.savedAmount}</div>
                <div className="text-sm text-gray-600">Amount Saved</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{user.loyaltyPoints}</div>
                <div className="text-sm text-gray-600">Loyalty Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
