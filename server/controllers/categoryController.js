const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc'
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, slug, description, imageUrl, type, icon, order, isActive } = req.body;
    
    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        type: type || 'Fish',
        icon: icon || 'Fish',
        order: order !== undefined ? order : 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, type, icon, order, isActive } = req.body;
    
    // Check if slug already exists for another category
    if (slug) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Another category with this slug already exists' });
      }
    }
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageUrl,
        type,
        icon,
        order,
        isActive
      }
    });
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true
      }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has products
    if (category.products.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${category.products.length} products. Please remove or reassign products first.` 
      });
    }
    
    await prisma.category.delete({
      where: { id }
    });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
}; 