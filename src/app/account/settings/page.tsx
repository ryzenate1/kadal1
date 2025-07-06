"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft,
  Bell,
  Shield,
  Moon,
  Sun,
  Monitor,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    searchHistory: boolean;
    analytics: boolean;
    cookies: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
}

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी (Hindi)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'ml', label: 'മലയാളം (Malayalam)' }
];

const currencies = [
  { value: 'INR', label: '₹ Indian Rupee (INR)' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' }
];

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    language: 'en',
    currency: 'INR',
    notifications: {
      push: true,
      email: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'private',
      searchHistory: true,
      analytics: true,
      cookies: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/settings');
    }
  }, [loading, isAuthenticated, router]);

  // Fetch user settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const settingsData = await response.json();
        setSettings(settingsData);
      } else {
        // Use default settings if API fails
        console.log('Using default settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error("Failed to load settings. Using defaults.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  // Update settings
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    setIsSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings)
      });

      if (response.ok) {
        setSettings(updatedSettings);
        
        // Apply theme changes immediately
        if (newSettings.theme) {
          applyTheme(newSettings.theme);
        }
        
        // Apply accessibility changes immediately
        if (newSettings.accessibility) {
          applyAccessibilitySettings(newSettings.accessibility);
        }
        
        toast.success("Settings updated successfully!");
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error("Failed to update settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Apply theme changes
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // Apply accessibility settings
  const applyAccessibilitySettings = (accessibility: AppSettings['accessibility']) => {
    const root = document.documentElement;
    
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (accessibility.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    if (accessibility.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  };

  // Handle notification permission for push notifications
  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (enabled && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await updateSettings({
            notifications: {
              ...settings.notifications,
              push: true
            }
          });
          toast.success("Push notifications enabled!");
          
          // Show a test notification
          new Notification("Kadal Thunai", {
            body: "Notifications are now enabled!",
            icon: "/favicon.ico"
          });
        } else if (permission === 'denied') {
          toast.error("Notification permission denied. Please enable in browser settings.");
        } else {
          toast.info("Notification permission dismissed.");
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        toast.error("Failed to enable notifications.");
      }
    } else if (!enabled) {
      await updateSettings({
        notifications: {
          ...settings.notifications,
          push: false
        }
      });
      toast.success("Push notifications disabled.");
    } else {
      toast.error("Notifications are not supported in this browser.");
    }
  };

  // Handle notification toggle for non-push notifications
  const handleNotificationToggle = (key: keyof AppSettings['notifications']) => {
    const newNotifications = {
      ...settings.notifications,
      [key]: !settings.notifications[key]
    };
    updateSettings({ notifications: newNotifications });
  };

  // Handle privacy toggle
  const handlePrivacyToggle = (key: keyof AppSettings['privacy']) => {
    const newPrivacy = {
      ...settings.privacy,
      [key]: !settings.privacy[key]
    };
    updateSettings({ privacy: newPrivacy });
  };

  // Handle accessibility toggle
  const handleAccessibilityToggle = (key: keyof AppSettings['accessibility']) => {
    const newAccessibility = {
      ...settings.accessibility,
      [key]: !settings.accessibility[key]
    };
    updateSettings({ accessibility: newAccessibility });
    applyAccessibilitySettings(newAccessibility);
  };

  // Handle currency change
  const handleCurrencyChange = async (currency: string) => {
    try {
      await updateSettings({ currency });
      toast.success(`Currency changed to ${currency}`);
      
      // Apply currency change immediately to the page
      document.documentElement.setAttribute('data-currency', currency);
    } catch (error) {
      toast.error("Failed to update currency");
    }
  };

  // Handle language change
  const handleLanguageChange = async (language: string) => {
    try {
      await updateSettings({ language });
      toast.success(`Language changed to ${languages.find(l => l.value === language)?.label}`);
      
      // Apply language change immediately
      document.documentElement.setAttribute('lang', language);
    } catch (error) {
      toast.error("Failed to update language");
    }
  };

  // Clear data functions
  const clearSearchHistory = async () => {
    try {
      const response = await fetch('/api/user/clear-search-history', {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success("Search history cleared successfully!");
      } else {
        throw new Error('Failed to clear search history');
      }
    } catch (error) {
      console.error('Error clearing search history:', error);
      toast.error("Failed to clear search history.");
    }
  };

  const downloadData = async () => {
    try {
      const response = await fetch('/api/user/export-data');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-account-data.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Data export started. Check your downloads.");
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error("Failed to export data.");
    }
  };
  if (loading || isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <Select
                value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  updateSettings({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div className="flex items-center gap-2">
                        <theme.icon className="h-4 w-4" />
                        {theme.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select
                value={settings.language}
                onValueChange={handleLanguageChange}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Select
                value={settings.currency}
                onValueChange={handleCurrencyChange}
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Push Notifications</label>
                <p className="text-sm text-gray-500">Get notified about orders and updates</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={handlePushNotificationToggle}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Email Notifications</label>
                <p className="text-sm text-gray-500">Receive order updates via email</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={() => handleNotificationToggle('email')}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">SMS Notifications</label>
                <p className="text-sm text-gray-500">Get SMS alerts for deliveries</p>
              </div>
              <Switch
                checked={settings.notifications.sms}
                onCheckedChange={() => handleNotificationToggle('sms')}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Marketing Communications</label>
                <p className="text-sm text-gray-500">Receive offers and promotions</p>
              </div>
              <Switch
                checked={settings.notifications.marketing}
                onCheckedChange={() => handleNotificationToggle('marketing')}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Profile Visibility</label>
                <p className="text-sm text-gray-500">Control who can see your profile</p>
              </div>
              <Select
                value={settings.privacy.profileVisibility}
                onValueChange={(value: 'public' | 'private') => 
                  updateSettings({ 
                    privacy: { 
                      ...settings.privacy, 
                      profileVisibility: value 
                    } 
                  })
                }
                disabled={isSaving}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Save Search History</label>
                <p className="text-sm text-gray-500">Remember your search queries</p>
              </div>
              <Switch
                checked={settings.privacy.searchHistory}
                onCheckedChange={() => handlePrivacyToggle('searchHistory')}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Analytics</label>
                <p className="text-sm text-gray-500">Help improve our services</p>
              </div>
              <Switch
                checked={settings.privacy.analytics}
                onCheckedChange={() => handlePrivacyToggle('analytics')}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Cookies</label>
                <p className="text-sm text-gray-500">Accept non-essential cookies</p>
              </div>
              <Switch
                checked={settings.privacy.cookies}
                onCheckedChange={() => handlePrivacyToggle('cookies')}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">High Contrast</label>
                <p className="text-sm text-gray-500">Improve visibility with high contrast</p>
              </div>
              <Switch
                checked={settings.accessibility.highContrast}
                onCheckedChange={() => handleAccessibilityToggle('highContrast')}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Large Text</label>
                <p className="text-sm text-gray-500">Increase text size for better readability</p>
              </div>
              <Switch
                checked={settings.accessibility.largeText}
                onCheckedChange={() => handleAccessibilityToggle('largeText')}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Reduced Motion</label>
                <p className="text-sm text-gray-500">Minimize animations and transitions</p>
              </div>
              <Switch
                checked={settings.accessibility.reducedMotion}
                onCheckedChange={() => handleAccessibilityToggle('reducedMotion')}
                disabled={isSaving}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Screen Reader Support</label>
                <p className="text-sm text-gray-500">Enhanced support for screen readers</p>
              </div>
              <Switch
                checked={settings.accessibility.screenReader}
                onCheckedChange={() => handleAccessibilityToggle('screenReader')}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Export My Data</label>
                <p className="text-sm text-gray-500">Download a copy of your account data</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadData}
                disabled={isSaving}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Clear Search History</label>
                <p className="text-sm text-gray-500">Remove all saved search queries</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearchHistory}
                disabled={isSaving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Indicator */}
        <div className="flex justify-end">
          <Button 
            variant="ghost"
            disabled={true}
            className="min-w-24 cursor-default"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Auto-saved
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
