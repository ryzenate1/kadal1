"use client";

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2, Save, Store, Truck, CreditCard, Globe, Mail, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ApiConnectionChecker from '@/components/dashboard/api-connection-checker';

type StoreSetting = {
  id: string;
  key: string;
  value: string;
  description: string;
};

type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDeliveryDays: number;
  isActive: boolean;
  order: number;
};

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState<StoreSetting[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isConnectedToApi, setIsConnectedToApi] = useState(false);
  // Extended form settings state
  const [formSettings, setFormSettings] = useState({
    // General settings
    storeName: 'Kadal Thunai',
    tagline: 'Fresh Seafood Delivered to Your Doorstep',
    email: 'contact@kadalthunai.com',
    phone: '+91 9876543210',
    address: '123 Fisherman\'s Wharf, Chennai, Tamil Nadu, India',
    currency: 'INR',
    language: 'en',
    timezone: 'Asia/Kolkata',
    enableReviews: true,
    enableWishlist: true,
    enableLoyaltyProgram: true,
    logo: '/images/logo.png',
    favicon: '/favicon.ico',
    
    // Shipping settings
    enableFreeShipping: true,
    freeShippingThreshold: '1000',
    defaultShippingFee: '100',
    allowLocalPickup: true,
    localPickupAddress: 'Shop #4, Marina Beach Market, Chennai',
    
    // Payment settings
    enableCashOnDelivery: true,
    enableRazorpay: true,
    razorpayKeyId: 'rzp_test_1234567890',
    razorpayKeySecret: 'abcdefghijklmnopqrstuvwxyz',
    enablePhonePe: true,
    enableGooglePay: true,
    sandboxMode: true,
    
    // Email settings
    senderName: 'Kadal Thunai',
    senderEmail: 'noreply@kadalthunai.com',
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'smtp_user',
    smtpPassword: '********',
    enableSsl: true,
    
    // Add the missing email notification settings
    enableOrderConfirmationEmails: true,
    enableShippingUpdateEmails: true,
    enableMarketingEmails: false,
    emailFooter: 'Thank you for shopping with Kadal Thunai. © 2025 Kadal Thunai, All Rights Reserved.'
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('oceanFreshToken');
  };
  
  // Fetch store settings
  const fetchStoreSettings = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/settings', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch store settings');
      }
      
      const data = await response.json();
      setStoreSettings(data);
      setIsConnectedToApi(true);
      
      // Update form settings with actual data
      if (data && data.length > 0) {
        const newFormSettings = {...formSettings};
        
        data.forEach((setting: StoreSetting) => {
          if (setting.key === 'general.storeName') newFormSettings.storeName = setting.value;
          if (setting.key === 'general.tagline') newFormSettings.tagline = setting.value;
          if (setting.key === 'general.email') newFormSettings.email = setting.value;
          if (setting.key === 'general.phone') newFormSettings.phone = setting.value;
          if (setting.key === 'general.address') newFormSettings.address = setting.value;
          if (setting.key === 'general.currency') newFormSettings.currency = setting.value;
          if (setting.key === 'general.language') newFormSettings.language = setting.value;
          if (setting.key === 'general.timezone') newFormSettings.timezone = setting.value;
          if (setting.key === 'general.enableReviews') newFormSettings.enableReviews = setting.value === 'true';
          if (setting.key === 'general.enableWishlist') newFormSettings.enableWishlist = setting.value === 'true';
          if (setting.key === 'general.enableLoyaltyProgram') newFormSettings.enableLoyaltyProgram = setting.value === 'true';
          if (setting.key === 'general.logo') newFormSettings.logo = setting.value;
          if (setting.key === 'general.favicon') newFormSettings.favicon = setting.value;
        });
        
        setFormSettings(newFormSettings);
      }
    } catch (error) {
      console.error('Error fetching store settings:', error);
      setError('Failed to load store settings. Please try again.');
      setIsConnectedToApi(false);
    }
  };
  
  // Fetch shipping methods
  const fetchShippingMethods = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/settings/shipping', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipping methods');
      }
      
      const data = await response.json();
      setShippingMethods(data);
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      setError('Failed to load shipping methods. Please try again.');
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchStoreSettings(), fetchShippingMethods()])
      .finally(() => setIsLoading(false));
  }, []);
  
  // Handle setting update
  const updateStoreSetting = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      const token = getAuthToken();
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ key, value })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update setting');
      }
      
      toast({
        title: 'Setting Updated',
        description: `Successfully updated ${key}`,
      });
      
      // Refresh settings
      fetchStoreSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update setting. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save general settings
  const saveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      // Update each setting through the API
      await Promise.all([
        updateStoreSetting('general.storeName', formSettings.storeName),
        updateStoreSetting('general.tagline', formSettings.tagline),
        updateStoreSetting('general.email', formSettings.email),
        updateStoreSetting('general.phone', formSettings.phone),
        updateStoreSetting('general.address', formSettings.address),
        updateStoreSetting('general.currency', formSettings.currency),
        updateStoreSetting('general.language', formSettings.language),
        updateStoreSetting('general.timezone', formSettings.timezone),
        updateStoreSetting('general.enableReviews', formSettings.enableReviews.toString()),
        updateStoreSetting('general.enableWishlist', formSettings.enableWishlist.toString()),
        updateStoreSetting('general.enableLoyaltyProgram', formSettings.enableLoyaltyProgram.toString()),
        updateStoreSetting('general.logo', formSettings.logo),
        updateStoreSetting('general.favicon', formSettings.favicon)
      ]);
      
      toast({
        title: 'Settings Saved',
        description: 'Your store settings have been updated successfully',
      });
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save shipping methods
  const saveShippingMethods = async () => {
    setIsSaving(true);
    try {
      // Update each shipping method through the API
      await Promise.all(
        shippingMethods.map(method => 
          updateStoreSetting(`shipping.${method.id}`, method.isActive ? '1' : '0')
        )
      );
      
      toast({
        title: 'Shipping Methods Saved',
        description: 'Your shipping methods have been updated successfully',
      });
    } catch (error) {
      console.error('Error saving shipping methods:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save shipping methods. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent, section: string) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Based on the section, save the appropriate settings
      switch (section) {
        case 'general':
          saveGeneralSettings();
          break;
        case 'shipping':
          // Save shipping settings
          Promise.all([
            updateStoreSetting('shipping.enableFreeShipping', formSettings.enableFreeShipping.toString()),
            updateStoreSetting('shipping.freeShippingThreshold', formSettings.freeShippingThreshold),
            updateStoreSetting('shipping.defaultShippingFee', formSettings.defaultShippingFee),
            updateStoreSetting('shipping.allowLocalPickup', formSettings.allowLocalPickup.toString()),
            updateStoreSetting('shipping.localPickupAddress', formSettings.localPickupAddress)
          ]);
          break;
        case 'payment':
          // Save payment settings
          Promise.all([
            updateStoreSetting('payment.enableCashOnDelivery', formSettings.enableCashOnDelivery.toString()),
            updateStoreSetting('payment.enableRazorpay', formSettings.enableRazorpay.toString()),
            updateStoreSetting('payment.razorpayKeyId', formSettings.razorpayKeyId),
            updateStoreSetting('payment.razorpayKeySecret', formSettings.razorpayKeySecret),
            updateStoreSetting('payment.enablePhonePe', formSettings.enablePhonePe.toString()),
            updateStoreSetting('payment.enableGooglePay', formSettings.enableGooglePay.toString()),
            updateStoreSetting('payment.sandboxMode', formSettings.sandboxMode.toString())
          ]);
          break;
        case 'email':
          // Save email settings
          Promise.all([
            updateStoreSetting('email.senderName', formSettings.senderName),
            updateStoreSetting('email.senderEmail', formSettings.senderEmail),
            updateStoreSetting('email.smtpHost', formSettings.smtpHost),
            updateStoreSetting('email.smtpPort', formSettings.smtpPort),
            updateStoreSetting('email.smtpUser', formSettings.smtpUser),
            updateStoreSetting('email.smtpPassword', formSettings.smtpPassword),
            updateStoreSetting('email.enableSsl', formSettings.enableSsl.toString())
          ]);
          break;
      }
      
      toast({
        title: 'Settings Saved',
        description: `Your ${section} settings have been updated successfully`,
      });
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      toast({
        title: 'Save Failed',
        description: `Failed to save ${section} settings. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <DashboardHeader
        title="Store Settings"
        description="Configure your store preferences and operational settings."      />
      
      {/* API Connection Status */}
      <ApiConnectionChecker
        adminClientConnected={isConnectedToApi}
        serverConnected={isConnectedToApi}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-1">
            <Store size={16} /> General
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-1">
            <Truck size={16} /> Shipping
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-1">
            <CreditCard size={16} /> Payment
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-1">
            <Mail size={16} /> Email
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1">
            <Globe size={16} /> SEO
          </TabsTrigger>
        </TabsList>
        
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* General Store Settings */}
        <TabsContent value="general">
          <form onSubmit={(e) => { e.preventDefault(); saveGeneralSettings(); }}>
            <Card>
              <CardHeader>
                <CardTitle>General Store Information</CardTitle>
                <CardDescription>Basic information about your seafood store.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input 
                      id="storeName" 
                      name="storeName"
                      value={formSettings.storeName}
                      onChange={(e) => setFormSettings(prev => ({ ...prev, storeName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Store Tagline</Label>
                    <Input 
                      id="tagline" 
                      name="tagline"
                      value={formSettings.tagline}
                      onChange={(e) => setFormSettings(prev => ({ ...prev, tagline: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      value={formSettings.email}
                      onChange={(e) => setFormSettings(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Business Phone</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      value={formSettings.phone}
                      onChange={(e) => setFormSettings(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea 
                    id="address" 
                    name="address"
                    rows={3}
                    value={formSettings.address}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      name="currency"
                      value={formSettings.currency}
                      onValueChange={(value) => setFormSettings(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select 
                      name="language"
                      value={formSettings.language}
                      onValueChange={(value) => setFormSettings(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      name="timezone"
                      value={formSettings.timezone}
                      onValueChange={(value) => setFormSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">India (GMT+5:30)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Store Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableReviews" 
                        name="enableReviews"
                        checked={formSettings.enableReviews}
                        onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableReviews: checked }))}
                      />
                      <Label htmlFor="enableReviews">Enable Customer Reviews</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableWishlist" 
                        name="enableWishlist"
                        checked={formSettings.enableWishlist}
                        onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableWishlist: checked }))}
                      />
                      <Label htmlFor="enableWishlist">Enable Wishlist</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableLoyaltyProgram" 
                        name="enableLoyaltyProgram"
                        checked={formSettings.enableLoyaltyProgram}
                        onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableLoyaltyProgram: checked }))}
                      />
                      <Label htmlFor="enableLoyaltyProgram">Enable Loyalty Program</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="w-40">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (
                    <>
                      <Save size={16} className="mr-2" /> Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <form onSubmit={(e) => { e.preventDefault(); saveShippingMethods(); }}>
            <Card>
              <CardHeader>
                <CardTitle>Shipping Configuration</CardTitle>
                <CardDescription>Configure shipping options and delivery zones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableFreeShipping" 
                        name="enableFreeShipping"
                        checked={formSettings.enableFreeShipping}
                        onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableFreeShipping: checked }))}
                      />
                      <Label htmlFor="enableFreeShipping">Enable Free Shipping</Label>
                    </div>
                    {formSettings.enableFreeShipping && (
                      <div className="pl-8">
                        <Label htmlFor="freeShippingThreshold">Free Shipping Order Threshold (₹)</Label>
                        <Input 
                          type="number"
                          id="freeShippingThreshold" 
                          name="freeShippingThreshold"
                          value={formSettings.freeShippingThreshold}
                          onChange={(e) => setFormSettings(prev => ({ ...prev, freeShippingThreshold: e.target.value }))}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultShippingFee">Default Shipping Fee (₹)</Label>
                    <Input 
                      type="number"
                      id="defaultShippingFee" 
                      name="defaultShippingFee"
                      value={formSettings.defaultShippingFee}
                      onChange={(e) => setFormSettings(prev => ({ ...prev, defaultShippingFee: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="allowLocalPickup" 
                    name="allowLocalPickup"
                    checked={formSettings.allowLocalPickup}
                    onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, allowLocalPickup: checked }))}
                  />
                  <Label htmlFor="allowLocalPickup">Allow Local Pickup</Label>
                </div>
                
                {formSettings.allowLocalPickup && (
                  <div className="pl-8 space-y-2">
                    <Label htmlFor="localPickupAddress">Local Pickup Address</Label>
                    <Textarea 
                      id="localPickupAddress" 
                      name="localPickupAddress"
                      rows={2}
                      value={formSettings.localPickupAddress}
                      onChange={(e) => setFormSettings(prev => ({ ...prev, localPickupAddress: e.target.value }))}
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Shipping Methods</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShippingMethods(prev => ([
                        ...prev,
                        { id: `${prev.length + 1}`, name: '', description: '', price: 0, estimatedDeliveryDays: 0, isActive: true, order: prev.length + 1 }
                      ]))}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Method
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {shippingMethods.map((method, index) => (
                      <div key={method.id} className="grid grid-cols-5 gap-4 items-center border p-3 rounded-md">
                        <div className="col-span-3">
                          <Label htmlFor={`method-${method.id}-name`}>Method Name</Label>
                          <Input 
                            id={`method-${method.id}-name`}
                            value={method.name}
                            onChange={(e) => {
                              const newMethods = [...shippingMethods];
                              newMethods[index].name = e.target.value;
                              setShippingMethods(newMethods);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor={`method-${method.id}-price`}>Price (₹)</Label>
                          <Input 
                            id={`method-${method.id}-price`}
                            type="number"
                            value={method.price}
                            onChange={(e) => {
                              const newMethods = [...shippingMethods];
                              newMethods[index].price = parseFloat(e.target.value);
                              setShippingMethods(newMethods);
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div className="col-span-1 flex items-center">
                          <Switch 
                            id={`method-${method.id}-isActive`}
                            name={`method-${method.id}-isActive`}
                            checked={method.isActive}
                            onCheckedChange={(checked) => {
                              const newMethods = [...shippingMethods];
                              newMethods[index].isActive = checked;
                              setShippingMethods(newMethods);
                            }}
                            className="mr-2"
                          />
                          <Label htmlFor={`method-${method.id}-isActive`}>Active</Label>
                        </div>
                        <div className="col-span-1 flex items-end justify-center">
                          <Button 
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newMethods = shippingMethods.filter((_, i) => i !== index);
                              setShippingMethods(newMethods);
                            }}
                            className="h-10"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="w-40">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (
                    <>
                      <Save size={16} className="mr-2" /> Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <form onSubmit={(e) => handleSubmit(e, 'payment')}>
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Configure your store's payment processing options.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enableCashOnDelivery" 
                      name="enableCashOnDelivery"
                      checked={formSettings.enableCashOnDelivery}
                      onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableCashOnDelivery: checked }))}
                    />
                    <Label htmlFor="enableCashOnDelivery">Enable Cash on Delivery</Label>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch 
                      id="enableRazorpay" 
                      name="enableRazorpay"
                      checked={formSettings.enableRazorpay}
                      onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableRazorpay: checked }))}
                    />
                    <Label htmlFor="enableRazorpay">Enable Razorpay</Label>
                  </div>
                  
                  {formSettings.enableRazorpay && (
                    <div className="pl-8 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                          <Input 
                            id="razorpayKeyId" 
                            name="razorpayKeyId"
                            value={formSettings.razorpayKeyId}
                            onChange={(e) => setFormSettings(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                          <Input 
                            id="razorpayKeySecret" 
                            name="razorpayKeySecret"
                            type="password"
                            value={formSettings.razorpayKeySecret}
                            onChange={(e) => setFormSettings(prev => ({ ...prev, razorpayKeySecret: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium mb-4">Additional Payment Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enablePhonePe" 
                        name="enablePhonePe"
                        checked={formSettings.enablePhonePe}
                        onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enablePhonePe: checked }))}
                      />
                      <Label htmlFor="enablePhonePe">Enable PhonePe (Coming Soon)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableGooglePay" 
                        name="enableGooglePay"
                        checked={formSettings.enableGooglePay}
                        onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableGooglePay: checked }))}
                      />
                      <Label htmlFor="enableGooglePay">Enable Google Pay (Coming Soon)</Label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="sandboxMode" 
                      name="sandboxMode"
                      checked={formSettings.sandboxMode}
                      onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, sandboxMode: checked }))}
                    />
                    <Label htmlFor="sandboxMode">Use Sandbox/Test Mode</Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 ml-8">
                    Enable this for testing payments. No real transactions will be processed.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="w-40">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (
                    <>
                      <Save size={16} className="mr-2" /> Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        
        {/* Email Settings */}
        <TabsContent value="email">
          <form onSubmit={(e) => handleSubmit(e, 'email')}>
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure email notifications and templates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Sender Name</Label>
                    <Input 
                      id="senderName" 
                      name="senderName"
                      value={formSettings.senderName}
                      onChange={(e) => setFormSettings(prev => ({ ...prev, senderName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Sender Email</Label>
                    <Input 
                      id="senderEmail" 
                      name="senderEmail"
                      type="email"
                      value={formSettings.senderEmail}
                      onChange={(e) => setFormSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-sm font-medium">SMTP Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input 
                        id="smtpHost" 
                        name="smtpHost"
                        value={formSettings.smtpHost}
                        onChange={(e) => setFormSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input 
                        id="smtpPort" 
                        name="smtpPort"
                        value={formSettings.smtpPort}
                        onChange={(e) => setFormSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input 
                        id="smtpUsername" 
                        name="smtpUsername"
                        value={formSettings.smtpUser}
                        onChange={(e) => setFormSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input 
                        id="smtpPassword" 
                        name="smtpPassword"
                        type="password"
                        value={formSettings.smtpPassword}
                        onChange={(e) => setFormSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableOrderConfirmationEmails" 
                        name="enableOrderConfirmationEmails"
                        checked={formSettings.enableOrderConfirmationEmails}
                        onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableOrderConfirmationEmails: checked }))}
                      />
                      <Label htmlFor="enableOrderConfirmationEmails">Send Order Confirmation Emails</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableShippingUpdateEmails" 
                        name="enableShippingUpdateEmails"
                        checked={formSettings.enableShippingUpdateEmails}
                        onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableShippingUpdateEmails: checked }))}
                      />
                      <Label htmlFor="enableShippingUpdateEmails">Send Shipping Update Emails</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableMarketingEmails" 
                        name="enableMarketingEmails"
                        checked={formSettings.enableMarketingEmails}
                        onCheckedChange={(checked) => setFormSettings(prev => ({ ...prev, enableMarketingEmails: checked }))}
                      />
                      <Label htmlFor="enableMarketingEmails">Send Marketing Emails</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 border-t pt-6">
                  <Label htmlFor="emailFooter">Email Footer Text</Label>
                  <Textarea 
                    id="emailFooter" 
                    name="emailFooter"
                    rows={3}
                    value={formSettings.emailFooter}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, emailFooter: e.target.value }))}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="w-40">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : (
                    <>
                      <Save size={16} className="mr-2" /> Save Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        
        {/* SEO Settings */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Configure search engine optimization settings.</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">SEO configuration options coming soon</p>
                <p className="text-sm text-gray-400">This feature is under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}