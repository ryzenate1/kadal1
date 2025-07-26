"use client";

import { useEffect, useState, useCallback } from 'react';
import { DashboardHeaderWithAddButton } from '@/components/dashboard/dashboard-header';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileEdit, Trash2, AlertTriangle, Loader2, Search, Image as ImageIcon, 
  MoveUp, MoveDown, Eye, EyeOff, Fish, Shell, Anchor, CheckCircle, ArrowUpDown,
  CheckCircle2, RefreshCw, ExternalLink, UploadCloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { adminApi } from "@/lib/apiUtils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SERVER_API_URL = 'http://localhost:5001/api';
const CLIENT_API_URL = 'http://localhost:3000/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  order: number;
  isActive: boolean;
  type?: string;
  icon?: string;
}

interface ApiStatus {
  server: 'connected' | 'disconnected' | 'checking';
  client: 'connected' | 'disconnected' | 'checking';
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'order' | 'name' | 'updatedAt'>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showPreviewGrid, setShowPreviewGrid] = useState(true);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    server: 'checking',
    client: 'checking'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    imageFile: null as File | null,
    order: 0,
    isActive: true,
    type: 'Fish',
    icon: 'Fish',
  });

  const iconOptions = [
    { value: 'Fish', label: 'Fish', icon: <Fish className="w-4 h-4" /> },
    { value: 'Shell', label: 'Shell', icon: <Shell className="w-4 h-4" /> },
    { value: 'Anchor', label: 'Anchor', icon: <Anchor className="w-4 h-4" /> }
  ];

  const typeOptions = [
    'Fish', 'Prawns', 'Shellfish', 'Crabs', 'Cephalopods', 'Combo', 'Premium', 'Dried Fish', 'Fresh'
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Fish': return <Fish className="w-4 h-4" />;
      case 'Shell': return <Shell className="w-4 h-4" />;
      case 'Anchor': return <Anchor className="w-4 h-4" />;
      default: return <Fish className="w-4 h-4" />;
    }
  };

  const generateSlug = (name: string): string => {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Check API connections
  const checkApiConnections = useCallback(async () => {
    // Check server connection
    try {
      const serverRes = await fetch(`${SERVER_API_URL}/categories`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      setApiStatus(prev => ({ ...prev, server: serverRes.ok ? 'connected' : 'disconnected' }));
    } catch (error) {
      console.error('Server API connection error:', error);
      setApiStatus(prev => ({ ...prev, server: 'disconnected' }));
    }

    // Check client connection
    try {
      const clientRes = await fetch(`${CLIENT_API_URL}/categories`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      setApiStatus(prev => ({ ...prev, client: clientRes.ok ? 'connected' : 'disconnected' }));
    } catch (error) {
      console.error('Client API connection error:', error);
      setApiStatus(prev => ({ ...prev, client: 'disconnected' }));
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try the local API first
      let data: Category[] = [];
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error(`API returned status ${response.status}`);
        }
      } catch (apiError: any) {
        console.warn('Local API fetch failed, trying server API:', apiError.message);
        
        // Try the server API as fallback
        try {
          const serverResponse = await fetch(`${SERVER_API_URL}/categories`, { 
            cache: 'no-store'
          });
          
          if (serverResponse.ok) {
            const serverData = await serverResponse.json();
            data = serverData;
          } else {
            throw new Error(`Server API returned status ${serverResponse.status}`);
          }
        } catch (serverError) {
          console.warn('Server API fetch also failed, using fallback data:', serverError);
          
          // Fallback data if both APIs fail
          data = [
            {
              id: 'vangaram-fish',
              name: 'Vangaram Fish',
              slug: 'vangaram-fish',
              description: 'Premium quality Vangaram fish fresh from the ocean',
              imageUrl: 'https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?q=80&w=1974&auto=format&fit=crop',
              order: 0,
              isActive: true,
              type: 'Fish',
              icon: 'Fish'
            },
            {
              id: 'sliced-vangaram',
              name: 'Sliced Vangaram',
              slug: 'sliced-vangaram',
              description: 'Pre-sliced Vangaram fish, ready to cook',
              imageUrl: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
              order: 1,
              isActive: true,
              type: 'Fish',
              icon: 'Fish'
            }
          ];
        }
      }
      
      // Ensure consistent image handling
      data = data.map(category => ({
        ...category,
        imageUrl: category.imageUrl || category.image || '',
      }));
      
      setCategories(data);
      
      // After fetching, check API connections
      await checkApiConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
      toast({ 
        title: "Error Fetching Categories", 
        description: err.message || 'An unexpected error occurred', 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toast, checkApiConnections]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'name' && formMode === 'create') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, imageFile: file, imageUrl: '' }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddClick = () => {
    setFormMode('create');
    setEditingCategory(null);
    
    // Get the max order value to position new category at the end
    const maxOrder = categories.length > 0 
      ? Math.max(...categories.map(c => c.order || 0)) + 1 
      : 0;
    
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      imageFile: null,
      order: maxOrder,
      isActive: true,
      type: 'Fish',
      icon: 'Fish',
    });
    setShowForm(true);
    setFormError(null);
  };

  const handleEditClick = (category: Category) => {
    setFormMode('edit');
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      imageFile: null,
      order: category.order,
      isActive: category.isActive,
      type: category.type || 'Fish',
      icon: category.icon || 'Fish',
    });
    setShowForm(true);
    setFormError(null);
    setImagePreview(category.imageUrl || null);
  };

  const toggleSorting = (field: 'order' | 'name' | 'updatedAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleUpdateOrder = async (categoryId: string, direction: 'up' | 'down') => {
    try {
      const index = categories.findIndex(c => c.id === categoryId);
      if (index === -1) return;
      
      const category = categories[index];
      
      // For 'up' we swap with the previous item, for 'down' with the next
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Check if the target index is valid
      if (targetIndex < 0 || targetIndex >= categories.length) return;
      
      // Swap orders
      const targetCategory = categories[targetIndex];
      const tempOrder = category.order;
      
      // Update in our local state first
      const updatedCategories = [...categories];
      updatedCategories[index] = { ...category, order: targetCategory.order };
      updatedCategories[targetIndex] = { ...targetCategory, order: tempOrder };
      
      // Sort by the updated orders
      updatedCategories.sort((a, b) => a.order - b.order);
      
      // Update state optimistically
      setCategories(updatedCategories);
      
      // Now update on the server
      try {
        const res = await fetch(`/api/categories?id=${category.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: targetCategory.order }),
        });
        
        if (!res.ok) throw new Error(`Failed to update order (Status: ${res.status})`);
        
        // Also update the swapped category
        const res2 = await fetch(`/api/categories?id=${targetCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: tempOrder }),
        });
        
        if (!res2.ok) throw new Error(`Failed to update order (Status: ${res2.status})`);
        
        toast({
          title: "Order Updated",
          description: `${category.name} has been moved ${direction}.`,
          variant: "default"
        });
      } catch (error: any) {
        console.error('Error updating order:', error);
        toast({
          title: "Error Updating Order",
          description: error.message || "An unexpected error occurred",
          variant: "destructive"
        });
        
        // Revert the optimistic update
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      // Update in our local state first for optimistic UI
      const updatedCategories = categories.map(c => 
        c.id === category.id ? { ...c, isActive: !c.isActive } : c
      );
      
      setCategories(updatedCategories);
      
      // Now update on the server
      try {
        const res = await fetch(`/api/categories?id=${category.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !category.isActive }),
        });
        
        if (!res.ok) throw new Error(`Failed to update status (Status: ${res.status})`);
        
        toast({
          title: "Status Updated",
          description: `${category.name} is now ${!category.isActive ? 'active' : 'hidden'}.`,
          variant: "default"
        });
        
        // Try to update on client-side as well if the API is connected
        if (apiStatus.client === 'connected') {
          try {
            await fetch(`${CLIENT_API_URL}/categories/${category.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: !category.isActive }),
            });
            console.log('Category status also updated on client-side');
          } catch (clientError) {
            console.warn('Could not update client-side category status:', clientError);
          }
        }
      } catch (error: any) {
        console.error('Error updating status:', error);
        toast({
          title: "Error Updating Status",
          description: error.message || "An unexpected error occurred",
          variant: "destructive"
        });
        
        // Revert the optimistic update
        fetchCategories();
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCategories();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.slug) {
        setFormError('Name and slug are required fields');
        setFormLoading(false);
        return;
      }
      
      // Create the payload
      const payload: Partial<Category> = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        order: formData.order,
        isActive: formData.isActive,
        type: formData.type,
        icon: formData.icon,
      };
      
      // Handle image uploading
      if (formData.imageFile) {
        // In a real app, you would upload the file to storage and get a URL
        // For this example, we'll just use a data URL
        const reader = new FileReader();
        reader.onloadend = async () => {
          // Image URL would be set here in a real app
          // For this demo, we'll use the reader result as a mock URL
          payload.imageUrl = reader.result as string;
          
          await saveCategory(payload);
        };
        reader.readAsDataURL(formData.imageFile);
      } else if (formData.imageUrl) {
        payload.imageUrl = formData.imageUrl;
        await saveCategory(payload);
      } else {
        await saveCategory(payload);
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setFormError(error.message || 'An unexpected error occurred');
      setFormLoading(false);
    }
  };
  
  const saveCategory = async (payload: Partial<Category>) => {
    try {
      let res;
      
      if (formMode === 'create') {
        // Create new category
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (formMode === 'edit' && editingCategory) {
        // Update existing category
        res = await fetch(`/api/categories?id=${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        throw new Error('Invalid form mode or missing category ID');
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `API returned status ${res.status}`);
      }
      
      const savedCategory = await res.json();
      
      // Success!
      toast({
        title: formMode === 'create' ? "Category Created" : "Category Updated",
        description: `${savedCategory.name} has been ${formMode === 'create' ? 'created' : 'updated'} successfully.`,
        variant: "default"
      });
      
      // Close the form and refresh the list
      setShowForm(false);
      fetchCategories();
      
      // Try to sync with client-side if connected
      if (apiStatus.client === 'connected') {
        try {
          if (formMode === 'create') {
            await fetch(`${CLIENT_API_URL}/categories`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(savedCategory),
            });
          } else {
            await fetch(`${CLIENT_API_URL}/categories/${savedCategory.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(savedCategory),
            });
          }
          console.log('Category also synced to client-side');
        } catch (clientError) {
          console.warn('Could not sync category to client-side:', clientError);
        }
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      setFormError(error.message || 'An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(categoryId);
    
    try {
      const res = await fetch(`/api/categories?id=${categoryId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `API returned status ${res.status}`);
      }
      
      toast({
        title: "Category Deleted",
        description: "The category has been deleted successfully.",
        variant: "default"
      });
      
      // Refresh the list
      fetchCategories();
      
      // Try to delete from client-side if connected
      if (apiStatus.client === 'connected') {
        try {
          await fetch(`${CLIENT_API_URL}/categories/${categoryId}`, {
            method: 'DELETE',
          });
          console.log('Category also deleted from client-side');
        } catch (clientError) {
          console.warn('Could not delete category from client-side:', clientError);
        }
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error Deleting Category",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get filtered and sorted categories
  const filteredCategories = categories.filter(category => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(term) ||
      category.slug.toLowerCase().includes(term) ||
      category.description?.toLowerCase().includes(term) ||
      category.type?.toLowerCase().includes(term)
    );
  });
  
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'order') {
      return sortDirection === 'asc'
        ? a.order - b.order
        : b.order - a.order;
    }
    
    // Default sort by order
    return a.order - b.order;
  });

  return (
    <div className="container mx-auto p-4 space-y-8">
      <DashboardHeaderWithAddButton
        title="Categories"
        description="Manage seafood categories displayed on the website"
        buttonLabel="Add New Category"
        onClick={handleAddClick}
      />

      {/* API Connection Status */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Client API:</span>
          <Badge variant={apiStatus.client === 'connected' ? 'success' : 'destructive'} className="flex items-center gap-1">
            {apiStatus.client === 'checking' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Checking</span>
              </>
            ) : apiStatus.client === 'connected' ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                <span>Disconnected</span>
              </>
            )}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => window.open(`${CLIENT_API_URL}/categories`, '_blank')}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open client API in new tab</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Server API:</span>
          <Badge variant={apiStatus.server === 'connected' ? 'success' : 'destructive'} className="flex items-center gap-1">
            {apiStatus.server === 'checking' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Checking</span>
              </>
            ) : apiStatus.server === 'connected' ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                <span>Disconnected</span>
              </>
            )}
          </Badge>
        </div>

        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            {isRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error message if any */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and grid toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search categories..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showPreviewGrid ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowPreviewGrid(true)}
            className="flex items-center gap-1"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Grid View</span>
          </Button>
          <Button 
            variant={!showPreviewGrid ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowPreviewGrid(false)}
            className="flex items-center gap-1"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>List View</span>
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading categories...</span>
        </div>
      )}

      {/* Grid view */}
      {!loading && showPreviewGrid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
              <div className="relative h-48">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-slate-100">
                    <ImageIcon className="h-12 w-12 text-slate-400" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 p-1 rounded-full 
                  ${category.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                  {category.isActive ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg truncate">{category.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{category.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded-full">
                    {getIconComponent(category.icon || 'Fish')}
                    <span className="text-xs text-blue-800">{category.type || 'Fish'}</span>
                  </div>
                </div>
                <p className="text-sm line-clamp-2 mt-2 text-slate-600">
                  {category.description || `Category for ${category.name}`}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(category)}
                      className="flex items-center p-1 h-8"
                    >
                      <FileEdit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCategoryStatus(category)}
                      className="flex items-center p-1 h-8"
                    >
                      {category.isActive ? (
                        <EyeOff className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(category.id)}
                      disabled={deleteLoading === category.id}
                      className="flex items-center p-1 h-8"
                    >
                      {deleteLoading === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateOrder(category.id, 'up')}
                      className="p-1 h-8"
                      disabled={sortedCategories.indexOf(category) === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateOrder(category.id, 'down')}
                      className="p-1 h-8"
                      disabled={sortedCategories.indexOf(category) === sortedCategories.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table view */}
      {!loading && !showPreviewGrid && (
        <div className="bg-white overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSorting('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {sortField === 'name' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead className="hidden md:table-cell">Icon</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No categories found. Click the "Add Category" button to create one.
                  </TableCell>
                </TableRow>
              ) : (
                sortedCategories.map((category, index) => (
                  <TableRow key={category.id}>
                    <TableCell className="text-center font-medium">{category.order}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full">
                              <ImageIcon className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">
                            {category.description || `Category for ${category.name}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="flex items-center gap-1 w-fit" variant="outline">
                        {getIconComponent(category.icon || 'Fish')}
                        <span>{category.type || 'Fish'}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={category.isActive ? "success" : "secondary"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {category.isActive ? (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Hidden</span>
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                        {category.slug}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        {getIconComponent(category.icon || 'Fish')}
                        <span className="text-xs ml-1">{category.icon || 'Fish'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateOrder(category.id, 'up')}
                          className="p-1 h-8"
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateOrder(category.id, 'down')}
                          className="p-1 h-8"
                          disabled={index === sortedCategories.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryStatus(category)}
                          className="p-1 h-8"
                        >
                          {category.isActive ? (
                            <EyeOff className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(category)}
                          className="p-1 h-8"
                        >
                          <FileEdit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(category.id)}
                          disabled={deleteLoading === category.id}
                          className="p-1 h-8"
                        >
                          {deleteLoading === category.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {formMode === 'create' ? 'Add New Category' : 'Edit Category'}
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>

              {formError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{formError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Fresh Fish"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="e.g., fresh-fish"
                      required
                    />
                    <p className="text-xs text-slate-500">
                      URL-friendly version of the name. Auto-generated but can be customized.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Short description of this category"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleSelectChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon</Label>
                      <Select
                        value={formData.icon}
                        onValueChange={(value) => handleSelectChange('icon', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {option.icon}
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      name="order"
                      type="number"
                      value={formData.order}
                      onChange={handleInputChange}
                      min={0}
                    />
                    <p className="text-xs text-slate-500">
                      Lower numbers appear first. Categories with the same order are sorted alphabetically.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Active (visible on website)
                    </Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category Image</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto max-h-48 object-contain rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData(prev => ({ ...prev, imageFile: null, imageUrl: '' }));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="py-8">
                          <div className="flex flex-col items-center">
                            <UploadCloud className="h-12 w-12 text-slate-300 mb-2" />
                            <p className="text-sm text-slate-500 mb-2">
                              Drag & drop an image or click to browse
                            </p>
                            <p className="text-xs text-slate-400 mb-4">
                              Recommended size: 800x600px, max 2MB
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        id="imageFile"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="imageFile">
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                          onClick={() => document.getElementById('imageFile')?.click()}
                        >
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </Button>
                      </label>
                    </div>
                    
                    <div className="text-xs text-slate-500 mt-2">
                      <p>Or provide an image URL:</p>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                        disabled={!!formData.imageFile}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="min-w-[120px]"
                >
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {formMode === 'create' ? 'Create Category' : 'Update Category'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
} 