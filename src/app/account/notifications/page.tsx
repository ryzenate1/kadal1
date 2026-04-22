"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, 
  ArrowLeft,
  Check,
  Settings,
  Smartphone,
  Mail,
  ShoppingBag,
  Star,
  Gift,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  loyaltyUpdates: boolean;
  newsletter: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface NotificationFeedItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    promotions: true,
    loyaltyUpdates: true,
    newsletter: false,
    smsNotifications: true,
    emailNotifications: true,
    pushNotifications: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feed, setFeed] = useState<NotificationFeedItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/notifications');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch notification settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/notifications', {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-name': user?.name || '',
          'x-user-email': user?.email || '',
          'x-user-phone': user?.phoneNumber || '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      // Use default settings on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
      void fetchFeed();
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const id = setInterval(() => {
      void fetchFeed();
    }, 20000);
    return () => clearInterval(id);
  }, [isAuthenticated, user?.id]);

  const fetchFeed = async () => {
    try {
      const response = await fetch('/api/user/notifications/feed', {
        headers: {
          'x-user-id': user?.id || '',
          'x-user-name': user?.name || '',
          'x-user-email': user?.email || '',
          'x-user-phone': user?.phoneNumber || '',
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setFeed(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch {
      // ignore feed fetch errors silently
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/user/notifications/feed', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-user-name': user?.name || '',
          'x-user-email': user?.email || '',
          'x-user-phone': user?.phoneNumber || '',
        },
        body: JSON.stringify({ notificationId: id }),
      });
      if (!response.ok) return;
      setFeed(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore mark-read error
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch('/api/user/notifications/feed', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-user-name': user?.name || '',
          'x-user-email': user?.email || '',
          'x-user-phone': user?.phoneNumber || '',
        },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      if (!response.ok) return;
      setFeed(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  // Handle setting change
  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean) => {
    const oldSettings = { ...settings };
    
    // Update locally immediately for better UX
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      setIsUpdating(true);
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-user-name': user?.name || '',
          'x-user-email': user?.email || '',
          'x-user-phone': user?.phoneNumber || '',
        },
        body: JSON.stringify({ [key]: value })
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      toast.success("Notification settings updated!");
    } catch (error) {
      // Revert on error
      setSettings(oldSettings);
      console.error('Error updating notification settings:', error);
      toast.error("Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkUpdate = async (next: NotificationSettings, successMessage: string) => {
    const oldSettings = { ...settings };
    setSettings(next);

    try {
      setIsUpdating(true);
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'x-user-name': user?.name || '',
          'x-user-email': user?.email || '',
          'x-user-phone': user?.phoneNumber || '',
        },
        body: JSON.stringify(next),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      toast.success(successMessage);
    } catch (error) {
      setSettings(oldSettings);
      console.error('Bulk update notification settings failed:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const notificationTypes = [
    {
      key: 'orderUpdates' as keyof NotificationSettings,
      icon: ShoppingBag,
      title: 'Order Updates',
      description: 'Get notified about order confirmations, shipping updates, and deliveries',
      color: 'bg-primary/10 text-primary'
    },
    {
      key: 'promotions' as keyof NotificationSettings,
      icon: Gift,
      title: 'Promotions & Offers',
      description: 'Receive notifications about special deals, discounts, and seasonal offers',
      color: 'bg-green-100 text-green-600'
    },
    {
      key: 'loyaltyUpdates' as keyof NotificationSettings,
      icon: Star,
      title: 'Loyalty Points',
      description: 'Updates about points earned, tier changes, and reward redemptions',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      key: 'newsletter' as keyof NotificationSettings,
      icon: Mail,
      title: 'Newsletter',
      description: 'Weekly newsletter with recipes, seafood tips, and company news',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const deliveryMethods = [
    {
      key: 'pushNotifications' as keyof NotificationSettings,
      icon: Smartphone,
      title: 'Push Notifications',
      description: 'Instant notifications on your device',
      color: 'bg-red-100 text-red-600'
    },
    {
      key: 'emailNotifications' as keyof NotificationSettings,
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      key: 'smsNotifications' as keyof NotificationSettings,
      icon: AlertCircle,
      title: 'SMS Notifications',
      description: 'Important updates via text message',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="account-shell">
      <div className="app-container-narrow">
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
            <h1 className="account-title">Notification Settings</h1>
            <p className="account-subtitle">Manage your notification preferences</p>
          </div>
        </div>

        {/* Notification Types */}
        <Card className="account-panel mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-red-600" />
              <span>What would you like to be notified about?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className={`p-2 rounded-lg ${type.color}`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{type.title}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[type.key]}
                        onChange={(e) => handleSettingChange(type.key, e.target.checked)}
                        disabled={isUpdating}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Delivery Methods */}
        <Card className="account-panel mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>How would you like to receive notifications?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deliveryMethods.map((method) => (
              <div key={method.key} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className={`p-2 rounded-lg ${method.color}`}>
                  <method.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{method.title}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[method.key]}
                        onChange={(e) => handleSettingChange(method.key, e.target.checked)}
                        disabled={isUpdating}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="account-panel">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const allEnabled: NotificationSettings = {
                    orderUpdates: true,
                    promotions: true,
                    loyaltyUpdates: true,
                    newsletter: true,
                    smsNotifications: true,
                    emailNotifications: true,
                    pushNotifications: true
                  };
                  void handleBulkUpdate(allEnabled, "All notifications enabled!");
                }}
                className="flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Enable All</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const allDisabled: NotificationSettings = {
                    orderUpdates: false,
                    promotions: false,
                    loyaltyUpdates: false,
                    newsletter: false,
                    smsNotifications: false,
                    emailNotifications: false,
                    pushNotifications: false
                  };
                  void handleBulkUpdate(allDisabled, "All notifications disabled!");
                }}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <Bell className="h-4 w-4" />
                <span>Disable All</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="account-panel mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Updates</span>
              <span className="text-xs font-semibold text-red-600">{unreadCount} unread</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-3">
              <Button variant="outline" size="sm" onClick={() => void markAllRead()}>Mark all read</Button>
            </div>
            {feed.length === 0 ? (
              <p className="text-sm text-gray-500">No updates yet.</p>
            ) : (
              <div className="space-y-2">
                {feed.slice(0, 12).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => void markAsRead(n.id)}
                    className={`w-full text-left border rounded-lg p-3 transition-colors ${n.isRead ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      {!n.isRead && <span className="text-[10px] font-bold text-red-600">NEW</span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
