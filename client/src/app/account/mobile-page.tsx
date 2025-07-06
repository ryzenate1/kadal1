"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  MapPin, 
  Clock, 
  HelpCircle, 
  Shield, 
  LogOut, 
  ChevronRight, 
  Award, 
  Phone, 
  Mail, 
  FileText, 
  Lock, 
  Package, 
  CreditCard, 
  Home,
  Edit,
  Bell,
  Settings,
  Star,
  Gift,
  Calendar,
  TrendingUp,
  Zap,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Search,
  Filter,
  MoreVertical,
  Heart,
  Share2,
  Download
} from "lucide-react";

// Mock user data with more details
const mockUser = {
  name: "Arjun Sharma",
  phoneNumber: "9876543210",
  email: "arjun.sharma@example.com",
  profileImage: null,
  memberSince: "January 2023",
  loyaltyPoints: 2450,
  totalOrders: 42,
  savedAmount: 1250,
  nextReward: 550,
  notificationsEnabled: true,
  darkMode: false,
  soundEnabled: true,
  isOnline: true,
  lastActive: "2 hours ago"
};

// Enhanced menu items with badges and status
const menuItems = [
  { 
    id: 'profile', 
    icon: User, 
    label: 'Personal Information', 
    href: '/account/profile',
    description: 'Update your name, email, and phone number',
    badge: null,
    color: 'blue'
  },
  { 
    id: 'orders', 
    icon: Package, 
    label: 'My Orders', 
    href: '/account/orders',
    description: 'View your order history and track deliveries',
    badge: '3 Active',
    color: 'green'
  },
  { 
    id: 'addresses', 
    icon: Home, 
    label: 'Saved Addresses', 
    href: '/account/addresses',
    description: 'Manage your delivery addresses',
    badge: '2 Saved',
    color: 'purple'
  },
  { 
    id: 'payments', 
    icon: CreditCard, 
    label: 'Payment Methods', 
    href: '/account/payments',
    description: 'Manage your saved payment methods',
    badge: 'New',
    color: 'yellow'
  },
  { 
    id: 'loyalty', 
    icon: Award, 
    label: 'Loyalty Points', 
    href: '/account/loyalty',
    description: 'Check your points balance and rewards',
    badge: '2,450 pts',
    color: 'orange'
  },
  { 
    id: 'notifications', 
    icon: Bell, 
    label: 'Notifications', 
    href: '/account/notifications',
    description: 'Manage your notification preferences',
    badge: '5 New',
    color: 'red'
  },
  { 
    id: 'help', 
    icon: HelpCircle, 
    label: 'Help & Support', 
    href: '/account/help',
    description: 'Get help with your orders and account',
    badge: null,
    color: 'teal'
  },
  { 
    id: 'settings', 
    icon: Settings, 
    label: 'App Settings', 
    href: '/account/settings',
    description: 'Customize your app experience',
    badge: null,
    color: 'gray'
  }
];

// Quick action items
const quickActions = [
  { id: 'reorder', icon: Package, label: 'Reorder', color: 'bg-blue-500' },
  { id: 'support', icon: HelpCircle, label: 'Support', color: 'bg-green-500' },
  { id: 'refer', icon: Gift, label: 'Refer', color: 'bg-purple-500' },
  { id: 'offers', icon: Star, label: 'Offers', color: 'bg-orange-500' }
];

