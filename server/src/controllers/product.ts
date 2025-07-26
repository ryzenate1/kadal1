import { Request, Response } from 'express';
import { prisma } from '../index';

const generateProductSlug = (name: string): string => {
  if (!name) return Math.random().toString(36).substring(2, 15); // Fallback for safety
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, featured, tag } = req.query;
    const where: any = {};
    if (categoryId) where.categoryId = String(categoryId);
    if (featured === 'true') where.featured = true;
    if (featured === 'false') where.featured = false;
    if (tag) where.tag = String(tag);    const products = await prisma.product.findMany({
      where,
      include: { category: true }, // To include category details
      orderBy: { name: 'asc' }
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID or SLUG
export const getProductByIdOrSlug = async (req: Request, res: Response) => {  try {
    const { idOrSlug } = req.params;
    // Try finding by ID first, then by slug
    let product = await prisma.product.findUnique({
      where: { id: idOrSlug },
      include: { category: true }
    });
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: idOrSlug },
        include: { category: true }
      });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Get product by id/slug error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product (admin only)
export const createProduct = async (req: Request, res: Response) => {
  try {
    let { 
        name, slug, description, price, originalPrice, 
        imageUrl, weight, tag, featured, stock, categoryId 
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!slug) {
      slug = generateProductSlug(name);
    }
    if (price === undefined || price === null) {
        return res.status(400).json({ message: 'Product price is required'});
    }

    // Add validation for product creation
    const { name: reqName, price: reqPrice, categoryId: reqCategoryId } = req.body;

    if (!reqName || !reqPrice || !reqCategoryId) {
      return res.status(400).json({ message: 'Name, price, and categoryId are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price as string),
        originalPrice: originalPrice ? parseFloat(originalPrice as string) : undefined,
        imageUrl,
        weight,
        tag,
        featured: Boolean(featured),        stock: parseInt(stock as string, 10) || 0,
        categoryId
      },
      include: { category: true }
    });
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return res.status(409).json({ message: 'Slug already exists. Please choose a unique slug or name.' });
    }
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (admin only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { 
        name, slug, description, price, originalPrice, 
        imageUrl, weight, tag, featured, stock, categoryId
     } = req.body;

    const dataToUpdate: any = {};

    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (price !== undefined) dataToUpdate.price = parseFloat(price as string);
    if (originalPrice !== undefined) dataToUpdate.originalPrice = originalPrice ? parseFloat(originalPrice as string) : null; // Allow clearing originalPrice
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;
    if (weight !== undefined) dataToUpdate.weight = weight;
    if (tag !== undefined) dataToUpdate.tag = tag;
    if (featured !== undefined) dataToUpdate.featured = Boolean(featured);
    if (stock !== undefined) dataToUpdate.stock = parseInt(stock as string, 10);
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;

    if (name && (!slug || slug === dataToUpdate.slug)) { // If name is updated and slug is not, or slug is the same as old one (from potentially previous payload)
      dataToUpdate.slug = generateProductSlug(name);
    } else if (slug) {
      dataToUpdate.slug = slug;
    }
    
    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'No fields to update.'});
    }    const product = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true }
    });
    res.status(200).json(product);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return res.status(409).json({ message: 'Slug already exists. Please choose a unique slug or name.' });
    }
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};