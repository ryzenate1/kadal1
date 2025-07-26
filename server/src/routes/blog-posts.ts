import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

// Sample blog posts data (in a real app, this would come from a database)
const blogPosts = [
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

// Get all blog posts
router.get('/', (req, res) => {
  try {
    const activeBlogPosts = blogPosts.filter(post => post.isActive);
    res.status(200).json(activeBlogPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blog post by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const post = blogPosts.find(p => p.id === id);
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching blog post by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get blog posts by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const filteredPosts = blogPosts.filter(
      post => post.isActive && post.category.toLowerCase() === category.toLowerCase()
    );
    
    res.status(200).json(filteredPosts);
  } catch (error) {
    console.error('Error fetching blog posts by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 