'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, User, ArrowRight, AlertTriangle, Loader2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Fallback blog posts in case API fails
const fallbackBlogPosts = [
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
  },
  {
    id: 'sustainable-fishing',
    title: "Sustainable Fishing Practices",
    image: "https://images.unsplash.com/photo-1545816250-e12bedba42ba?q=80&w=1974&auto=format&fit=crop",
    slug: "sustainable-fishing-practices",
    excerpt: "How our fishing practices help protect marine ecosystems.",
    category: "Sustainability",
    author: "Arjun Kumar",
    date: "2023-04-10",
    content: "Sustainability is at the heart of our fishing practices. We believe in protecting the ocean...",
    isActive: true
  },
  {
    id: 'seafood-recipes',
    title: "Top 10 Tamil Seafood Recipes",
    image: "https://images.unsplash.com/photo-1556269923-e4ef51d69638?q=80&w=2036&auto=format&fit=crop",
    slug: "tamil-seafood-recipes",
    excerpt: "Traditional Tamil recipes featuring the freshest seafood.",
    category: "Recipes",
    author: "Meena Venkatesh",
    date: "2023-03-05",
    content: "Tamil cuisine has a rich tradition of seafood recipes that highlight the natural flavors...",
    isActive: true
  }
];

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Helper function to get image URL with fallback
  const getImageUrl = (post: any): string => {
    if (!post) return "https://images.unsplash.com/photo-1556269923-e4ef51d69638?q=80&w=2036&auto=format&fit=crop";
    
    // If image is available, use it
    if (post.image) {
      // Check if image is a full URL or just a path
      if (post.image.startsWith('http')) {
        return post.image;
      } else {
        // For local images, ensure they have the correct path
        return post.image.startsWith('/') ? post.image : `/${post.image}`;
      }
    }
    
    // Default fallback image for blog posts
    return "https://images.unsplash.com/photo-1556269923-e4ef51d69638?q=80&w=2036&auto=format&fit=crop";
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };
  
  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching blog posts from API...");
        const res = await fetch('/api/blog-posts');
        
        if (!res.ok) {
          console.warn(`API returned status: ${res.status}`);
          throw new Error(`Failed to fetch blog posts (Status: ${res.status})`);
        }
        
        const data = await res.json();
        console.log("Blog posts received:", data);
        
        if (Array.isArray(data) && data.length > 0) {
          const activePosts = data.filter((post: any) => post.isActive !== false);
          setBlogPosts(activePosts);
        } else {
          console.warn("Empty or invalid blog posts data, using fallback");
          setBlogPosts(fallbackBlogPosts);
        }
      } catch (err) {
        console.error("Error loading blog posts:", err);
        setError('Could not load blog posts from API, using fallback data');
        setBlogPosts(fallbackBlogPosts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, []);
  
  // Get unique categories from blog posts
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));
  
  // Filter posts based on search term and selected category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Seafood Blog</h1>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading blog posts...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Seafood Blog</h1>
      <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
        Explore our collection of articles on seafood recipes, health benefits, and sustainable fishing practices
      </p>
      
      {error && (
        <div className="flex items-center gap-2 bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded max-w-4xl mx-auto">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search articles..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className={selectedCategory === null ? "bg-blue-600" : ""}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={selectedCategory === category ? "bg-blue-600" : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No blog posts found matching your criteria</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory(null);
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div 
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/blog/${post.slug || post.id}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={getImageUrl(post)}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    {post.category}
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                    <div className="flex items-center">
                      <User className="h-3.5 w-3.5 mr-1" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                  
                  <div className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors group">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 