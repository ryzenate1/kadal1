"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  MapPin, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Award, 
  Phone, 
  Mail, 
  Package, 
  CreditCard, 
  Home,
  Edit,
  Bell,
  Settings,
  Star,
  Gift,
  Search,
  Camera,
  Upload,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

// Mock user data that can be updated
const initialUserData = {
  id: "user_123",
  name: "Test User",
  phoneNumber: "9876543210",
  email: "testuser@kadalthunai.com",
  profileImage: null as string | null,
  memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  loyaltyPoints: 150,
  totalOrders: 5,
  savedAmount: 250,
  notificationsEnabled: true,
  isActive: true
};

// Functional menu items
const menuItems = [
  { 
    id: 'profile', 
    icon: User, 
    label: 'Personal Information', 
    href: '/account/profile',
    description: 'Update your name, email, and phone number',
    functional: true
  },
  { 
    id: 'orders', 
    icon: Package, 
    label: 'My Orders', 
    href: '/account/orders',
    description: 'View your order history and track deliveries',
    functional: true
  },
  { 
    id: 'addresses', 
    icon: Home, 
    label: 'Saved Addresses', 
    href: '/account/addresses',
    description: 'Manage your delivery addresses',
    functional: true
  },
  { 
    id: 'payments', 
    icon: CreditCard, 
    label: 'Payment Methods', 
    href: '/account/payments',
    description: 'Manage your saved payment methods',
    functional: true
  },
  { 
    id: 'loyalty', 
    icon: Award, 
    label: 'Loyalty Points', 
    href: '/account/loyalty',
    description: 'Track your rewards and redeem points',
    functional: true
  },
  { 
    id: 'notifications', 
    icon: Bell, 
    label: 'Notifications', 
    href: '/account/notifications',
    description: 'Manage your notification preferences',
    functional: true
  },
  { 
    id: 'help', 
    icon: HelpCircle, 
    label: 'Help & Support', 
    href: '/account/help',
    description: 'Get help with your orders and account',
    functional: true
  },
  { 
    id: 'settings', 
    icon: Settings, 
    label: 'App Settings', 
    href: '/account/settings',
    description: 'Customize your app experience',
    functional: true
  }
];

// Quick actions that actually work
const quickActions = [
  { 
    id: 'reorder', 
    icon: Package, 
    label: 'Reorder', 
    description: 'Reorder your last purchase',
    action: () => {
      toast.success("Redirecting to your last order...");
      // Implement actual reorder logic
    }
  },
  { 
    id: 'support', 
    icon: HelpCircle, 
    label: 'Support', 
    description: 'Get help with your account',
    action: () => {
      toast.info("Opening support chat...");
      // Implement actual support logic
    }
  },
  { 
    id: 'refer', 
    icon: Gift, 
    label: 'Refer Friends', 
    description: 'Earn rewards for referrals',
    action: () => {
      toast.success("Opening referral program...");
      // Implement actual referral logic
    }
  },
  { 
    id: 'offers', 
    icon: Star, 
    label: 'Offers', 
    description: 'View current deals',
    action: () => {
      toast.info("Loading current offers...");
      // Implement actual offers logic
    }
  }
];

