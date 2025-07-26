"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2, ImageOff, AlertTriangle, Loader2 } from "lucide-react";

const SERVER_API_URL = 'http://localhost:5001/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const defaultCategoryForm: Omit<Category, 'id' | 'createdAt' | 'updatedAt'> = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  order: 0,
  isActive: true,
};

const generateClientSlug = (name: string): string => {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export function CategorySections() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [listLoading, setListLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchCategories = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_API_URL}/categories`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: "Failed to fetch categories" }));
        throw new Error(errData.message);
      }
      const data: Category[] = await res.json();
      setCategories(data.sort((a,b) => (a.order || 0) - (b.order || 0) ));
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error Loading Categories", description: err.message, variant: "destructive" });
    } finally {
      setListLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (editingCategory) {
        setEditingCategory(prev => ({...prev, imageUrl: ''})); // Clear existing imageUrl if new file selected
      }
    }
  };

  async function uploadCategoryImage(file: File): Promise<string | undefined> {
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${SERVER_API_URL}/upload/image`, { method: 'POST', body: fd });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Image upload failed" }));
        throw new Error(errorData.message);
      }
      const data = await res.json();
      return data.url;
    } catch (err: any) {
      setError("Image Upload Error: " + err.message);
      toast({ title: "Image Upload Failed", description: err.message, variant: "destructive" });
      return undefined;
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category });
    setImageFile(null);
    setImagePreview(category.imageUrl || null);
    setActiveTab("edit");
    setError(null);
  };

  const handleCreateNew = () => {
    setEditingCategory({ ...defaultCategoryForm, order: categories.length > 0 ? Math.max(...categories.map(c => c.order || 0)) + 1 : 1 });
    setImageFile(null);
    setImagePreview(null);
    setActiveTab("edit");
    setError(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingCategory) return;
    const { name, value } = e.target;
    setEditingCategory(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'name' && { slug: generateClientSlug(value) })
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!editingCategory) return;
    setEditingCategory(prev => ({ ...prev, [name]: checked }));
  };
   const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCategory) return;
    const { name, value } = e.target;
    setEditingCategory(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };


  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategory.name) {
      setError("Category name is required.");
      toast({ title: "Validation Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    setFormLoading(true);
    setError(null);
    
    let finalImageUrlFromState = editingCategory.imageUrl; // Start with existing or default
    if (imageFile) {
        const uploadedUrl = await uploadCategoryImage(imageFile);
        if (uploadedUrl) {
            finalImageUrlFromState = uploadedUrl;
        } else {
            // Error toast is shown by uploadCategoryImage
            // Set a specific form error as well if desired, though toast might be enough
            setError("Image upload failed. Please try again or select a different image.");
            setFormLoading(false); 
            return;
        }
    }

    let descriptionValue: string | null | undefined;
    if (editingCategory.description !== undefined) {
      descriptionValue = editingCategory.description.trim() || null;
    }

    // Determine the final image URL for the payload
    let imageForPayload: string | null = null;
    if (typeof finalImageUrlFromState === 'string' && finalImageUrlFromState.trim() !== '') {
        imageForPayload = finalImageUrlFromState.trim();
    }

    interface CategoryPayload {
        id?: string;
        name: string;
        slug: string;
        description?: string | null;
        imageUrl?: string | null;
        order?: number;
        isActive?: boolean;
    }

    const payload: CategoryPayload = {
      name: editingCategory.name!.trim(), 
      slug: (editingCategory.slug?.trim() || generateClientSlug(editingCategory.name!)).trim(), // Ensure slug is also trimmed
      description: descriptionValue,
      imageUrl: imageForPayload, // Use the processed imageForPayload
      order: editingCategory.order === undefined || isNaN(Number(editingCategory.order)) ? 0 : Number(editingCategory.order),
      isActive: editingCategory.isActive === undefined ? true : editingCategory.isActive,
    };
    if (editingCategory.id) {
        payload.id = editingCategory.id;
    }

    try {
      const url = editingCategory.id 
        ? `${SERVER_API_URL}/categories/${editingCategory.id}` 
        : `${SERVER_API_URL}/categories`;
      const method = editingCategory.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        let errorMessage = `Failed to save category: ${res.statusText}`;
        try {
            const errData = await res.json();
            errorMessage = errData.message || errData.error || errorMessage;
        } catch (jsonError) {
            // Keep the original status text error if JSON parsing fails
            console.error("Failed to parse error JSON from save category response", jsonError);
        }
        throw new Error(errorMessage);
      }
      
      const savedCategory = await res.json();
      toast({ title: `Category ${editingCategory.id ? 'Updated' : 'Created'}`, description: `"${savedCategory.name}" has been saved.` });
      setActiveTab("list");
      setEditingCategory(null);
      setImageFile(null);
      setImagePreview(null);
      fetchCategories(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if(!confirm("Are you sure you want to delete this category?")) return;
    setFormLoading(true); // Can use formLoading or create a specific itemLoading state
    setError(null);
    try {
      const res = await fetch(`${SERVER_API_URL}/categories/${categoryId}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: `Failed to delete category: ${res.statusText}`}));
        throw new Error(errData.message);
      }
      toast({ title: "Category Deleted", description: "The category has been successfully deleted." });
      fetchCategories();
      if(editingCategory && editingCategory.id === categoryId) {
        setActiveTab("list");
        setEditingCategory(null);
      }
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Delete Error", description: err.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setError(null); if(value === 'list') setEditingCategory(null); }}>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-2xl">Category Management</CardTitle>
            <CardDescription>
              Organize your products by creating and managing categories.
            </CardDescription>
          </div>
          {activeTab === "list" && (
            <Button onClick={handleCreateNew} className="ml-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {error && !formLoading && (
             <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
          )}
          <TabsContent value="list" className="space-y-4">
            {listLoading && <div className="text-center py-4"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" /></div>}
            {!listLoading && categories.length === 0 && !error && (
                <p className="text-center text-gray-500 py-4">No categories found. Click "Add New Category" to create one.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="overflow-hidden group relative hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                    {category.imageUrl ? (
                        <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none') } // Hide if image fails to load
                        />
                    ) : (
                        <ImageOff className="w-16 h-16 text-gray-400" />
                    )}
                     {/* Overlay for actions - always present but opacity changes on hover */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-white border-white hover:bg-white hover:text-black"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Pencil className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={formLoading} // Disable if another delete/save is in progress
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-lg truncate" title={category.name}>{category.name}</h3>
                      <Badge variant={category.isActive ? "default" : "secondary"} 
                             className={category.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Order: {category.order}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]" title={category.description || ''}>
                      {category.description || <span className="italic">No description</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 truncate" title={category.slug}>Slug: {category.slug}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="edit">
            {editingCategory && (
              <div className="space-y-6 max-w-2xl mx-auto p-4 border rounded-lg">
                <h3 className="text-xl font-semibold mb-1">{editingCategory.id ? "Edit Category" : "Create New Category"}</h3>
                 {error && (
                    <div className="my-2 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                  )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="category-name"
                      name="name"
                      value={editingCategory.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-slug">Slug (auto-updated from name)</Label>
                    <Input
                      id="category-slug"
                      name="slug"
                      value={editingCategory.slug || ''}
                      onChange={handleInputChange} // Allow manual override if needed
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    name="description"
                    value={editingCategory.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="category-image">Image URL or Upload</Label>
                        <Input 
                            id="category-image-url" 
                            name="imageUrl" 
                            placeholder="Enter image URL or leave blank to upload"
                            value={editingCategory.imageUrl ? String(editingCategory.imageUrl) : ''} 
                            onChange={handleInputChange} 
                            disabled={!!imageFile}
                        />
                        <Input type="file" accept="image/*" onChange={handleFileChange} className="text-sm mt-1"/>
                        {(imagePreview || editingCategory.imageUrl) && (
                            <div className="mt-2 border rounded-md p-2 inline-block">
                                <img src={imagePreview || editingCategory.imageUrl} alt="Preview" className="h-24 w-auto object-contain" />
                            </div>
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category-order">Display Order</Label>
                        <Input 
                            id="category-order" 
                            name="order" 
                            type="number" 
                            value={editingCategory.order === undefined ? '' : editingCategory.order} 
                            onChange={handleNumberChange} 
                        />
                         <div className="flex items-center space-x-2 pt-4">
                            <Switch 
                                id="category-isActive" 
                                name="isActive" 
                                checked={editingCategory.isActive === undefined ? true : editingCategory.isActive} 
                                onCheckedChange={(checked) => handleSwitchChange('isActive', checked)} 
                            />
                            <Label htmlFor="category-isActive">Active</Label>
                        </div>
                    </div>
                </div>
                
                <CardFooter className="flex justify-end gap-3 p-0 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setActiveTab("list"); setEditingCategory(null); setError(null);}} disabled={formLoading}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSaveCategory} disabled={formLoading} className="min-w-[100px]">
                    {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingCategory.id ? "Save Changes" : "Create Category")}
                  </Button>
                </CardFooter>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}