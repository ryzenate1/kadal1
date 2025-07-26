import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

// Sample featured fish data (in a real app, this would come from a database)
let featuredFish = [
  {
    id: 'premium-combo',
    name: "Premium Fish Combo",
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
    slug: "premium",
    type: "Premium",
    description: "Curated selection of premium fish varieties",
    featured: true,
    price: 999,
    weight: "1.2kg",
    discount: 10,
    iconName: "Fish",
    isActive: true
  },
  {
    id: 'grilling-special',
    name: "Grilling Special",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
    slug: "grilling",
    type: "Combo",
    description: "Perfect for seafood barbecues and grilling",
    featured: true,
    price: 899,
    weight: "800g",
    discount: 15,
    iconName: "Fish",
    isActive: true
  },
  {
    id: 'seafood-feast',
    name: "Seafood Feast",
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop",
    slug: "feast",
    type: "Combo",
    description: "Premium selection of mixed seafood",
    featured: true,
    price: 1299,
    weight: "1.5kg",
    discount: 8,
    iconName: "Shell",
    isActive: true
  },
  {
    id: 'fresh-catch',
    name: "Fresh Catch Box",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop",
    slug: "fish-combo/fresh-catch",
    type: "Fresh",
    description: "Today's freshest catches from local fishermen",
    featured: true,
    price: 799,
    weight: "900g",
    discount: 12,
    iconName: "Anchor",
    isActive: true
  }
];

// Get all featured fish
router.get('/', (req, res) => {
  try {
    const activeFeaturedFish = featuredFish.filter(fish => fish.isActive);
    res.status(200).json(activeFeaturedFish);
  } catch (error) {
    console.error('Error fetching featured fish:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured fish by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const fish = featuredFish.find(f => f.id === id);
    
    if (!fish) {
      return res.status(404).json({ message: 'Featured fish not found' });
    }
    
    res.status(200).json(fish);
  } catch (error) {
    console.error('Error fetching featured fish by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST - Create a new featured fish (Admin only)
router.post('/', authenticate, isAdmin, (req, res) => {
  try {
    const newFish = req.body;
    
    // Validate required fields
    if (!newFish.name || !newFish.type) {
      return res.status(400).json({ 
        message: 'Name and type are required fields' 
      });
    }
    
    // Generate ID if not provided
    if (!newFish.id) {
      newFish.id = `fish_${Date.now()}`;
    }
    
    // Generate slug if not provided
    if (!newFish.slug) {
      newFish.slug = newFish.name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }
    
    // Check for duplicate slug
    if (featuredFish.some(f => f.slug === newFish.slug)) {
      return res.status(400).json({ 
        message: 'A featured fish with this slug already exists' 
      });
    }
    
    // Set defaults
    const fishWithDefaults = {
      ...newFish,
      featured: newFish.featured !== false,
      isActive: newFish.isActive !== false,
      price: Number(newFish.price) || 999,
      discount: Number(newFish.discount) || 0,
      iconName: newFish.iconName || 'Fish'
    };
    
    featuredFish.push(fishWithDefaults);
    
    console.log('Featured fish created:', fishWithDefaults.name);
    res.status(201).json(fishWithDefaults);
  } catch (error) {
    console.error('Error creating featured fish:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT - Update featured fish (Admin only)
router.put('/:id', authenticate, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    const fishIndex = featuredFish.findIndex(f => f.id === id);
    if (fishIndex === -1) {
      return res.status(404).json({ message: 'Featured fish not found' });
    }
    
    // Check for duplicate slug if changing slug
    if (updatedData.slug && updatedData.slug !== featuredFish[fishIndex].slug) {
      if (featuredFish.some(f => f.id !== id && f.slug === updatedData.slug)) {
        return res.status(400).json({ 
          message: 'A featured fish with this slug already exists' 
        });
      }
    }
    
    // Update the fish
    featuredFish[fishIndex] = {
      ...featuredFish[fishIndex],
      ...updatedData,
      id, // Preserve original ID
      price: Number(updatedData.price) || featuredFish[fishIndex].price,
      discount: Number(updatedData.discount) || featuredFish[fishIndex].discount
    };
    
    console.log('Featured fish updated:', featuredFish[fishIndex].name);
    res.status(200).json(featuredFish[fishIndex]);
  } catch (error) {
    console.error('Error updating featured fish:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE - Remove featured fish (Admin only)
router.delete('/:id', authenticate, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const initialLength = featuredFish.length;
    featuredFish = featuredFish.filter(f => f.id !== id);
    
    if (featuredFish.length === initialLength) {
      return res.status(404).json({ message: 'Featured fish not found' });
    }
    
    console.log('Featured fish deleted:', id);
    res.status(200).json({ success: true, message: 'Featured fish deleted successfully' });
  } catch (error) {
    console.error('Error deleting featured fish:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;