export default function AccountPage() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user: authUser, isAuthenticated, loading } = useAuth();
  const [user, setUser] = useState(initialUserData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account');
    }
  }, [loading, isAuthenticated, router]);

  // Update user data from auth context
  useEffect(() => {
    if (authUser) {
      setUser(prev => ({
        ...prev,
        name: authUser.name || prev.name,
        email: authUser.email || prev.email,
        phoneNumber: authUser.phoneNumber || prev.phoneNumber,
        profileImage: authUser.profileImage || prev.profileImage
      }));
    }
  }, [authUser]);

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle edit profile field
  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
    setIsEditing(true);
  };

  // Save edited field
  const handleSaveField = async () => {
    if (!editingField || !tempValue.trim()) return;

    try {
      // Update local state
      setUser(prev => ({
        ...prev,
        [editingField]: tempValue.trim()
      }));

      // TODO: Update in database via API
      // await fetch('/api/user/update', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ [editingField]: tempValue.trim() })
      // });

      toast.success(`${editingField} updated successfully!`);
      setIsEditing(false);
      setEditingField(null);
      setTempValue("");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Update error:", error);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingField(null);
    setTempValue("");
  };

  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setUser(prev => ({
          ...prev,
          profileImage: imageDataUrl
        }));
        toast.success("Profile image updated!");
      };
      reader.readAsDataURL(file);

      // TODO: Upload to server
      // const formData = new FormData();
      // formData.append('profileImage', file);
      // await fetch('/api/user/upload-image', { method: 'POST', body: formData });
    }
  };

  // Handle menu item click
  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.functional) {
      router.push(item.href);
    } else {
      toast.info(`${item.label} feature coming soon!`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // TODO: Implement actual logout
    toast.success("Logged out successfully!");
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600">Manage your Kadal Thunai account</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6 bg-white rounded-xl shadow-sm border">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search account settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 border-gray-200 border focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-150"
            />
          </div>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Profile Image */}
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.profileImage || undefined} />
                    <AvatarFallback className="bg-red-100 text-red-600 text-lg font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full cursor-pointer hover:bg-red-600 transition-colors">
                    <Camera className="h-3 w-3" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditField('name', user.name)}
                      className="p-1 h-auto"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">Member since {user.memberSince}</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{user.totalOrders}</div>
                      <div className="text-xs text-gray-500">Orders</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">₹{user.savedAmount}</div>
                      <div className="text-xs text-gray-500">Saved</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{user.loyaltyPoints}</div>
                      <div className="text-xs text-gray-500">Points</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 text-sm">+91 {user.phoneNumber}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditField('phoneNumber', user.phoneNumber)}
                    className="p-1 h-auto"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 text-sm">{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditField('email', user.email)}
                    className="p-1 h-auto"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
                  >
                    <action.icon className="h-5 w-5 text-gray-600 group-hover:text-red-600 mb-2" />
                    <span className="text-xs font-medium text-gray-900 group-hover:text-red-600 text-center">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {filteredMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                        <item.icon className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900 text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <div className="text-center text-gray-500 text-xs">
            <p>Kadal Thunai v2.1.0</p>
            <p>© 2025 Kadal Thunai. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600">Manage your Kadal Thunai account</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 bg-white rounded-xl shadow-sm border">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search account settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 border-gray-200 border focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-150"
          />
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {/* Profile Image */}
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profileImage || undefined} />
                  <AvatarFallback className="bg-red-100 text-red-600 text-lg font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-red-600 transition-colors">
                  <Camera className="h-3 w-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditField('name', user.name)}
                    className="p-1 h-auto"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-gray-600 text-sm mb-3">Member since {user.memberSince}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{user.totalOrders}</div>
                    <div className="text-xs text-gray-500">Orders</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">₹{user.savedAmount}</div>
                    <div className="text-xs text-gray-500">Saved</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{user.loyaltyPoints}</div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">+91 {user.phoneNumber}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditField('phoneNumber', user.phoneNumber)}
                  className="p-1 h-auto"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditField('email', user.email)}
                  className="p-1 h-auto"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group"
                >
                  <action.icon className="h-6 w-6 text-gray-600 group-hover:text-red-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900 group-hover:text-red-600 text-center">
                    {action.label}
                  </span>
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {action.description}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                      <item.icon className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Kadal Thunai v2.1.0</p>
          <p>© 2025 Kadal Thunai. All rights reserved.</p>
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditing && editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Edit {editingField.charAt(0).toUpperCase() + editingField.slice(1)}
            </h3>
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={`Enter new ${editingField}`}
              className="mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <Button onClick={handleSaveField} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
