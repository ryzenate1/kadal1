'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Ticket, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Search,
  Users,
  Gift,
  Fish,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Catalog', href: '/admin/products', icon: Package },
  { label: 'Fish Cards', href: '/admin/fish-cards', icon: Fish },
  { label: 'Premium Collections', href: '/admin/premium-collections', icon: Sparkles },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Offers & Coupons', href: '/admin/offers', icon: Ticket },
  { label: 'Claimed Coupons', href: '/admin/claimed-coupons', icon: Gift },
  { label: 'Support Tickets', href: '/admin/support', icon: MessageSquare },
  { label: 'Blog', href: '/admin/blog', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem('kadal_admin_key');
    if (key) {
      setIsAuthenticated(true);
      setAdminKey(key);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      toast.error('Please enter a valid admin key');
      return;
    }
    // Verify the key against the real API before granting access
    try {
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: { 'x-admin-key': adminKey.trim() },
      });
      if (res.ok || res.status === 500) {
        // 500 means DB error but key was accepted; 200 means full success
        localStorage.setItem('kadal_admin_key', adminKey.trim());
        setIsAuthenticated(true);
        toast.success('Admin access granted');
      } else {
        toast.error('Invalid admin key. Check ADMIN_API_KEY in .env.local');
      }
    } catch {
      toast.error('Could not verify key — check your network');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kadal_admin_key');
    setIsAuthenticated(false);
    router.push('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fefbfb] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-red-100 rounded-3xl p-8 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
              <ShieldCheck className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Admin Portal</h1>
          <p className="text-gray-500 text-center text-sm mb-8">Enter your administrative key to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 ml-1">Admin Key</label>
              <Input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-900 rounded-xl py-6 focus:border-red-300 focus:ring-red-200"
                placeholder="••••••••••••"
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl font-semibold shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]">
              Access Dashboard
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefbfb] flex text-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-sm transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">KT</div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg text-gray-900">Kadal Thunai</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 mt-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-red-50 text-red-600 font-semibold shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
              <span className="text-sm font-medium">Logout Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-100 w-80">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, products..."
                className="bg-transparent border-none text-sm focus:ring-0 w-full placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">Super Admin</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Full Access</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-red-400 border-2 border-white shadow-md" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
