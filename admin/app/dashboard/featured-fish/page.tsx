"use client";

import { useEffect, useState, useCallback } from 'react';
import { DashboardHeaderWithAddButton } from '@/components/dashboard/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileEdit, Trash2, AlertTriangle, Loader2, Search, Image as ImageIcon,
  Fish, Anchor, Waves, Star, ShoppingCart, Tag
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
import Image from 'next/image';
import { fetchWithAuth, parseErrorResponse, adminApi } from '@/lib/apiUtils';

// Use environment variable with fallback
const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api';

interface FeaturedFish {
  id: string;
  name: string;
  image: string;
  slug: string;
  type: string;
  description: string;
  featured: boolean;
  price: number;
  weight: string;
  discount: number;
  iconName: string;
  isActive: boolean;
}

export default function FeaturedFishPage() {
  const [featuredFish, setFeaturedFish] = useState<FeaturedFish[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingFish, setEditingFish] = useState<FeaturedFish | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    slug: '',
    type: 'Premium',
    description: '',
    featured: true,
    price: 899,
    weight: '500g',
    discount: 10,
    iconName: 'Fish',
    isActive: true,
    imageFile: null as File | null,
  });

  const iconOptions = [
    { value: 'Fish', label: 'Fish', icon: <Fish className="w-4 h-4" /> },
    { value: 'Anchor', label: 'Anchor', icon: <Anchor className="w-4 h-4" /> },
    { value: 'Waves', label: 'Waves', icon: <Waves className="w-4 h-4" /> },
    { value: 'Shell', label: 'Shell', icon: <Tag className="w-4 h-4" /> }
  ];

  const typeOptions = [
    'Premium', 'Fresh', 'Combo', 'Dried Fish', 'Shellfish', 'Special'
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Fish': return <Fish className="w-4 h-4" />;
      case 'Anchor': return <Anchor className="w-4 h-4" />;
      case 'Waves': return <Waves className="w-4 h-4" />;
      case 'Shell': return <Tag className="w-4 h-4" />;
      default: return <Fish className="w-4 h-4" />;
    }
  };
  const fetchFeaturedFish = useCallback(async () => {
    setLoading(true);
    setError(null);    try {
      // Fetch featured fish using the correct endpoint
      const data = await fetchWithAuth('/featured-fish');
      
      if (Array.isArray(data)) {
        setFeaturedFish(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setFeaturedFish(data.data);
      } else {
        throw new Error('Invalid response format from featured-fish API');
      }
    } catch (err: any) {
      console.error('Error loading featured fish:', err);
      setError(err.message || 'An error occurred while loading featured fish');
      setFeaturedFish([]);
      toast({ 
        title: "Error Loading Featured Fish", 
        description: err.message || "Failed to load featured fish data", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFeaturedFish();
  }, [fetchFeaturedFish]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
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
      setFormData(prev => ({ ...prev, imageFile: file, image: '' }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddClick = () => {
    setFormMode('create');
    setEditingFish(null);
    
    setFormData({
      name: '',
      image: '',
      slug: '',
      type: 'Premium',
      description: '',
      featured: true,
      price: 899,
      weight: '500g',
      discount: 10,
      iconName: 'Fish',
      isActive: true,
      imageFile: null
    });
    setShowForm(true);
    setFormError(null);
    setImagePreview(null);
  };

  const handleEditClick = (fish: FeaturedFish) => {
    setFormMode('edit');
    setEditingFish(fish);
    setFormData({
      name: fish.name,
      image: fish.image,
      slug: fish.slug,
      type: fish.type,
      description: fish.description,
      featured: fish.featured,
      price: fish.price,
      weight: fish.weight,
      discount: fish.discount,
      iconName: fish.iconName,
      isActive: fish.isActive,
      imageFile: null
    });
    setShowForm(true);
    setFormError(null);
    setImagePreview(fish.image);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return null;
    
    setFormLoading(true);
    setFormError(null);
    
    try {
      // Use the new uploadFileWithAuth function instead of fetch
      const uploadResponse = await adminApi.uploadFileWithAuth(
        `${SERVER_API_URL}/upload/featured-fish`,
        file,
        { type: 'featured-fish' }
      );
      
      if (!uploadResponse || !uploadResponse.url) {
        throw new Error('Image upload failed');
      }
      
      console.log('Image upload successful:', uploadResponse);
      return uploadResponse.url;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setFormError(`Image upload failed: ${error.message}`);
      toast({
        title: "Image Upload Failed",
        description: error.message || "Could not upload image. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    
    try {
      const imageUrl = await handleImageUpload(formData.imageFile as File);
      
      const fishData = {
        id: editingFish?.id || `fish_${Date.now()}`,
        name: formData.name,
        image: imageUrl || formData.image,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        type: formData.type,
        description: formData.description,
        featured: true,
        price: formData.price,
        weight: formData.weight,
        discount: formData.discount,
        iconName: formData.iconName,
        isActive: formData.isActive
      };
        // Check if this is an edit or create operation
      const method = formMode === 'edit' ? 'PUT' : 'POST';
      const responseData = await fetchWithAuth('/featured-fish', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fishData),
      });
      
      if (formMode === 'edit') {
        setFeaturedFish(prev => prev.map(fish => fish.id === responseData.id ? responseData : fish));
        toast({
          title: "Success",
          description: "Featured fish updated successfully",
        });
      } else {
        setFeaturedFish(prev => [...prev, responseData]);
        toast({
          title: "Success",
          description: "New featured fish added successfully",
        });
      }
      
      setShowForm(false);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setFormError(err.message || "An error occurred. Please try again.");
      
      toast({
        title: "Error",
        description: err.message || "Failed to save featured fish",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = async (fishId: string) => {
    if (confirm("Are you sure you want to delete this featured fish?")) {
      setDeleteLoading(fishId);
        try {
        const data = await fetchWithAuth(`/featured-fish/${fishId}`, {
          method: 'DELETE',
        });
        
        setFeaturedFish(prev => prev.filter(fish => fish.id !== fishId));
        
        toast({
          title: "Success",
          description: "Featured fish deleted successfully",
        });
      } catch (err: any) {
        console.error('Error deleting featured fish:', err);
        
        toast({
          title: "Error",
          description: err.message || "Failed to delete featured fish",
          variant: "destructive",
        });
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const toggleFishStatus = async (fish: FeaturedFish) => {    try {
      const updatedFish = { ...fish, isActive: !fish.isActive };
      
      const data = await fetchWithAuth('/featured-fish', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFish),
      });
      
      setFeaturedFish(prev => 
        prev.map(item => item.id === fish.id ? updatedFish : item)
      );
      
      toast({
        title: "Status Updated",
        description: `Featured fish is now ${updatedFish.isActive ? 'active' : 'inactive'}`,
      });
    } catch (err: any) {
      console.error('Error toggling status:', err);
      
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const filteredFish = featuredFish.filter(fish => 
    fish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fish.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fish.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <DashboardHeaderWithAddButton
        title="Featured Fish Management"
        description="Manage featured fish items"
        buttonLabel="Add Featured Fish"
        onClick={handleAddClick}
      />
      
      {/* API Connection Status */}
      <ApiStatus endpoint="featured-fish" onRefresh={() => fetchFeaturedFish()} />
      
      {error && (
        <div className="flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search featured fish by name, type, or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading featured fish...</span>
        </div>
      ) : (
        <>
          {filteredFish.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No featured fish found. Add some to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFish.map((fish) => (
                <Card key={fish.id} className={`overflow-hidden ${!fish.isActive ? 'opacity-60' : ''}`}>
                  <div className="relative aspect-video">
                    {fish.image ? (
                      <Image
                        src={fish.image}
                        alt={fish.name}
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
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
                    
                    {fish.discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        {fish.discount}% OFF
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{fish.name}</h3>
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                        {getIconComponent(fish.iconName)}
                        <span>{fish.type}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{fish.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-blue-600">₹{fish.price}</span>
                        {fish.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{Math.round(fish.price / (1 - fish.discount/100))}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{fish.weight}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(fish)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <FileEdit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(fish.id)}
                          disabled={deleteLoading === fish.id}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {deleteLoading === fish.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Delete
                        </Button>
                      </div>
                      
                      <Switch
                        checked={fish.isActive}
                        onCheckedChange={() => toggleFishStatus(fish)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {formMode === 'create' ? 'Add New Featured Fish' : 'Edit Featured Fish'}
              </h2>
              
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <p className="ml-3 text-sm text-red-700">{formError}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter fish name"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slug">Slug (URL path)</Label>
                      <Input
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="e.g. premium-fish-combo"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to auto-generate from name
                      </p>
                    </div>
                    
                    <div>
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
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter a brief description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.price}
                        onChange={handleNumericInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="e.g. 500g, 1kg"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input
                        id="discount"
                        name="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={handleNumericInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="iconName">Icon</Label>
                    <Select
                      value={formData.iconName}
                      onValueChange={(value) => handleSelectChange('iconName', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              {option.icon}
                              <span className="ml-2">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Image</Label>
                    <div className="mt-1 flex items-center">
                      <Input
                        id="image"
                        name="image"
                        type="text"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="Enter image URL"
                        className={formData.imageFile ? "hidden" : ""}
                      />
                      <span className="mx-2 text-gray-500">or</span>
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="max-w-xs"
                      />
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Featured Fish'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}