import { NextResponse } from 'next/server';

// Configure route to be dynamic to avoid static generation bailout
export const dynamic = 'force-dynamic';

// In-memory storage for blog posts (in a real app, this would use a database)
let blogPosts = [
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

// GET - Retrieve all blog posts
export async function GET() {
  return NextResponse.json(blogPosts);
}

// POST - Create a new blog post
export async function POST(request: Request) {
  try {
    const newPost = await request.json();
    
    // Log the received data for debugging
    console.log("Creating new blog post:", JSON.stringify(newPost));
    
    // Validate required fields
    if (!newPost.title || !newPost.image || !newPost.content) {
      console.error("Missing required fields for blog post");
      return NextResponse.json(
        { error: 'Title, image, and content are required fields' },
        { status: 400 }
      );
    }
    
    // Ensure unique ID
    if (!newPost.id || blogPosts.some(post => post.id === newPost.id)) {
      console.log("Duplicate or missing ID, generating new ID");
      newPost.id = `post_${Date.now()}`;
    }
    
    // Generate slug if not provided
    if (!newPost.slug) {
      newPost.slug = newPost.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    // Set default values if not provided
    if (!newPost.date) {
      newPost.date = new Date().toISOString().split('T')[0];
    }
    
    if (!newPost.isActive) newPost.isActive = true;
    
    // Add the post to our collection
    blogPosts.push(newPost);
    console.log("Blog post added successfully. Total posts:", blogPosts.length);
    
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing blog post
export async function PUT(request: Request) {
  try {
    const updatedPost = await request.json();
    
    console.log("Updating blog post:", JSON.stringify(updatedPost));
    
    // Validate required fields
    if (!updatedPost.id) {
      console.error("Missing post ID for update");
      return NextResponse.json(
        { error: 'Post ID is required for updates' },
        { status: 400 }
      );
    }
    
    const index = blogPosts.findIndex(post => post.id === updatedPost.id);
    
    if (index === -1) {
      console.error("Blog post not found:", updatedPost.id);
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    blogPosts[index] = updatedPost;
    console.log("Blog post updated successfully:", updatedPost.title);
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a blog post
export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required for deletion' },
        { status: 400 }
      );
    }
    
    const initialLength = blogPosts.length;
    blogPosts = blogPosts.filter(post => post.id !== id);
    
    if (blogPosts.length === initialLength) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
} 