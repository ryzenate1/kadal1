"use client";

import { useEffect, useState } from 'react';
import { DashboardHeaderWithAddButton } from '@/components/dashboard/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileEdit, Trash2, AlertTriangle, Loader2, Search, Image as ImageIcon,
  Fish, Anchor, Waves, Star, ShoppingCart, Tag, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { ApiStatus } from '@/components/dashboard/api-status';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:5001/api';

interface FishPick {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  originalPrice: number;
  weight: string;
  freshness: string;
  iconName: string;
  color: string;
  rating: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function FishPicksPage() {
  const [fishPicks, setFishPicks] = useState<FishPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingFish, setEditingFish] = useState<FishPick | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Omit<FishPick, 'id' | 'createdAt' | 'updatedAt'> & { imageFile?: File | null }>({
    name: '',
    image: '',
    category: 'Premium Catch',
    price: 899,
    originalPrice: 999,
    weight: '500g',
    freshness: 'Fresh Today',
    iconName: 'Fish',
    color: 'bg-gradient-to-br from-blue-500 to-red-500',
    rating: 4.8,
    description: '',
    isActive: true,
    imageFile: null,
  });

  const iconOptions = [
    { value: 'Fish', label: 'Fish', icon: <Fish className="w-4 h-4" /> },
    { value: 'Anchor', label: 'Anchor', icon: <Anchor className="w-4 h-4" /> },
    { value: 'Waves', label: 'Waves', icon: <Waves className="w-4 h-4" /> },
    { value: 'Star', label: 'Star', icon: <Star className="w-4 h-4" /> },
    { value: 'Sparkles', label: 'Sparkles', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const categoryOptions = [
    'Premium Catch', 'Fresh Shellfish', 'Daily Fresh', 'Premium', 'Special Catch'
  ];

  const colorOptions = [
    { value: 'bg-gradient-to-br from-blue-500 to-red-500', label: 'Blue to Red', preview: 'linear-gradient(to bottom right, #3b82f6, #ef4444)' },
    { value: 'bg-gradient-to-br from-green-500 to-red-600', label: 'Green to Red', preview: 'linear-gradient(to bottom right, #22c55e, #dc2626)' },
    { value: 'bg-gradient-to-br from-purple-500 to-red-500', label: 'Purple to Red', preview: 'linear-gradient(to bottom right, #a855f7, #ef4444)' },
    { value: 'bg-gradient-to-br from-orange-500 to-red-500', label: 'Orange to Red', preview: 'linear-gradient(to bottom right, #f97316, #ef4444)' },
    { value: 'bg-gradient-to-br from-pink-500 to-red-500', label: 'Pink to Red', preview: 'linear-gradient(to bottom right, #ec4899, #ef4444)' },
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Fish': return <Fish className="w-4 h-4" />;
      case 'Anchor': return <Anchor className="w-4 h-4" />;
      case 'Waves': return <Waves className="w-4 h-4" />;
      case 'Star': return <Star className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      default: return <Fish className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchFishPicks();
  }, []);
  const fetchFishPicks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fish-picks', {
        headers: {
          'Authorization': 'Bearer admin-test-token'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fish picks (Status: ${response.status})`);
      }
      
      const data = await response.json();
      setFishPicks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching fish picks:', err);
      setError(err.message || 'Failed to load fish picks');
      setFishPicks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const token = localStorage.getItem('oceanFreshToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${ADMIN_API_URL}/upload/image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Image upload failed' }));
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: "Image Upload Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Fish name is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (formData.price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      if (formData.originalPrice < formData.price) {
        throw new Error('Original price must be greater than or equal to current price');
      }

      let finalImageUrl = formData.image;
      
      // Handle image upload if a new file was selected
      if (formData.imageFile) {
        const uploadedUrl = await handleImageUpload(formData.imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          // If upload failed, don't proceed
          setFormLoading(false);
          return;
        }
      }

      // Require image for new entries
      if (formMode === 'create' && !finalImageUrl) {
        throw new Error('Image is required for new fish picks');
      }

      const token = localStorage.getItem('oceanFreshToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const url = formMode === 'edit' 
        ? `/api/fish-picks?id=${editingFish?.id}`
        : '/api/fish-picks';
      
      const method = formMode === 'edit' ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        image: finalImageUrl
      };
      delete payload.imageFile;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
        throw new Error(errorData.message || `Failed to ${formMode === 'edit' ? 'update' : 'create'} fish pick`);
      }

      const savedFish = await response.json();
      
      toast({
        title: `Fish Pick ${formMode === 'edit' ? 'Updated' : 'Created'}`,
        description: `"${savedFish.name}" has been successfully saved.`,
      });

      await fetchFishPicks();
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error saving fish pick:', err);
      setFormError(err.message);
      toast({
        title: "Save Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (fish: FishPick) => {
    setEditingFish(fish);
    setFormData({
      name: fish.name,
      image: fish.image,
      category: fish.category,
      price: fish.price,
      originalPrice: fish.originalPrice,
      weight: fish.weight,
      freshness: fish.freshness,
      iconName: fish.iconName,
      color: fish.color,
      rating: fish.rating,
      description: fish.description,
      isActive: fish.isActive,
      imageFile: null,
    });
    setImagePreview(fish.image);
    setFormMode('edit');
    setShowForm(true);
    setFormError(null);
  };
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [deleteTimers, setDeleteTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  const handleDelete = async (fishId: string) => {
    if (!confirm('Are you sure you want to delete this fish pick?')) {
      return;
    }

    try {
      const token = localStorage.getItem('oceanFreshToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }      // Mark as pending delete
      setPendingDeletes(prev => {
        const newSet = new Set(prev);
        newSet.add(fishId);
        return newSet;
      });
      
      // Set up undo timer (10 seconds)
      const timer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/fish-picks?id=${fishId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            throw new Error(errorData.message || 'Failed to delete fish pick');
          }

          // Remove from fish picks list
          setFishPicks(prev => prev.filter(fish => fish.id !== fishId));
          setPendingDeletes(prev => {
            const newSet = new Set(prev);
            newSet.delete(fishId);
            return newSet;
          });
          
          toast({
            title: "Fish Pick Deleted",
            description: "The fish pick has been permanently deleted.",
          });
        } catch (err: any) {
          console.error('Error deleting fish pick:', err);
          setPendingDeletes(prev => {
            const newSet = new Set(prev);
            newSet.delete(fishId);
            return newSet;
          });
          toast({
            title: "Delete Error",
            description: err.message,
            variant: "destructive",
          });
        }
        
        // Clean up timer
        setDeleteTimers(prev => {
          const newMap = new Map(prev);
          newMap.delete(fishId);
          return newMap;
        });
      }, 10000);      // Store timer for potential cancellation
      setDeleteTimers(prev => {
        const newMap = new Map(prev);
        newMap.set(fishId, timer);
        return newMap;
      });

      toast({
        title: "Fish Pick Queued for Deletion",
        description: (
          <div className="flex items-center justify-between">
            <span>Will be deleted in 10 seconds</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleUndoDelete(fishId)}
              className="ml-2"
            >
              Undo
            </Button>
          </div>
        ),
        duration: 10000,
      });

    } catch (err: any) {
      console.error('Error starting delete process:', err);
      toast({
        title: "Delete Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleUndoDelete = (fishId: string) => {
    // Clear the timer
    const timer = deleteTimers.get(fishId);
    if (timer) {
      clearTimeout(timer);
      setDeleteTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(fishId);
        return newMap;
      });
    }

    // Remove from pending deletes
    setPendingDeletes(prev => {
      const newSet = new Set(prev);
      newSet.delete(fishId);
      return newSet;
    });

    toast({
      title: "Delete Cancelled",
      description: "The fish pick deletion has been cancelled.",
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      category: 'Premium Catch',
      price: 899,
      originalPrice: 999,
      weight: '500g',
      freshness: 'Fresh Today',
      iconName: 'Fish',
      color: 'bg-gradient-to-br from-blue-500 to-red-500',
      rating: 4.8,
      description: '',
      isActive: true,
      imageFile: null,
    });
    setImagePreview(null);
    setEditingFish(null);
    setFormMode('create');
    setFormError(null);
  };

  const filteredFishPicks = fishPicks.filter(fish =>
    fish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fish.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>      <DashboardHeaderWithAddButton
        title="Fish Picks"
        description='Manage the "Feeling Lucky" fish cards shown on the client website homepage. These are the fish that appear in the interactive card deck.'
        buttonLabel={showForm ? "Cancel" : "Add Fish Pick"}
        onClick={() => {
          if (showForm) {
            resetForm();
            setShowForm(false);
          } else {
            resetForm();
            setShowForm(true);
          }
        }}
      />

      {/* API Connection Status */}
      <ApiStatus endpoint="fish-picks" onRefresh={fetchFishPicks} />

      <div className="mt-6 space-y-6">
        {/* Add/Edit Form */}
        {showForm && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {formMode === 'edit' ? 'Edit Fish Pick' : 'Add New Fish Pick'}
            </h3>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">Fish Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Seer Fish (Vanjaram)"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div>
                  <Label htmlFor="price">Current Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    min="1"
                    required
                  />
                </div>

                {/* Original Price */}
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹) *</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', parseInt(e.target.value) || 0)}
                    min="1"
                    required
                  />
                </div>

                {/* Weight */}
                <div>
                  <Label htmlFor="weight">Weight *</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="e.g., 500g, 1kg"
                    required
                  />
                </div>

                {/* Freshness */}
                <div>
                  <Label htmlFor="freshness">Freshness *</Label>
                  <Input
                    id="freshness"
                    value={formData.freshness}
                    onChange={(e) => handleInputChange('freshness', e.target.value)}
                    placeholder="e.g., Fresh Today, Morning Catch"
                    required
                  />
                </div>

                {/* Rating */}
                <div>
                  <Label htmlFor="rating">Rating (1-5) *</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 1)}
                    required
                  />
                </div>

                {/* Icon */}
                <div>
                  <Label htmlFor="icon">Icon *</Label>
                  <Select
                    value={formData.iconName}
                    onValueChange={(value) => handleInputChange('iconName', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            {option.icon}
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Gradient */}
                <div className="md:col-span-2">
                  <Label>Color Gradient *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                    {colorOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('color', option.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.color === option.value 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-full h-8 rounded-md mb-1"
                          style={{ background: option.preview }}
                        />
                        <div className="text-xs text-gray-600">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {(imagePreview || formData.image) && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview || formData.image} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the fish, its taste, cooking methods, etc."
                    rows={3}
                    required
                  />
                </div>

                {/* Active Toggle */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Active Status</Label>
                      <p className="text-sm text-gray-500">
                        Only active fish picks will appear in the "Feeling Lucky" card deck
                      </p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {formMode === 'edit' ? 'Update Fish Pick' : 'Create Fish Pick'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search and List */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search fish picks by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading fish picks...</span>
            </div>
          ) : filteredFishPicks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No fish picks found matching your search.' : 'No fish picks found. Add your first fish pick to get started.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFishPicks.map((fish) => (
                <div key={fish.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    {fish.image ? (
                      <img
                        src={fish.image}
                        alt={fish.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        fish.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {fish.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="absolute top-3 right-3">
                      <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${fish.color}`}>
                        {fish.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{fish.name}</h3>
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                        {getIconComponent(fish.iconName)}
                        <span>{fish.iconName}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{fish.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-blue-600">₹{fish.price}</span>
                        {fish.originalPrice > fish.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{fish.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{fish.weight}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{fish.rating}</span>
                      </div>
                      <span className="text-sm text-green-600 font-medium">{fish.freshness}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(fish)}
                        className="flex-1"
                      >
                        <FileEdit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(fish.id)}
                        disabled={deleteLoading === fish.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleteLoading === fish.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
