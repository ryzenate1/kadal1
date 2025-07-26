import { Request, Response } from 'express';
import { prisma } from '../index';

const generateSlug = (name: string) => {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create category (admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    let { name, slug, description, imageUrl, order, isActive, type, icon } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    if (!slug) {
      slug = generateSlug(name);
    }
    const category = await prisma.category.create({
      data: { 
        name, 
        slug, 
        description, 
        imageUrl, 
        order, 
        isActive,
        type: type || 'Fish',
        icon: icon || 'Fish'
      }
    });    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return res.status(409).json({ message: 'Slug already exists. Please choose a unique slug or name.' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category (admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { name, slug, description, imageUrl, order, isActive, type, icon } = req.body;

    if (name && !slug) { // If name is being updated and slug is not provided, regenerate slug
      slug = generateSlug(name);
    } else if (!name && slug) { // If only slug is provided, ensure there is a name associated or fetch existing
        const existingCategory = await prisma.category.findUnique({ where: { id } });
        if (!existingCategory?.name && !name) {
            return res.status(400).json({ message: 'Category name is required when updating slug without providing a new name.' });
        }
    } else if (name && slug) {
        // both provided, use them
    } else { // Neither name nor slug provided for update, retain existing slug (if any operation needs it)
        const existingCategory = await prisma.category.findUnique({ where: { id } });
        slug = existingCategory?.slug; // Keep existing slug if not updating name/slug
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (slug !== undefined) dataToUpdate.slug = slug;
    if (description !== undefined) dataToUpdate.description = description;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;
    if (order !== undefined) dataToUpdate.order = order;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (type !== undefined) dataToUpdate.type = type;
    if (icon !== undefined) dataToUpdate.icon = icon;
    
    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'No fields to update.'});
    }

    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate
    });    res.status(200).json(category);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return res.status(409).json({ message: 'Slug already exists. Please choose a unique slug or name.' });
    }
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category (admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 