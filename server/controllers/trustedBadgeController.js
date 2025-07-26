const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const trustedBadges = await prisma.trustedBadge.findMany({
      orderBy: {
        order: 'asc'
      }
    });
    res.json(trustedBadges);
  } catch (error) {
    console.error('Error fetching trusted badges:', error);
    res.status(500).json({ message: 'Error fetching trusted badges', error: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const trustedBadge = await prisma.trustedBadge.findUnique({
      where: { id }
    });
    
    if (!trustedBadge) {
      return res.status(404).json({ message: 'Trusted badge not found' });
    }
    
    res.json(trustedBadge);
  } catch (error) {
    console.error('Error fetching trusted badge:', error);
    res.status(500).json({ message: 'Error fetching trusted badge', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, iconName, order, isActive } = req.body;
    
    const trustedBadge = await prisma.trustedBadge.create({
      data: {
        title,
        description,
        iconName: iconName || 'Shield',
        order: order !== undefined ? order : 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.status(201).json(trustedBadge);
  } catch (error) {
    console.error('Error creating trusted badge:', error);
    res.status(500).json({ message: 'Error creating trusted badge', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, iconName, order, isActive } = req.body;
    
    // Check if trusted badge exists
    const existingBadge = await prisma.trustedBadge.findUnique({
      where: { id }
    });
    
    if (!existingBadge) {
      return res.status(404).json({ message: 'Trusted badge not found' });
    }
    
    const trustedBadge = await prisma.trustedBadge.update({
      where: { id },
      data: {
        title,
        description,
        iconName,
        order,
        isActive
      }
    });
    
    res.json(trustedBadge);
  } catch (error) {
    console.error('Error updating trusted badge:', error);
    res.status(500).json({ message: 'Error updating trusted badge', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if trusted badge exists
    const trustedBadge = await prisma.trustedBadge.findUnique({
      where: { id }
    });
    
    if (!trustedBadge) {
      return res.status(404).json({ message: 'Trusted badge not found' });
    }
    
    await prisma.trustedBadge.delete({
      where: { id }
    });
    
    res.json({ message: 'Trusted badge deleted successfully' });
  } catch (error) {
    console.error('Error deleting trusted badge:', error);
    res.status(500).json({ message: 'Error deleting trusted badge', error: error.message });
  }
}; 