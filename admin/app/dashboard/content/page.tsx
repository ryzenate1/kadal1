"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchWithAuth } from '@/lib/apiUtils';
import { FileUpload } from '@/components/ui/file-upload';
import { 
  LayoutDashboard, 
  Save, 
  PlusCircle, 
  Trash2, 
  Loader2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Edit,
  Globe,
  AlertCircle,
  Upload
} from 'lucide-react';

// Content data structures
interface ContentItem {
  id: string;
  page: string;
  section: string;
  key: string;
  title: string | null;
  content: string;
  type: string;
  order: number;
  active: boolean;
  metadata: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ComponentContent {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  order: number;
  data: Record<string, any>;
  lastModified?: Date;
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("homepage");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Content state
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [newContentItem, setNewContentItem] = useState({
    page: 'home',
    section: 'hero',
    key: '',
    title: '',
    content: '',
    type: 'text',
    order: 0,
    active: true
  });

  // Homepage content state
  const [heroContent, setHeroContent] = useState({
    title: 'Fresh Fish Delivered Daily',
    subtitle: 'Premium quality seafood from ocean to your doorstep',
    buttonText: 'Shop Now',
    backgroundImage: '/images/hero-bg.jpg'
  });

  const [categories, setCategories] = useState([
    { id: '1', name: 'Fresh Fish', image: '/images/categories/fish.jpg', link: '/category/fish' },
    { id: '2', name: 'Prawns & Shrimp', image: '/images/categories/prawns.jpg', link: '/category/prawns' },
    { id: '3', name: 'Crab & Lobster', image: '/images/categories/crab.jpg', link: '/category/crab' },
    { id: '4', name: 'Dried Fish', image: '/images/categories/dried.jpg', link: '/category/dried' }
  ]);

  const [trustBadges, setTrustBadges] = useState([
    { id: '1', title: 'Fresh Guarantee', description: '100% Fresh or Money Back', icon: 'fresh' },
    { id: '2', title: 'Fast Delivery', description: 'Same Day Delivery Available', icon: 'delivery' },
    { id: '3', title: 'Quality Assured', description: 'Premium Quality Seafood', icon: 'quality' }
  ]);

  // API Status state
  const [apiStatus, setApiStatus] = useState({
    backend: { status: 'unknown', message: 'Checking...' },
    database: { status: 'unknown', message: 'Checking...' },
    fileUpload: { status: 'unknown', message: 'Checking...' }
  });  // Fetch content items from API
  const fetchContentItems = useCallback(async () => {
    try {
      setIsLoading(true);
      // Use authenticated fetch
      const items = await fetchWithAuth('/content');
      
      if (items) {
        setContentItems(items);
        
        // Update homepage content from fetched items
        items.forEach((item: ContentItem) => {
          if (item.page === 'home' && item.section === 'hero') {
            if (item.key === 'title') setHeroContent(prev => ({ ...prev, title: item.content }));
            if (item.key === 'subtitle') setHeroContent(prev => ({ ...prev, subtitle: item.content }));
            if (item.key === 'buttonText') setHeroContent(prev => ({ ...prev, buttonText: item.content }));
          }        });
      }
    } catch (error) {
      console.error('Error fetching content items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch content items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Load content on component mount
  useEffect(() => {
    fetchContentItems();
    testApiConnectivity(); // Test API connectivity on load
  }, [fetchContentItems]);

  // Save content item
  const saveContentItem = async (item: Partial<ContentItem>) => {
    try {
      setIsSaving(true);
      const response = await fetchWithAuth('/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Content saved successfully",
        });
        fetchContentItems(); // Refresh the list
      } else {
        throw new Error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save categories content
  const saveCategoriesContent = async () => {
    try {
      setIsSaving(true);
      const response = await fetchWithAuth('/content/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Categories saved successfully",
        });
      } else {
        throw new Error('Failed to save categories');
      }
    } catch (error) {
      console.error('Error saving categories:', error);
      toast({
        title: "Error",
        description: "Failed to save categories",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save trust badges content
  const saveTrustBadgesContent = async () => {
    try {
      setIsSaving(true);
      const response = await fetchWithAuth('/content/trust-badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trustBadges }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Trust badges saved successfully",
        });
      } else {
        throw new Error('Failed to save trust badges');
      }
    } catch (error) {
      console.error('Error saving trust badges:', error);
      toast({
        title: "Error",
        description: "Failed to save trust badges",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update hero content
  const updateHeroContent = async () => {
    const heroItems = [
      { ...newContentItem, key: 'title', content: heroContent.title, section: 'hero' },
      { ...newContentItem, key: 'subtitle', content: heroContent.subtitle, section: 'hero' },
      { ...newContentItem, key: 'buttonText', content: heroContent.buttonText, section: 'hero' },
      { ...newContentItem, key: 'backgroundImage', content: heroContent.backgroundImage, section: 'hero', type: 'image' }
    ];

    for (const item of heroItems) {
      await saveContentItem(item);
    }
  };

  // Delete content item
  const deleteContentItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;

    try {
      const response = await fetchWithAuth(`/content/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Content deleted successfully",
        });
        fetchContentItems(); // Refresh the list
      } else {
        throw new Error('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  // Toggle content item active status
  const toggleContentActive = async (id: string, active: boolean) => {
    try {
      const response = await fetchWithAuth(`/content/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (response.ok) {
        fetchContentItems(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating content status:', error);
    }
  };

  // Add new content item
  const handleAddContentItem = async () => {
    if (!newContentItem.key || !newContentItem.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await saveContentItem(newContentItem);
    
    // Reset form
    setNewContentItem({
      page: 'home',
      section: 'hero',
      key: '',
      title: '',
      content: '',
      type: 'text',
      order: 0,
      active: true
    });
  };

  // Add new category
  const addNewCategory = () => {
    const newId = (categories.length + 1).toString();
    setCategories([...categories, { 
      id: newId, 
      name: 'New Category', 
      image: '/images/categories/new.jpg', 
      link: '/category/new' 
    }]);
  };

  // Remove category
  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      const updated = categories.filter((_, i) => i !== index);
      setCategories(updated);
    }
  };

  // Add new trust badge
  const addNewTrustBadge = () => {
    const newId = (trustBadges.length + 1).toString();
    setTrustBadges([...trustBadges, { 
      id: newId, 
      title: 'New Badge', 
      description: 'Badge description', 
      icon: 'badge' 
    }]);
  };

  // Remove trust badge
  const removeTrustBadge = (index: number) => {
    if (trustBadges.length > 1) {
      const updated = trustBadges.filter((_, i) => i !== index);
      setTrustBadges(updated);
    }
  };  // Test API connectivity
  const testApiConnectivity = async () => {
    console.log('Starting API connectivity test...');
    setIsLoading(true);
    setApiStatus({
      backend: { status: 'checking', message: 'Testing...' },
      database: { status: 'checking', message: 'Testing...' },
      fileUpload: { status: 'checking', message: 'Testing...' }
    });

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    console.log('API Base URL:', apiBaseUrl);

    // Test backend API without authentication (status endpoint should be public)
    try {
      console.log('Testing backend API...');
      const response = await fetch(`${apiBaseUrl}/status`);
      console.log('Backend response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Backend response data:', data);
        setApiStatus(prev => ({ 
          ...prev, 
          backend: { status: 'connected', message: `Connected - ${data.message}` }
        }));
      } else {
        const errorText = await response.text();
        console.log('Backend error response:', errorText);
        setApiStatus(prev => ({ 
          ...prev, 
          backend: { status: 'error', message: `HTTP ${response.status} - ${errorText}` }
        }));
      }
    } catch (error) {
      console.error('Backend API test error:', error);
      setApiStatus(prev => ({ 
        ...prev, 
        backend: { status: 'error', message: `Network error: ${(error as Error).message}` }
      }));
    }

    // Test database connectivity using authenticated request
    try {
      console.log('Testing database connectivity...');
      const data = await fetchWithAuth('/content');
      
      if (data) {
        console.log('Database response data length:', Array.isArray(data) ? data.length : 'Not array');
        setApiStatus(prev => ({ 
          ...prev, 
          database: { status: 'connected', message: 'Connected - Database accessible' }
        }));
      } else {
        setApiStatus(prev => ({ 
          ...prev, 
          database: { status: 'error', message: 'Authentication failed - please login' }
        }));
      }
    } catch (error) {
      console.error('Database test error:', error);
      setApiStatus(prev => ({ 
        ...prev, 
        database: { status: 'error', message: `Network error: ${(error as Error).message}` }
      }));    }
    
    // Test file upload (test with a small mock upload)
    try {
      console.log('Testing file upload...');
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', testFile);

      // Get token for authentication
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('oceanFreshToken') || '';
      }

      const response = await fetch(`${apiBaseUrl}/upload/single`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('File upload test successful:', data);
        setApiStatus(prev => ({ 
          ...prev, 
          fileUpload: { status: 'connected', message: 'File upload operational' }
        }));
      } else {
        const errorText = await response.text();
        console.log('File upload error response:', errorText);
        setApiStatus(prev => ({ 
          ...prev, 
          fileUpload: { status: 'error', message: `Upload failed: ${response.status}` }
        }));
      }
    } catch (error) {
      console.error('File upload test error:', error);
      setApiStatus(prev => ({ 
        ...prev, 
        fileUpload: { status: 'limited', message: 'Upload service unavailable' }
      }));
    }

    console.log('API connectivity test completed');
    setIsLoading(false);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'limited': return 'bg-yellow-500';
      case 'checking': return 'bg-blue-500 animate-pulse';
      default: return 'bg-gray-500';
    }
  };
  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4 lg:p-6">
      <DashboardHeader
        title="Content Management"
        description="Manage website content, homepage components, and page sections."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="homepage" className="text-xs md:text-sm">Homepage</TabsTrigger>
          <TabsTrigger value="content" className="text-xs md:text-sm">Content Items</TabsTrigger>
          <TabsTrigger value="components" className="text-xs md:text-sm">Components</TabsTrigger>
          <TabsTrigger value="files" className="text-xs md:text-sm">Files</TabsTrigger>
          <TabsTrigger value="api" className="text-xs md:text-sm">API Status</TabsTrigger>
        </TabsList>

        {/* Homepage Tab */}
        <TabsContent value="homepage" className="space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard size={20} />
                Hero Section
              </CardTitle>
              <CardDescription>
                Manage the main hero banner content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Main Title</Label>
                  <Input
                    id="hero-title"
                    value={heroContent.title}
                    onChange={(e) => setHeroContent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter main title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero-button">Button Text</Label>
                  <Input
                    id="hero-button"
                    value={heroContent.buttonText}
                    onChange={(e) => setHeroContent(prev => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="Enter button text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={heroContent.subtitle}
                  onChange={(e) => setHeroContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Enter subtitle"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-image">Background Image URL</Label>
                <Input
                  id="hero-image"
                  value={heroContent.backgroundImage}
                  onChange={(e) => setHeroContent(prev => ({ ...prev, backgroundImage: e.target.value }))}
                  placeholder="Enter image URL"
                />
              </div>
              <Button onClick={updateHeroContent} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Hero Content
              </Button>
            </CardContent>
          </Card>          {/* Categories Section */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage category display on homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category, index) => (
                  <div key={category.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Category {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCategory(index)}
                        disabled={categories.length <= 1}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <Input
                      value={category.name}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[index].name = e.target.value;
                        setCategories(updated);
                      }}
                      placeholder="Category name"
                    />
                    <Input
                      value={category.image}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[index].image = e.target.value;
                        setCategories(updated);
                      }}
                      placeholder="Image URL"
                    />
                    <Input
                      value={category.link}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[index].link = e.target.value;
                        setCategories(updated);
                      }}
                      placeholder="Link URL"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={addNewCategory} variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
                <Button onClick={saveCategoriesContent} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Categories
                </Button>
              </div>
            </CardContent>
          </Card>          {/* Trust Badges Section */}
          <Card>
            <CardHeader>
              <CardTitle>Trust Badges</CardTitle>
              <CardDescription>
                Manage trust badges displayed on homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trustBadges.map((badge, index) => (
                  <div key={badge.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Badge {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTrustBadge(index)}
                        disabled={trustBadges.length <= 1}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <Input
                      value={badge.title}
                      onChange={(e) => {
                        const updated = [...trustBadges];
                        updated[index].title = e.target.value;
                        setTrustBadges(updated);
                      }}
                      placeholder="Badge title"
                    />
                    <Textarea
                      value={badge.description}
                      onChange={(e) => {
                        const updated = [...trustBadges];
                        updated[index].description = e.target.value;
                        setTrustBadges(updated);
                      }}
                      placeholder="Badge description"
                      rows={2}
                    />
                    <Input
                      value={badge.icon}
                      onChange={(e) => {
                        const updated = [...trustBadges];
                        updated[index].icon = e.target.value;
                        setTrustBadges(updated);
                      }}
                      placeholder="Icon name"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={addNewTrustBadge} variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Badge
                </Button>
                <Button onClick={saveTrustBadgesContent} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Trust Badges
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Items Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Add New Content Item */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle size={20} />
                Add New Content Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page">Page</Label>
                  <Select value={newContentItem.page} onValueChange={(value) => setNewContentItem(prev => ({ ...prev, page: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="about">About</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="products">Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select value={newContentItem.section} onValueChange={(value) => setNewContentItem(prev => ({ ...prev, section: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="about">About</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="header">Header</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newContentItem.type} onValueChange={(value) => setNewContentItem(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="image">Image URL</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    value={newContentItem.key}
                    onChange={(e) => setNewContentItem(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="Unique key identifier"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newContentItem.title}
                    onChange={(e) => setNewContentItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Optional title"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newContentItem.content}
                  onChange={(e) => setNewContentItem(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter content"
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newContentItem.active}
                    onCheckedChange={(checked) => setNewContentItem(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <Button onClick={handleAddContentItem} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                  Add Content Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Content Items */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Content Items</CardTitle>
              <CardDescription>
                Manage all content items in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : contentItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content items found. Add some content to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contentItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.page}/{item.section}/{item.key}</span>
                          <span className={`px-2 py-1 rounded text-xs ${item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleContentActive(item.id, !item.active)}
                          >
                            {item.active ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteContentItem(item.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      {item.title && (
                        <p className="text-sm font-medium mb-1">{item.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                      </p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Type: {item.type}</span>
                        <span>Order: {item.order}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Components</CardTitle>
              <CardDescription>
                Enable/disable and reorder homepage components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'heroBanner', name: 'Hero Banner', description: 'Main banner with call-to-action' },
                  { key: 'trustBadges', name: 'Trust Badges', description: 'Quality assurance badges' },
                  { key: 'categories', name: 'Categories', description: 'Product category grid' },
                  { key: 'featuredProducts', name: 'Featured Products', description: 'Highlighted products' },
                  { key: 'freshDelivery', name: 'Fresh Delivery', description: 'Delivery information section' },
                  { key: 'sustainability', name: 'Sustainability', description: 'Environmental commitment' },
                  { key: 'testimonials', name: 'Testimonials', description: 'Customer reviews' },
                ].map((component) => (
                  <div key={component.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{component.name}</h4>
                      <p className="text-sm text-muted-foreground">{component.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <Button variant="outline" size="sm">
                        <Edit size={14} />
                      </Button>
                      <div className="flex flex-col">
                        <Button variant="ghost" size="sm" className="h-6 p-1">
                          <ArrowUp size={12} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 p-1">
                          <ArrowDown size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Status Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} />
                API Connectivity Status
              </CardTitle>
              <CardDescription>
                Monitor the connection between admin and backend services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Backend API</h4>
                    <p className="text-sm text-muted-foreground">Main API server connection</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(apiStatus.backend.status)}`}></div>
                    <span className="text-sm">{apiStatus.backend.message}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Database</h4>
                    <p className="text-sm text-muted-foreground">Database connectivity</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(apiStatus.database.status)}`}></div>
                    <span className="text-sm">{apiStatus.database.message}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">File Upload</h4>
                    <p className="text-sm text-muted-foreground">File upload service</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(apiStatus.fileUpload.status)}`}></div>
                    <span className="text-sm">{apiStatus.fileUpload.message}</span>
                  </div>
                </div>
                <Button onClick={testApiConnectivity} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                File Upload
              </CardTitle>
              <CardDescription>
                Upload images and files for use in content management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUpload={(files) => {
                  console.log('Files uploaded:', files);
                  toast({
                    title: "Files Uploaded",
                    description: `${files.length} file(s) uploaded successfully`,
                  });
                }}
                multiple={true}
                accept="image/*"
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </CardContent>
          </Card>

          {/* File Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>File Manager</CardTitle>
              <CardDescription>
                Manage uploaded files and media assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>File management interface coming soon...</p>
                <p className="text-sm">Files are uploaded to /uploads directory</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}