export default function EnhancedMobileAccountPage() {
  const [user, setUser] = useState(mockUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel] = useState(85);
  const [currentTime] = useState(new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }));

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleNotifications = () => {
    setUser(prev => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled
    }));
  };

  const handleToggleDarkMode = () => {
    setUser(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };

  const handleToggleSound = () => {
    setUser(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const handleLogout = () => {
    alert("Logout functionality would be implemented here");
  };

  const handleQuickAction = (actionId: string) => {
    switch(actionId) {
      case 'reorder':
        alert("Reorder your favorite items");
        break;
      case 'support':
        alert("Contact support");
        break;
      case 'refer':
        alert("Refer friends and earn rewards");
        break;
      case 'offers':
        alert("View current offers");
        break;
    }
  };

  return (
    <div className={`min-h-screen ${user.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Status Bar */}
      <div className={`flex justify-between items-center px-4 py-2 text-sm ${user.darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} border-b`}>
        <div className="flex items-center space-x-2">
          <span>{currentTime}</span>
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        </div>
        <div className="flex items-center space-x-2">
          <Battery className="h-4 w-4" />
          <span>{batteryLevel}%</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header with Search */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${user.darkMode ? 'text-white' : 'text-gray-900'}`}>My Account</h1>
            <p className={`${user.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your account settings</p>
          </div>
          <button className={`p-2 rounded-full ${user.darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-sm transition-all duration-150`}>
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className={`relative mb-6 ${user.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border`}>
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${user.darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search account options..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl ${user.darkMode ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' : 'bg-white text-gray-900 placeholder-gray-500 border-gray-200'} border focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-150`}
          />
        </div>

        {/* Enhanced User Profile Card */}
        <div className={`${user.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-lg mb-6 overflow-hidden`}>
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 p-4 rounded-full mr-4 backdrop-blur-sm">
                  <User className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-white/80 text-sm">Member since {user.memberSince}</p>
                </div>
                <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-150">
                  <Edit className="h-5 w-5" />
                </button>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{user.totalOrders}</div>
                  <div className="text-xs text-white/80">Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">₹{user.savedAmount}</div>
                  <div className="text-xs text-white/80">Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{user.loyaltyPoints}</div>
                  <div className="text-xs text-white/80">Points</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className={`h-4 w-4 ${user.darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`${user.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>+91 {user.phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className={`h-4 w-4 ${user.darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`${user.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${user.darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
              <button 
                onClick={() => setShowQuickActions(false)}
                className={`text-sm ${user.darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'} transition-colors`}
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className={`p-4 rounded-xl ${user.darkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className={`${action.color} p-3 rounded-full mx-auto mb-2 w-fit transition-transform duration-150 group-hover:scale-105`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-xs font-medium ${user.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings Toggle Row */}
        <div className={`${user.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-4 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleNotifications}
                className={`p-2 rounded-lg transition-all ${user.notificationsEnabled ? 'bg-red-500 text-white' : (user.darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')}`}
              >
                <Bell className="h-4 w-4" />
              </button>
              <button
                onClick={handleToggleDarkMode}
                className={`p-2 rounded-lg transition-all ${user.darkMode ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {user.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={handleToggleSound}
                className={`p-2 rounded-lg transition-all ${user.soundEnabled ? 'bg-green-500 text-white' : (user.darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')}`}
              >
                {user.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
            <div className={`text-xs ${user.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Quick Settings
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {filteredMenuItems.map((item, index) => (
            <div
              key={item.id}
              className={`${user.darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-xl border transition-all duration-150 hover:scale-[1.01] hover:shadow-md active:scale-[0.99] cursor-pointer group`}
            >
              <div className="p-4 flex items-center">
                <div className={`p-3 rounded-xl mr-4 transition-all duration-150 group-hover:scale-105 ${
                  item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  item.color === 'green' ? 'bg-green-50 text-green-600' :
                  item.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                  item.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
                  item.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                  item.color === 'red' ? 'bg-red-50 text-red-600' :
                  item.color === 'teal' ? 'bg-teal-50 text-teal-600' :
                  'bg-gray-50 text-gray-600'
                } ${user.darkMode ? 'bg-opacity-20' : ''}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${user.darkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</h3>
                    {item.badge && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        item.badge === 'New' ? 'bg-red-100 text-red-600' :
                        item.badge.includes('Active') ? 'bg-green-100 text-green-600' :
                        item.badge.includes('pts') ? 'bg-orange-100 text-orange-600' :
                        item.badge.includes('New') && item.badge !== 'New' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      } ${user.darkMode ? 'bg-opacity-20' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${user.darkMode ? 'text-gray-400' : 'text-gray-500'} leading-snug`}>{item.description}</p>
                </div>
                <ChevronRight className={`h-5 w-5 ${user.darkMode ? 'text-gray-400' : 'text-gray-400'} transition-transform duration-150 group-hover:translate-x-1`} />
              </div>
            </div>
          ))}
          
          {/* Logout Button */}
          <div
            onClick={handleLogout}
            className={`${user.darkMode ? 'bg-gray-800 border-red-800 hover:bg-red-900/20' : 'bg-white border-red-200 hover:bg-red-50'} rounded-xl border transition-all duration-150 hover:scale-[1.01] hover:shadow-md active:scale-[0.99] cursor-pointer group`}
          >
            <div className="p-4 flex items-center">
              <div className="bg-red-50 p-3 rounded-xl mr-4 transition-all duration-150 group-hover:scale-105">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-red-600 mb-1">Logout</h3>
                <p className={`text-sm text-red-500 leading-snug ${user.darkMode ? 'text-red-400' : ''}`}>Sign out from your account</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center mt-8 pb-4 ${user.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-sm">TenderCuts v2.1.0</p>
          <p className="text-xs mt-1">Last active: {user.lastActive}</p>
        </div>
      </div>
    </div>
  );
}