import express from 'express';
import { prisma } from '../index';

const router = express.Router();

// Get all shipping methods
router.get('/', async (req, res) => {
  try {
    const shippingMethods = await (prisma as any).shippingMethod.findMany({
      orderBy: { order: 'asc' }
    });
    
    res.json({ shippingMethods });
  } catch (error: any) {
    console.error('Error fetching shipping methods:', error);
    res.status(500).json({ 
      message: 'Error fetching shipping methods', 
      error: error.message 
    });
  }
});

// Get active shipping methods only
router.get('/active', async (req, res) => {
  try {
    const shippingMethods = await (prisma as any).shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    
    res.json({ shippingMethods });
  } catch (error: any) {
    console.error('Error fetching active shipping methods:', error);
    res.status(500).json({ 
      message: 'Error fetching active shipping methods', 
      error: error.message 
    });
  }
});

// Get specific shipping method by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const shippingMethod = await (prisma as any).shippingMethod.findUnique({
      where: { id }
    });
    
    if (!shippingMethod) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }
    
    res.json(shippingMethod);
  } catch (error: any) {
    console.error('Error fetching shipping method:', error);
    res.status(500).json({ 
      message: 'Error fetching shipping method', 
      error: error.message 
    });
  }
});

// Create new shipping method
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      estimatedDeliveryDays, 
      isActive, 
      order 
    } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ 
        message: 'Name and price are required' 
      });
    }
    
    const shippingMethod = await (prisma as any).shippingMethod.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        estimatedDeliveryDays: parseInt(estimatedDeliveryDays) || 1,
        isActive: isActive !== undefined ? isActive : true,
        order: parseInt(order) || 0
      }
    });
    
    res.status(201).json({ 
      message: 'Shipping method created successfully', 
      shippingMethod 
    });
  } catch (error: any) {
    console.error('Error creating shipping method:', error);
    res.status(500).json({ 
      message: 'Error creating shipping method', 
      error: error.message 
    });
  }
});

// Update shipping method
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      estimatedDeliveryDays, 
      isActive, 
      order 
    } = req.body;
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (estimatedDeliveryDays !== undefined) updateData.estimatedDeliveryDays = parseInt(estimatedDeliveryDays);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = parseInt(order);
    
    const shippingMethod = await (prisma as any).shippingMethod.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      message: 'Shipping method updated successfully', 
      shippingMethod 
    });
  } catch (error: any) {
    console.error('Error updating shipping method:', error);
    res.status(500).json({ 
      message: 'Error updating shipping method', 
      error: error.message 
    });
  }
});

// Delete shipping method
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await (prisma as any).shippingMethod.delete({
      where: { id }
    });
    
    res.json({ message: 'Shipping method deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting shipping method:', error);
    res.status(500).json({ 
      message: 'Error deleting shipping method', 
      error: error.message 
    });
  }
});

// Update shipping method order
router.put('/:id/order', async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;
    
    if (order === undefined) {
      return res.status(400).json({ message: 'Order is required' });
    }
    
    const shippingMethod = await (prisma as any).shippingMethod.update({
      where: { id },
      data: { 
        order: parseInt(order),
        updatedAt: new Date()
      }
    });
    
    res.json({ 
      message: 'Shipping method order updated successfully', 
      shippingMethod 
    });
  } catch (error: any) {
    console.error('Error updating shipping method order:', error);
    res.status(500).json({ 
      message: 'Error updating shipping method order', 
      error: error.message 
    });
  }
});

// Toggle shipping method active status
router.put('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentMethod = await (prisma as any).shippingMethod.findUnique({
      where: { id }
    });
    
    if (!currentMethod) {
      return res.status(404).json({ message: 'Shipping method not found' });
    }
    
    const shippingMethod = await (prisma as any).shippingMethod.update({
      where: { id },
      data: { 
        isActive: !currentMethod.isActive,
        updatedAt: new Date()
      }
    });
    
    res.json({ 
      message: 'Shipping method status updated successfully', 
      shippingMethod 
    });
  } catch (error: any) {
    console.error('Error toggling shipping method status:', error);
    res.status(500).json({ 
      message: 'Error toggling shipping method status', 
      error: error.message 
    });
  }
});

export default router;
