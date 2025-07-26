import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default trusted badges data
const defaultBadges = [
  {
    title: 'Fresh Guarantee',
    description: 'All seafood is guaranteed fresh',
    iconName: 'Shield',
    order: 1,
    isActive: true,
  },
  {
    title: 'Fast Delivery',
    description: 'Same day delivery available',
    iconName: 'Clock',
    order: 2,
    isActive: true,
  },
  {
    title: 'Quality Assured',
    description: 'Premium quality seafood',
    iconName: 'BadgeCheck',
    order: 3,
    isActive: true,
  },
  {
    title: 'Sustainably Sourced',
    description: 'Environmentally responsible practices',
    iconName: 'Star',
    order: 4,
    isActive: true,
  }
];

// Function to seed default badges if none exist
const seedDefaultBadges = async () => {
  const badgeCount = await prisma.trustedBadge.count();
  
  if (badgeCount === 0) {
    console.log('No trusted badges found, seeding defaults...');
    try {
      await prisma.trustedBadge.createMany({
        data: defaultBadges
      });
      console.log('Default trusted badges created successfully');
    } catch (error) {
      console.error('Error seeding default trusted badges:', error);
    }
  }
};

// Get all trusted badges
export const getAllTrustedBadges = async (req: Request, res: Response) => {
  try {
    // Try to seed default badges if needed
    await seedDefaultBadges();
    
    const badges = await prisma.trustedBadge.findMany({
      orderBy: { order: 'asc' }
    });
    
    return res.json(badges);
  } catch (error: any) {
    console.error("Error fetching trusted badges:", error);
    return res.status(500).json({ message: "Failed to fetch trusted badges", error: error.message });
  }
};

// Get single trusted badge by ID
export const getTrustedBadgeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const badge = await prisma.trustedBadge.findUnique({
      where: { id }
    });
    
    if (!badge) {
      return res.status(404).json({ message: `Trusted badge with ID ${id} not found` });
    }
    
    return res.json(badge);
  } catch (error: any) {
    console.error(`Error fetching trusted badge ${id}:`, error);
    return res.status(500).json({ message: "Failed to fetch trusted badge", error: error.message });
  }
};

// Create a new trusted badge
export const createTrustedBadge = async (req: Request, res: Response) => {
  const { title, description, iconName, order, isActive } = req.body;
  
  // Validation
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  
  try {
    const newBadge = await prisma.trustedBadge.create({
      data: {
        title,
        description: description || "",
        iconName: iconName || "Shield",
        order: order !== undefined ? order : 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    return res.status(201).json(newBadge);
  } catch (error: any) {
    console.error("Error creating trusted badge:", error);
    return res.status(500).json({ message: "Failed to create trusted badge", error: error.message });
  }
};

// Update an existing trusted badge
export const updateTrustedBadge = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, iconName, order, isActive } = req.body;
  
  // Validation
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  
  try {
    // First check if the badge exists
    const existingBadge = await prisma.trustedBadge.findUnique({
      where: { id }
    });
    
    if (!existingBadge) {
      return res.status(404).json({ message: `Trusted badge with ID ${id} not found` });
    }
    
    // Update the badge
    const updatedBadge = await prisma.trustedBadge.update({
      where: { id },
      data: {
        title,
        description: description !== undefined ? description : existingBadge.description,
        iconName: iconName !== undefined ? iconName : existingBadge.iconName,
        order: order !== undefined ? order : existingBadge.order,
        isActive: isActive !== undefined ? isActive : existingBadge.isActive
      }
    });
    
    return res.json(updatedBadge);
  } catch (error: any) {
    console.error(`Error updating trusted badge ${id}:`, error);
    return res.status(500).json({ message: "Failed to update trusted badge", error: error.message });
  }
};

// Delete a trusted badge
export const deleteTrustedBadge = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // First check if the badge exists
    const existingBadge = await prisma.trustedBadge.findUnique({
      where: { id }
    });
    
    if (!existingBadge) {
      return res.status(404).json({ message: `Trusted badge with ID ${id} not found` });
    }
    
    // Delete the badge
    await prisma.trustedBadge.delete({
      where: { id }
    });
    
    return res.json({ message: `Trusted badge with ID ${id} has been deleted` });
  } catch (error: any) {
    console.error(`Error deleting trusted badge ${id}:`, error);
    return res.status(500).json({ message: "Failed to delete trusted badge", error: error.message });
  }
}; 