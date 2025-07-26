"use client";

import { useEffect, useState, useCallback } from 'react';
import { DashboardHeaderWithAddButton } from '@/components/dashboard/dashboard-header';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, FileEdit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ApiStatus } from '@/components/dashboard/api-status';
import { fetchWithAuth, parseErrorResponse } from '@/lib/apiUtils';

// Use environment variable with fallback
const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  weight?: string;
  tag?: string;
  featured?: boolean;
  stock?: number;
  categoryId?: string;
}

// Define available sections for products
const productSections = [
  { id: 'none', name: 'None (Regular Product)' },
  { id: 'featured-fish', name: 'Featured Fish Section' },
  { id: 'trusted-badge', name: 'Trusted Badge Section' },
  { id: 'daily-fresh', name: 'Daily Fresh Section' },
  { id: 'premium', name: 'Premium Selection' },
  { id: 'seasonal', name: 'Seasonal Specials' }
];

const defaultForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  originalPrice: '',
  imageUrl: '',
  weight: '',
  tag: '',
  featured: false,
  stock: '0',
  categoryId: '',
  imageFile: null as File | null,
  addToSection: 'none', // New field for section selection
};

const generateClientSlug = (name: string): string => {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ ...defaultForm });
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const editProductId = searchParams.get('edit');
    if (editProductId) {
      const productToEdit = products.find(p => p.id === editProductId);
      if (productToEdit) {
        handleEditClick(productToEdit);
      } else if (!loading && products.length > 0) {
        toast({ title: "Not Found", description: `Product with ID ${editProductId} not found for editing.`, variant: "destructive" });
      }
    }
  }, [searchParams, products, loading, toast]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth('products');
      
      if (Array.isArray(response)) {
        setProducts(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        throw new Error('Invalid response format from products API');
      }
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Error Fetching Products", description: err.message, variant: "destructive" });
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await fetchWithAuth('categories');
      
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        throw new Error('Invalid response format from categories API');
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err.message);
      toast({ title: "Error Fetching Categories", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));

    if (name === 'name' && formMode === 'create') {
      setFormData(f => ({ ...f, slug: generateClientSlug(value) }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(f => ({ ...f, imageFile: file, imageUrl: '' }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(f => ({ ...f, [name]: checked }));
  };
  async function handleImageUpload(file: File): Promise<string | undefined> {
    const fd = new FormData();
    fd.append('image', file);
    
    setFormLoading(true);
    try {
      // Get the auth token
      const token = localStorage.getItem('oceanFreshToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const res = await fetch(`${SERVER_API_URL}/upload/image`, { 
        method: 'POST', 
        body: fd,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({message: "Image upload failed with no specific error message."}));
        const message = errorData.message || "Image upload failed due to server error.";
        setFormError(message);
        toast({ title: "Image Upload Failed", description: message, variant: "destructive" });
        return undefined;
      }
      const data = await res.json();
      toast({ title: "Image Uploaded", description: "Image successfully uploaded." });
      return data.url;
    } catch (err: any) {
      const message = err.message || "An unexpected error occurred during image upload.";
      setFormError(message);
      toast({ title: "Image Upload Error", description: message, variant: "destructive" });
      return undefined;
    } finally {
      setFormLoading(false);
    }
  }

  const handleAddClick = () => {
    setFormMode('create');
    setEditingProduct(null);
    setFormData({ ...defaultForm });
    setShowForm(true);
    setFormError(null);
    setImagePreview(null);
  };

  const handleEditClick = (product: Product) => {
    setFormMode('edit');
    setEditingProduct(product);
    
    // Check if product is already in featured fish or trusted badge sections
    const checkProductInSections = async () => {
      try {
        let currentSection = 'none';
        
        // Check featured fish
        const featuredRes = await fetch(`/api/featured-fish?id=${product.id}`);
        if (featuredRes.ok) {
          const featuredData = await featuredRes.json();
          if (featuredData && !featuredData.error) {
            currentSection = 'featured-fish';
          }
        }
        
        // If not in featured fish, check trusted badges
        if (currentSection === 'none') {
          const trustedRes = await fetch(`/api/trusted-badges?id=${product.id}`);
          if (trustedRes.ok) {
            const trustedData = await trustedRes.json();
            if (trustedData && !trustedData.error && trustedData.find((b: any) => b.id === product.id)) {
              currentSection = 'trusted-badge';
            }
          }
        }
        
        // Update form with section
        setFormData({
          name: product.name,
          slug: product.slug || '',
          description: product.description || '',
          price: product.price.toString(),
          originalPrice: product.originalPrice?.toString() || '',
          imageUrl: product.imageUrl || '',
          weight: product.weight || '',
          tag: product.tag || '',
          featured: !!product.featured,
          stock: product.stock?.toString() || '0',
          categoryId: product.categoryId || '',
          imageFile: null,
          addToSection: currentSection,
        });
        
      } catch (error) {
        console.error("Error checking product sections:", error);
        // Fall back to default form data if sections check fails
        setFormData({
          name: product.name,
          slug: product.slug || '',
          description: product.description || '',
          price: product.price.toString(),
          originalPrice: product.originalPrice?.toString() || '',
          imageUrl: product.imageUrl || '',
          weight: product.weight || '',
          tag: product.tag || '',
          featured: !!product.featured,
          stock: product.stock?.toString() || '0',
          categoryId: product.categoryId || '',
          imageFile: null,
          addToSection: 'none',
        });
      }
    };
    
    // Start with default values, then check sections
    setFormData({
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      imageUrl: product.imageUrl || '',
      weight: product.weight || '',
      tag: product.tag || '',
      featured: !!product.featured,
      stock: product.stock?.toString() || '0',
      categoryId: product.categoryId || '',
      imageFile: null,
      addToSection: 'none',
    });
    
    checkProductInSections();
    
    setShowForm(true);
    setFormError(null);
    setImagePreview(product.imageUrl || null);
  };

  const handleDeleteClick = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setDeleteLoading(productId);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: `Error deleting product: ${res.statusText}`}));
        throw new Error(errData.message);
      }
      toast({ title: "Product Deleted", description: "The product has been successfully deleted." });
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Delete Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    
    // Basic client-side validation
    if (!formData.name.trim()) {
      setFormError("Product name is required.");
      toast({ title: "Validation Error", description: "Product name is required.", variant: "destructive" });
      setFormLoading(false);
      return;
    }
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setFormError("Valid product price is required.");
      toast({ title: "Validation Error", description: "Valid product price is required.", variant: "destructive" });
      setFormLoading(false);
      return;
    }
    if (!formData.categoryId) {
      setFormError("Category is required.");
      toast({ title: "Validation Error", description: "Category is required.", variant: "destructive" });
      setFormLoading(false);
      return;
    }
    // Image validation: required for new products, and if cleared on edit, a new one must be provided.
    if (formMode === 'create' && !formData.imageFile) {
      setFormError("Product image is required.");
      toast({ title: "Validation Error", description: "Product image is required for new products.", variant: "destructive" });
      setFormLoading(false);
      return;
    }
    if (formMode === 'edit' && editingProduct && editingProduct.imageUrl && !formData.imageUrl && !formData.imageFile) {
        setFormError("Product image cannot be removed without uploading a new one.");
        toast({ title: "Validation Error", description: "Product image is required. Please upload a new image if you wish to change it.", variant: "destructive" });
        setFormLoading(false);
        return;
    }
    // If imageUrl was initially empty (for a new product form) and no file is selected after trying to submit.
    if (!editingProduct?.imageUrl && !formData.imageUrl && !formData.imageFile) {
        setFormError("Product image is required.");
        toast({ title: "Validation Error", description: "Product image is required.", variant: "destructive" });
        setFormLoading(false);
        return;
    }

    let finalImageUrl = formData.imageUrl;
    if (formData.imageFile) {
      const uploadedUrl = await handleImageUpload(formData.imageFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        setFormLoading(false);
        return; 
      }
    }

    const payload: any = {
      name: formData.name.trim(),
      slug: formData.slug?.trim() || generateClientSlug(formData.name.trim()),
      description: formData.description?.trim() || null,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice && !isNaN(parseFloat(formData.originalPrice)) ? parseFloat(formData.originalPrice) : null,
      imageUrl: finalImageUrl || null,
      weight: formData.weight?.trim() || null,
      tag: formData.tag?.trim() || null,
      featured: formData.featured,
      stock: formData.stock && !isNaN(parseInt(formData.stock, 10)) ? parseInt(formData.stock, 10) : 0,
      categoryId: formData.categoryId === "none" ? null : formData.categoryId || null,
      addToSection: formData.addToSection,
    };
    
    // Clean up any undefined values to ensure they are not sent, 
    // though the above construction should handle most cases by setting to null or a default.
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        payload[key] = null; // Or delete payload[key] if the API prefers missing fields over nulls for some optional cases
      }
    });

    const method = formMode === 'create' ? 'POST' : 'PUT';
    const url = formMode === 'create' ? `/api/products` : `/api/products/${editingProduct?.id}`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Request failed with status ${res.status}` }));
        throw new Error(errorData.message || `Failed to ${formMode === 'create' ? 'create' : 'update'} product`);
      }
      
      const savedProduct = await res.json();
      
      // Handle section addition if selected
      if (formData.addToSection !== 'none') {
        try {
          // Prepare data for the section API
          let sectionData: any = {
            id: savedProduct.id,
            name: savedProduct.name,
            image: savedProduct.imageUrl,
            imageUrl: savedProduct.imageUrl,
            price: savedProduct.price,
            description: savedProduct.description || '',
          };
          
          // Add section-specific fields
          if (formData.addToSection === 'featured-fish') {
            sectionData = {
              ...sectionData,
              slug: savedProduct.slug,
              type: savedProduct.category?.name || 'Fish',
              featured: true,
              weight: savedProduct.weight || '',
              discount: savedProduct.originalPrice ? 
                Math.round(((savedProduct.originalPrice - savedProduct.price) / savedProduct.originalPrice) * 100) : 0,
              iconName: 'Fish',
              isActive: true,
              order: 0
            };
          } else if (formData.addToSection === 'trusted-badge') {
            sectionData = {
              ...sectionData,
              category: savedProduct.category?.name || 'Fish',
              originalPrice: savedProduct.originalPrice || savedProduct.price * 1.1,
              weight: savedProduct.weight || '',
              freshness: 'Fresh',
              iconName: 'Fish',
              color: 'bg-blue-500',
              rating: 4.5,
              isActive: true
            };
          }
          
          // Determine which API to call
          const sectionApiUrl = `/api/${formData.addToSection}`;
          
          // Call the section API
          const sectionRes = await fetch(sectionApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(sectionData)
          });
          
          if (!sectionRes.ok) {
            throw new Error(`Failed to add product to ${formData.addToSection}`);
          }
          
          toast({ 
            title: `Added to ${formData.addToSection === 'featured-fish' ? 'Featured Fish' : 'Trusted Badge'}`, 
            description: `"${savedProduct.name}" has been successfully added to the section.` 
          });
        } catch (sectionError: any) {
          toast({
            title: `Warning: Product Saved but Section Update Failed`,
            description: sectionError.message,
            variant: "destructive"
          });
        }
      }
      
      toast({ 
        title: `Product ${formMode === 'create' ? 'Created' : 'Updated'}`, 
        description: `"${savedProduct.name}" has been successfully saved.` 
      });

      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        router.push(returnTo);
      } else {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({ ...defaultForm });
        setImagePreview(null);
        fetchProducts();
      }
    } catch (err: any) {
      setFormError(err.message);
      toast({ title: "Save Error", description: err.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.tag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && products.length === 0 && !error) {
    return <div className="p-4">Loading products...</div>;
  }

  if (error && products.length === 0) {
    return <div className="p-4 text-red-600">Error loading products: {error}</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <DashboardHeaderWithAddButton
        title="Products"
        description="Manage your seafood product catalog."
        buttonLabel="Add Product"
        onClick={handleAddClick}
      />

      {/* API Connection Status */}
      <ApiStatus endpoint="products" onRefresh={fetchProducts} />

      {showForm && (
        <Card className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">{formMode === 'create' ? 'Add New Product' : 'Edit Product'}</h2>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <Input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated if empty)</label>
                  <Input type="text" id="slug" name="slug" value={formData.slug} onChange={handleInputChange} />
                </div>
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select name="categoryId" value={formData.categoryId} onValueChange={(value) => handleSelectChange('categoryId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none"><em>No Category</em></SelectItem>
                      {categories
                        .filter(cat => cat.id && cat.id.trim() !== "")
                        .map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="addToSection" className="block text-sm font-medium text-gray-700 mb-1">Add to Section</label>
                  <Select name="addToSection" value={formData.addToSection} onValueChange={(value) => handleSelectChange('addToSection', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {productSections.map(section => (
                        <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                  <Input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} step="0.01" required />
                </div>
                <div>
                  <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                  <Input type="number" id="originalPrice" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange} step="0.01" />
                </div>
                 <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <Input type="number" id="stock" name="stock" value={formData.stock} onChange={handleInputChange} step="1" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                </div>
                <div>
                  <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">Tag (e.g., Premium, Sale, New)</label>
                  <Input type="text" id="tag" name="tag" value={formData.tag} onChange={handleInputChange} />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (e.g., 500g, 1kg)</label>
                  <Input type="text" id="weight" name="weight" value={formData.weight} onChange={handleInputChange} />
                </div>
                <div className="pt-2">
                  <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <Input type="file" id="imageFile" name="imageFile" accept="image/*" onChange={handleFileChange} className="text-sm"/>
                  {(imagePreview || formData.imageUrl) && (
                    <div className="mt-2">
                      <Image 
                        src={imagePreview || formData.imageUrl || ''} 
                        alt="Preview" 
                        width={128}
                        height={128}
                        className="h-32 w-32 object-cover rounded-md border" 
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="featured" 
                    name="featured" 
                    checked={formData.featured} 
                    onCheckedChange={(checked) => handleCheckboxChange('featured', Boolean(checked))}
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Product</label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const returnTo = searchParams.get('returnTo');
                  if (returnTo) {
                    router.push(returnTo);
                  } else {
                    setShowForm(false); 
                    setEditingProduct(null); 
                    setFormData({...defaultForm }); 
                    setImagePreview(null); 
                    setFormError(null);
                  }
                }} 
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]">
                {formLoading ? 
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" /> :
                  (formMode === 'create' ? 'Create Product' : 'Update Product')
                }
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-2 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by name, slug, tag..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             {error && products.length > 0 && (
                <div className="text-sm text-red-600 flex items-center">
                    <AlertTriangle size={16} className="mr-1"/> {error}
                </div>
            )}
          </div>

          {products.length === 0 && !loading && !error && (
            <p className="text-center text-gray-500 py-4">No products found. Add one to get started!</p>
          )}

          {filteredProducts.length > 0 && (
            <>
              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {product.imageUrl ? (
                          <Image 
                            src={product.imageUrl} 
                            alt={product.name} 
                            width={64} 
                            height={64} 
                            className="h-16 w-16 object-cover rounded-md" 
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{product.slug}</p>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>₹{product.price.toFixed(2)}</span>
                              <span>Stock: {product.stock}</span>
                              {product.featured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Featured
                                </span>
                              )}
                            </div>
                            {categories.find(c => c.id === product.categoryId) && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {categories.find(c => c.id === product.categoryId)?.name}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditClick(product)}
                                className="p-2 text-blue-600 hover:text-blue-800 touch-target"
                              >
                                <FileEdit size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteClick(product.id)}
                                disabled={deleteLoading === product.id}
                                className="p-2 text-red-600 hover:text-red-800 touch-target"
                              >
                                {deleteLoading === product.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Name / Slug</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="h-12 w-12 object-cover rounded-md" />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Image</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.slug}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {categories.find(c => c.id === product.categoryId)?.name || product.categoryId || 'N/A'}
                        </TableCell>
                        <TableCell>₹{product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.featured ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditClick(product)}
                            className="mr-2 text-blue-600 hover:text-blue-800"
                          >
                            <FileEdit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteClick(product.id)}
                            disabled={deleteLoading === product.id}
                            className="text-red-600 hover:text-red-800"
                          >
                            {deleteLoading === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
           {filteredProducts.length === 0 && products.length > 0 && searchTerm && (
             <p className="text-center text-gray-500 py-4">No products match your search term &ldquo;{searchTerm}&rdquo;.</p>
           )}
        </div>
      </Card>
    </div>
  );
}