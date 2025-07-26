import { Router, Request, Response } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Fish Picks data structure
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
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for fish picks (in production, this would be a database)
let fishPicks: FishPick[] = [
  {
    id: 'fp_1',
    name: 'Seer Fish (Vanjaram)',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop',
    category: 'Premium Catch',
    price: 899,
    originalPrice: 999,
    weight: '500g',
    freshness: 'Fresh Today',
    iconName: 'Fish',
    color: 'bg-gradient-to-br from-red-500 to-red-600',
    rating: 4.8,
    description: 'Rich in omega-3, perfect for grilling & curry',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fp_2',
    name: 'Tiger Prawns',
    image: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab5460?q=80&w=2070&auto=format&fit=crop',
    category: 'Fresh Shellfish',
    price: 599,
    originalPrice: 699,
    weight: '250g',
    freshness: 'Just Caught',
    iconName: 'Anchor',
    color: 'bg-gradient-to-br from-orange-500 to-red-500',
    rating: 4.6,
    description: 'Juicy and flavorful, perfect for curries & frying',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fp_3',
    name: 'Indian Salmon',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=2069&auto=format&fit=crop',
    category: 'Premium Catch',
    price: 1299,
    originalPrice: 1499,
    weight: '1kg',
    freshness: 'Ocean Fresh',
    iconName: 'Waves',
    color: 'bg-gradient-to-br from-pink-500 to-red-500',
    rating: 4.9,
    description: 'High in protein & omega-3, ideal for steaks',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fp_4',
    name: 'White Pomfret',
    image: 'https://images.unsplash.com/photo-1605651377861-348620a3faae?q=80&w=2070&auto=format&fit=crop',
    category: 'Premium Catch',
    price: 1099,
    originalPrice: 1299,
    weight: '700g',
    freshness: 'Fresh Today',
    iconName: 'Fish',
    color: 'bg-gradient-to-br from-blue-500 to-red-500',
    rating: 4.7,
    description: 'Delicate white flesh, perfect for whole fish frying',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fp_5',
    name: 'King Fish (Surmai)',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?q=80&w=2070&auto=format&fit=crop',
    category: 'Daily Fresh',
    price: 749,
    originalPrice: 849,
    weight: '500g',
    freshness: 'Morning Catch',
    iconName: 'Star',
    color: 'bg-gradient-to-br from-purple-500 to-red-500',
    rating: 4.5,
    description: 'Firm texture, excellent for steaks & grilling',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fp_6',
    name: 'Mud Crab',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop',
    category: 'Live Shellfish',
    price: 1599,
    originalPrice: 1799,
    weight: '1kg',
    freshness: 'Live & Fresh',
    iconName: 'Sparkles',
    color: 'bg-gradient-to-br from-green-500 to-red-600',
    rating: 4.9,
    description: 'Sweet meat, perfect for crab curry & masala',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/fish-picks - Get all fish picks
router.get('/', (req: Request, res: Response) => {
  try {
    console.log('Fetching all fish picks...');
    
    // Filter by active status if requested
    const includeInactive = req.query.includeInactive === 'true';
    const filteredFishPicks = includeInactive 
      ? fishPicks 
      : fishPicks.filter(pick => pick.isActive);
    
    console.log(`Returning ${filteredFishPicks.length} fish picks`);
    res.json(filteredFishPicks);
  } catch (error) {
    console.error('Error fetching fish picks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch fish picks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/fish-picks/:id - Get fish pick by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Fetching fish pick with ID: ${id}`);
    
    const fishPick = fishPicks.find(pick => pick.id === id);
    
    if (!fishPick) {
      console.log(`Fish pick not found: ${id}`);
      return res.status(404).json({ error: 'Fish pick not found' });
    }
    
    console.log(`Found fish pick: ${fishPick.name}`);
    res.json(fishPick);
  } catch (error) {
    console.error('Error fetching fish pick:', error);
    res.status(500).json({ 
      error: 'Failed to fetch fish pick',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/fish-picks - Create new fish pick (admin only)
router.post('/', authenticate, isAdmin, (req: Request, res: Response) => {
  try {
    console.log('Creating new fish pick:', JSON.stringify(req.body, null, 2));
    
    const {
      name,
      image,
      category,
      price,
      originalPrice,
      weight,
      freshness,
      iconName,
      color,
      rating,
      description,
      isActive = true
    } = req.body;
    
    // Validate required fields
    if (!name || !category || !description) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'category', 'description']
      });
    }
    
    // Validate numeric fields
    if (typeof price !== 'number' || typeof originalPrice !== 'number' || typeof rating !== 'number') {
      console.log('Invalid numeric fields');
      return res.status(400).json({ 
        error: 'Price, originalPrice, and rating must be numbers'
      });
    }
    
    // Validate rating range
    if (rating < 0 || rating > 5) {
      console.log('Invalid rating range');
      return res.status(400).json({ 
        error: 'Rating must be between 0 and 5'
      });
    }
    
    // Generate unique ID
    const id = `fp_${Date.now()}`;
    
    const newFishPick: FishPick = {
      id,
      name: name.trim(),
      image: image || '',
      category: category.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice),
      weight: weight?.trim() || '500g',
      freshness: freshness?.trim() || 'Fresh Today',
      iconName: iconName || 'Fish',
      color: color || 'bg-gradient-to-br from-blue-500 to-red-500',
      rating: Number(rating),
      description: description.trim(),
      isActive: Boolean(isActive),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    fishPicks.push(newFishPick);
    console.log(`Fish pick created successfully: ${newFishPick.name} (ID: ${id})`);
    
    res.status(201).json(newFishPick);
  } catch (error) {
    console.error('Error creating fish pick:', error);
    res.status(500).json({ 
      error: 'Failed to create fish pick',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/fish-picks/:id - Update fish pick (admin only)
router.put('/:id', authenticate, isAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Updating fish pick: ${id}`, JSON.stringify(req.body, null, 2));
    
    const fishPickIndex = fishPicks.findIndex(pick => pick.id === id);
    
    if (fishPickIndex === -1) {
      console.log(`Fish pick not found for update: ${id}`);
      return res.status(404).json({ error: 'Fish pick not found' });
    }
    
    const currentFishPick = fishPicks[fishPickIndex];
    const {
      name,
      image,
      category,
      price,
      originalPrice,
      weight,
      freshness,
      iconName,
      color,
      rating,
      description,
      isActive
    } = req.body;
    
    // Validate numeric fields if provided
    if (price !== undefined && typeof price !== 'number') {
      return res.status(400).json({ error: 'Price must be a number' });
    }
    if (originalPrice !== undefined && typeof originalPrice !== 'number') {
      return res.status(400).json({ error: 'Original price must be a number' });
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be a number between 0 and 5' });
    }
    
    // Update fish pick
    const updatedFishPick: FishPick = {
      ...currentFishPick,
      name: name?.trim() ?? currentFishPick.name,
      image: image ?? currentFishPick.image,
      category: category?.trim() ?? currentFishPick.category,
      price: price !== undefined ? Number(price) : currentFishPick.price,
      originalPrice: originalPrice !== undefined ? Number(originalPrice) : currentFishPick.originalPrice,
      weight: weight?.trim() ?? currentFishPick.weight,
      freshness: freshness?.trim() ?? currentFishPick.freshness,
      iconName: iconName ?? currentFishPick.iconName,
      color: color ?? currentFishPick.color,
      rating: rating !== undefined ? Number(rating) : currentFishPick.rating,
      description: description?.trim() ?? currentFishPick.description,
      isActive: isActive !== undefined ? Boolean(isActive) : currentFishPick.isActive,
      updatedAt: new Date().toISOString()
    };
    
    fishPicks[fishPickIndex] = updatedFishPick;
    console.log(`Fish pick updated successfully: ${updatedFishPick.name}`);
    
    res.json(updatedFishPick);
  } catch (error) {
    console.error('Error updating fish pick:', error);
    res.status(500).json({ 
      error: 'Failed to update fish pick',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/fish-picks/:id - Delete fish pick (admin only)
router.delete('/:id', authenticate, isAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Deleting fish pick: ${id}`);
    
    const fishPickIndex = fishPicks.findIndex(pick => pick.id === id);
    
    if (fishPickIndex === -1) {
      console.log(`Fish pick not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Fish pick not found' });
    }
    
    const deletedFishPick = fishPicks.splice(fishPickIndex, 1)[0];
    console.log(`Fish pick deleted successfully: ${deletedFishPick.name}`);
    
    res.json({ 
      success: true, 
      message: 'Fish pick deleted successfully',
      deletedFishPick
    });
  } catch (error) {
    console.error('Error deleting fish pick:', error);
    res.status(500).json({ 
      error: 'Failed to delete fish pick',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
