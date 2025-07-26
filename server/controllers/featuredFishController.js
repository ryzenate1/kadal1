const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Since featured fish isn't in our Prisma schema, we'll use an in-memory store
// In a real app, you would use a database table for this
let featuredFish = [
  {
    id: 'premium-combo',
    name: "Premium Fish Combo",
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?q=80&w=2070&auto=format&fit=crop",
    slug: "premium",
    type: "Premium",
    description: "Curated selection of premium fish varieties",
    featured: true,
    price: 999,
    weight: "1.2kg",
    discount: 10,
    iconName: "Fish",
    isActive: true,
    order: 0
  },
  {
    id: 'grilling-special',
    name: "Grilling Special",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=2070&auto=format&fit=crop",
    slug: "grilling",
    type: "Combo",
    description: "Perfect for seafood barbecues and grilling",
    featured: true,
    price: 899,
    weight: "800g",
    discount: 15,
    iconName: "Fish",
    isActive: true,
    order: 1
  },
  {
    id: 'seafood-feast',
    name: "Seafood Feast",
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=1974&auto=format&fit=crop",
    slug: "feast",
    type: "Combo",
    description: "Premium selection of mixed seafood",
    featured: true,
    price: 1299,
    weight: "1.5kg",
    discount: 8,
    iconName: "Shell",
    isActive: true,
    order: 2
  }
];

exports.getAll = async (req, res) => {
  try {
    // Check for an ID parameter in the request
    const id = req.query.id;
    
    if (id) {
      const fish = featuredFish.find(f => f.id === id);
      if (!fish) {
        return res.status(404).json({ message: 'Featured fish not found' });
      }
      return res.json(fish);
    }

    // Return all featured fish
    res.json(featuredFish);
  } catch (error) {
    console.error('Error fetching featured fish:', error);
    res.status(500).json({ message: 'Error fetching featured fish', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const newFish = req.body;
    
    // Validate required fields
    if (!newFish.name || !newFish.type) {
      return res.status(400).json({ message: 'Name and type are required fields' });
    }
    
    // Ensure unique ID
    if (!newFish.id) {
      newFish.id = `fish_${Date.now()}`;
    }
    
    // Check for duplicate ID
    if (featuredFish.some(f => f.id === newFish.id)) {
      // If the ID exists, update the existing fish instead
      return exports.update(req, res);
    }
    
    // Generate slug if not provided
    if (!newFish.slug) {
      newFish.slug = newFish.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    // Check for duplicate slug
    if (featuredFish.some(f => f.slug === newFish.slug)) {
      return res.status(400).json({ message: 'A featured fish with this slug already exists' });
    }
    
    // Set default values
    if (typeof newFish.order !== 'number') {
      const maxOrder = featuredFish.length > 0 
        ? Math.max(...featuredFish.map(f => f.order || 0)) + 1 
        : 0;
      newFish.order = maxOrder;
    }
    
    if (typeof newFish.isActive !== 'boolean') {
      newFish.isActive = true;
    }
    
    if (typeof newFish.featured !== 'boolean') {
      newFish.featured = true;
    }
    
    // Make sure image and imageUrl are synchronized
    if (newFish.image && !newFish.imageUrl) {
      newFish.imageUrl = newFish.image;
    } else if (newFish.imageUrl && !newFish.image) {
      newFish.image = newFish.imageUrl;
    }
    
    featuredFish.push(newFish);
    res.status(201).json(newFish);
  } catch (error) {
    console.error('Error creating featured fish:', error);
    res.status(500).json({ message: 'Error creating featured fish', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedFish = req.body;
    const id = req.params.id || updatedFish.id;
    
    if (!id) {
      return res.status(400).json({ message: 'Featured fish ID is required for updates' });
    }
    
    const index = featuredFish.findIndex(f => f.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Featured fish not found' });
    }
    
    // Check for duplicate slug if changing slug
    if (updatedFish.slug && updatedFish.slug !== featuredFish[index].slug) {
      if (featuredFish.some(f => f.id !== id && f.slug === updatedFish.slug)) {
        return res.status(400).json({ message: 'A featured fish with this slug already exists' });
      }
    }
    
    // Make sure image and imageUrl are synchronized
    if (updatedFish.image && !updatedFish.imageUrl) {
      updatedFish.imageUrl = updatedFish.image;
    } else if (updatedFish.imageUrl && !updatedFish.image) {
      updatedFish.image = updatedFish.imageUrl;
    }
    
    // Update the featured fish
    featuredFish[index] = { 
      ...featuredFish[index],
      ...updatedFish 
    };
    
    res.json(featuredFish[index]);
  } catch (error) {
    console.error('Error updating featured fish:', error);
    res.status(500).json({ message: 'Error updating featured fish', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({ message: 'Featured fish ID is required for deletion' });
    }
    
    const initialLength = featuredFish.length;
    featuredFish = featuredFish.filter(f => f.id !== id);
    
    if (featuredFish.length === initialLength) {
      return res.status(404).json({ message: 'Featured fish not found' });
    }
    
    res.json({ message: 'Featured fish deleted successfully' });
  } catch (error) {
    console.error('Error deleting featured fish:', error);
    res.status(500).json({ message: 'Error deleting featured fish', error: error.message });
  }
}; 