const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Store settings
exports.getAll = async (req, res) => {
  try {
    const settings = await prisma.storeSetting.findMany();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ message: 'Error fetching store settings', error: error.message });
  }
};

// Get setting by key
exports.getByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await prisma.storeSetting.findUnique({
      where: { key }
    });
    
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (error) {
    console.error('Error fetching store setting:', error);
    res.status(500).json({ message: 'Error fetching store setting', error: error.message });
  }
};

// Create or update setting
exports.upsert = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Key and value are required' });
    }
    
    const setting = await prisma.storeSetting.upsert({
      where: { key },
      update: { 
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        description
      },
      create: {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        description: description || `Setting for ${key}`
      }
    });
    
    res.status(200).json(setting);
  } catch (error) {
    console.error('Error updating store setting:', error);
    res.status(500).json({ message: 'Error updating store setting', error: error.message });
  }
};

// Delete setting
exports.delete = async (req, res) => {
  try {
    const { key } = req.params;
    
    await prisma.storeSetting.delete({
      where: { key }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting store setting:', error);
    res.status(500).json({ message: 'Error deleting store setting', error: error.message });
  }
};

// Get shipping methods
exports.getShippingMethods = async (req, res) => {
  try {
    const methods = await prisma.shippingMethod.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(methods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    res.status(500).json({ message: 'Error fetching shipping methods', error: error.message });
  }
};

// Create shipping method
exports.createShippingMethod = async (req, res) => {
  try {
    const { name, description, price, estimatedDeliveryDays, isActive, order } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    
    const method = await prisma.shippingMethod.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        estimatedDeliveryDays: parseInt(estimatedDeliveryDays || '1', 10),
        isActive: isActive !== undefined ? isActive : true,
        order: order !== undefined ? order : 0
      }
    });
    
    res.status(201).json(method);
  } catch (error) {
    console.error('Error creating shipping method:', error);
    res.status(500).json({ message: 'Error creating shipping method', error: error.message });
  }
};

// Update shipping method
exports.updateShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, estimatedDeliveryDays, isActive, order } = req.body;
    
    const method = await prisma.shippingMethod.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        estimatedDeliveryDays: estimatedDeliveryDays !== undefined ? parseInt(estimatedDeliveryDays, 10) : undefined,
        isActive,
        order
      }
    });
    
    res.json(method);
  } catch (error) {
    console.error('Error updating shipping method:', error);
    res.status(500).json({ message: 'Error updating shipping method', error: error.message });
  }
};

// Delete shipping method
exports.deleteShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.shippingMethod.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting shipping method:', error);
    res.status(500).json({ message: 'Error deleting shipping method', error: error.message });
  }
};
