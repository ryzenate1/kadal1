"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  MapPin, 
  Clock, 
  HelpCircle, 
  Shield, 
  LogOut, 
  Award, 
  Package, 
  CreditCard, 
  Home 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";

interface AccountLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const menuItems = [
  { id: 'account', icon: User, label: 'My Account', href: '/account' },
  { id: 'orders', icon: Package, label: 'My Orders', href: '/account/orders' },
  { id: 'addresses', icon: Home, label: 'Saved Addresses', href: '/account/addresses' },
  { id: 'payments', icon: CreditCard, label: 'Payment Methods', href: '/account/payments' },
  { id: 'loyalty', icon: Award, label: 'Loyalty Points', href: '/account/loyalty' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support', href: '/account/help' },
  { id: 'privacy', icon: Shield, label: 'Privacy Policy', href: '/privacy' },
];

export function AccountLayout({ children, title, description }: AccountLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const isActive = (path: string) => {
    if (!pathname) return false;
    return pathname === path || (path === '/account' && pathname === '/account');
  };

  // Determine if we're on the main account page or a sub-page
  const isMainAccountPage = pathname === '/account';
  const backUrl = isMainAccountPage ? '/' : '/account';
  const backLabel = isMainAccountPage ? 'Back to Home' : 'Back to Account';

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
    >
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Mobile Back Button - Only visible on mobile */}
        <div className="block md:hidden mb-4">
          <BackButton href={backUrl} label={backLabel} />
        </div>

        {/* Page Title - Only visible on mobile */}
        <div className="block md:hidden mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-gray-500">{description}</p>}
        </div>

        <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-8rem)]">
          {/* Sidebar - Collapsed on mobile, expanded on desktop */}
          <div className="hidden md:block w-full md:w-80 flex-shrink-0">
            <Card className="overflow-hidden h-full shadow-sm">
              <div className="bg-tendercuts-red p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <User className="h-8 w-8" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold truncate">{user?.name || "Guest"}</h2>
                    <p className="text-sm opacity-80 truncate">{user?.phoneNumber ? `+91 ${user.phoneNumber}` : "Login to continue"}</p>
                  </div>
                </div>
              </div>
            
            <div className="p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.id}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                        isActive(item.href) 
                          ? 'bg-gray-100 text-tendercuts-red' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 mt-4"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </nav>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <motion.div 
          className="flex-1 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1 
          }}
        >
          {/* Page Title - Only visible on desktop */}
          <div className="hidden md:block mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-gray-500">{description}</p>}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            {children}
          </div>
        </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
