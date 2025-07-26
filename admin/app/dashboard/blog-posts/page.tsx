"use client";

import { useEffect, useState, useCallback } from 'react';
import { DashboardHeaderWithAddButton } from '@/components/dashboard/dashboard-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileEdit, Trash2, AlertTriangle, Loader2, Search, Image as ImageIcon,
  CalendarDays, User, Tag, BookOpen
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

interface BlogPost {
  id: string;
  title: string;
  image: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  content: string;
  isActive: boolean;
}

export default function BlogPostsPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);  const { toast } = useToast();

  // Fetch blog posts
  const fetchBlogPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch blog posts from API
      const response = await fetch('/api/blog-posts');
      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts (Status: ${response.status})`);
      }
      
      const data = await response.json();
      setBlogPosts(data);
      console.log('Fetched blog posts:', data);
    } catch (err: any) {
      console.error('Error loading blog posts:', err);
      setError(err.message || 'An error occurred while loading blog posts');
      
      // Fallback to sample data if API fails
      setBlogPosts([
        {
          id: 'health-benefits',
          title: "Health Benefits of Seafood",
          image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
          slug: "health-benefits-of-seafood",
          excerpt: "Discover the amazing health benefits of including seafood in your regular diet.",
          category: "Health",
          author: "Dr. Ramanathan",
          date: "2023-06-15",
          content: "Seafood is packed with essential nutrients that can improve your overall health...",
          isActive: true
        },
        {
          id: 'cooking-tips',
          title: "5 Easy Ways to Cook Fish",
          image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?q=80&w=2070&auto=format&fit=crop",
          slug: "easy-ways-to-cook-fish",
          excerpt: "Simple and delicious ways to prepare fish at home.",
          category: "Cooking",
          author: "Chef Lakshmi",
          date: "2023-05-22",
          content: "Cooking fish at home doesn't have to be intimidating. Here are five easy methods...",
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    slug: '',
    excerpt: '',
    category: 'Recipes',
    author: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    isActive: true,
    imageFile: null as File | null,
  });

  const categoryOptions = [
    'Recipes', 'Health', 'Sustainability', 'Cooking', 'Nutrition', 'News'
  ];
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleAddClick = () => {
    setFormMode('create');
    setEditingPost(null);
    
    setFormData({
      title: '',
      image: '',
      slug: '',
      excerpt: '',
      category: 'Recipes',
      author: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
      isActive: true,
      imageFile: null
    });
    setShowForm(true);
    setFormError(null);
    setImagePreview(null);
  };

  const handleEditClick = (post: BlogPost) => {
    setFormMode('edit');
    setEditingPost(post);
    setFormData({
      title: post.title,
      image: post.image,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      author: post.author,
      date: post.date,
      content: post.content,
      isActive: post.isActive,
      imageFile: null
    });
    setShowForm(true);
    setFormError(null);
    setImagePreview(post.image);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    
    try {
      const postData = {
        id: editingPost?.id || `post_${Date.now()}`,
        title: formData.title,
        image: formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.image,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-'),
        excerpt: formData.excerpt,
        category: formData.category,
        author: formData.author,
        date: formData.date,
        content: formData.content,
        isActive: formData.isActive
      };
      
      // In a real app, you would upload the image to a server or cloud storage here
      // and then update the image URL in the postData object
      
      // Check if this is an edit or create operation
      const method = formMode === 'edit' ? 'PUT' : 'POST';
      const response = await fetch('/api/blog-posts', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${formMode} blog post`);
      }
      
      const responseData = await response.json();
      
      if (formMode === 'edit') {
        setBlogPosts(prev => prev.map(post => post.id === responseData.id ? responseData : post));
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        });
      } else {
        setBlogPosts(prev => [...prev, responseData]);
        toast({
          title: "Success",
          description: "New blog post added successfully",
        });
      }
      
      setShowForm(false);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setFormError(err.message || "An error occurred. Please try again.");
      
      toast({
        title: "Error",
        description: err.message || "Failed to save blog post",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = async (postId: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      setDeleteLoading(postId);
      
      try {
        const response = await fetch(`/api/blog-posts?id=${postId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete blog post");
        }
        
        setBlogPosts(prev => prev.filter(post => post.id !== postId));
        
        toast({
          title: "Success",
          description: "Blog post deleted successfully",
        });
      } catch (err: any) {
        console.error('Error deleting blog post:', err);
        
        toast({
          title: "Error",
          description: err.message || "Failed to delete blog post",
          variant: "destructive",
        });
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const togglePostStatus = async (post: BlogPost) => {
    try {
      const updatedPost = { ...post, isActive: !post.isActive };
      
      const response = await fetch('/api/blog-posts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update blog post status");
      }
      
      setBlogPosts(prev => 
        prev.map(item => item.id === post.id ? updatedPost : item)
      );
      
      toast({
        title: "Status Updated",
        description: `Blog post is now ${updatedPost.isActive ? 'active' : 'inactive'}`,
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

  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">      <DashboardHeaderWithAddButton
        title="Blog Posts Management"
        description="Create and manage blog posts for your seafood website."
        buttonLabel="Add New Blog Post"
        onClick={handleAddClick}
      />
      
      {/* API Connection Status */}
      <ApiStatus endpoint="blog-posts" onRefresh={fetchBlogPosts} />
      
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
            placeholder="Search blog posts by title, author, category, or content..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading blog posts...</span>
        </div>
      ) : (
        <>
          {filteredPosts.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No blog posts found. Add some to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className={`overflow-hidden ${!post.isActive ? 'opacity-60' : ''}`}>
                  <div className="relative aspect-video">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        post.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.isActive ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      {post.category}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">{post.title}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(post)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <FileEdit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(post.id)}
                          disabled={deleteLoading === post.id}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {deleteLoading === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Delete
                        </Button>
                      </div>
                      
                      <Switch
                        checked={post.isActive}
                        onCheckedChange={() => togglePostStatus(post)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {formMode === 'create' ? 'Add New Blog Post' : 'Edit Blog Post'}
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
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog post title"
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
                        placeholder="e.g. health-benefits-of-seafood"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to auto-generate from title
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        placeholder="Enter author name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="date">Publication Date</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      placeholder="Enter a brief summary of the blog post"
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Enter the full blog post content"
                      rows={6}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Featured Image</Label>
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
                    <Label htmlFor="isActive">Published</Label>
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
                      formMode === 'create' ? 'Publish Blog Post' : 'Update Blog Post'
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