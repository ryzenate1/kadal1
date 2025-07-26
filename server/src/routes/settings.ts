import express from 'express';
import { prisma } from '../index';

const router = express.Router();

// Get all store settings
router.get('/', async (req, res) => {
  try {
    const settings = await (prisma as any).storeSetting.findMany({
      orderBy: { key: 'asc' }
    });
    
    // Convert array to object for easier usage
    const settingsMap = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json({ settings: settingsMap, raw: settings });
  } catch (error: any) {
    console.error('Error fetching store settings:', error);
    res.status(500).json({ 
      message: 'Error fetching store settings', 
      error: error.message 
    });
  }
});

// Get specific setting by key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await (prisma as any).storeSetting.findUnique({
      where: { key }
    });
    
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (error: any) {
    console.error('Error fetching store setting:', error);
    res.status(500).json({ 
      message: 'Error fetching store setting', 
      error: error.message 
    });
  }
});

// Create or update store setting
router.post('/', async (req, res) => {
  try {
    const { key, value, description } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'Key and value are required' });
    }
    
    const setting = await (prisma as any).storeSetting.upsert({
      where: { key },
      update: { 
        value: String(value),
        description,
        updatedAt: new Date()
      },
      create: { 
        key, 
        value: String(value),
        description 
      }
    });
    
    res.json({ message: 'Setting updated successfully', setting });
  } catch (error: any) {
    console.error('Error updating store setting:', error);
    res.status(500).json({ 
      message: 'Error updating store setting', 
      error: error.message 
    });
  }
});

// Update multiple settings
router.put('/bulk', async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object is required' });
    }
    
    const promises = Object.entries(settings).map(([key, value]) =>
      (prisma as any).storeSetting.upsert({
        where: { key },
        update: { 
          value: String(value),
          updatedAt: new Date()
        },
        create: { 
          key, 
          value: String(value)
        }
      })
    );
    
    const updatedSettings = await Promise.all(promises);
    
    res.json({ 
      message: 'Settings updated successfully', 
      settings: updatedSettings 
    });
  } catch (error: any) {
    console.error('Error updating store settings:', error);
    res.status(500).json({ 
      message: 'Error updating store settings', 
      error: error.message 
    });
  }
});

// Delete setting
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    await (prisma as any).storeSetting.delete({
      where: { key }
    });
    
    res.json({ message: 'Setting deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting store setting:', error);
    res.status(500).json({ 
      message: 'Error deleting store setting', 
      error: error.message 
    });
  }
});

export default router;
