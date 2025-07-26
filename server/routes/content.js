const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/auth');

// Get all content sections
router.get('/', async (req, res) => {
  try {
    const { page = 'home' } = req.query;
    
    // Get content for specific page or all content
    const where = page !== 'all' ? { page } : {};
    
    const content = await prisma.content.findMany({
      where,
      orderBy: [
        { page: 'asc' },
        { section: 'asc' },
        { order: 'asc' }
      ]
    });
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content', details: error.message });
  }
});

// Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await prisma.content.findUnique({
      where: { id }
    });
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content item:', error);
    res.status(500).json({ error: 'Failed to fetch content item', details: error.message });
  }
});

// Get content by page and section
router.get('/page/:page/section/:section', async (req, res) => {
  try {
    const { page, section } = req.params;
    
    const content = await prisma.content.findMany({
      where: { 
        page,
        section
      },
      orderBy: { order: 'asc' }
    });
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching content section:', error);
    res.status(500).json({ error: 'Failed to fetch content section', details: error.message });
  }
});

// Create new content (requires auth)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { page, section, key, title, content, type, order = 0, active = true, metadata = {} } = req.body;
    
    // Validate required fields
    if (!page || !section || !key || !content) {
      return res.status(400).json({ error: 'Page, section, key, and content are required' });
    }
    
    // Check if content with same key already exists
    const existingContent = await prisma.content.findFirst({
      where: { 
        page,
        section,
        key
      }
    });
    
    if (existingContent) {
      return res.status(400).json({ error: 'Content with this key already exists for this page and section' });
    }
    
    // Create content
    const newContent = await prisma.content.create({
      data: {
        page,
        section,
        key,
        title,
        content,
        type: type || 'text',
        order,
        active,
        metadata
      }
    });
    
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content', details: error.message });
  }
});

// Update content (requires auth)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, order, active, metadata } = req.body;
    
    // Create update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (order !== undefined) updateData.order = order;
    if (active !== undefined) updateData.active = active;
    if (metadata !== undefined) updateData.metadata = metadata;
    
    // Update content
    const updatedContent = await prisma.content.update({
      where: { id },
      data: updateData
    });
    
    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content', details: error.message });
  }
});

// Delete content (requires auth)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.content.delete({
      where: { id }
    });
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content', details: error.message });
  }
});

// Get content pages list (requires auth)
router.get('/management/pages', auth, async (req, res) => {
  try {
    // Get distinct pages
    const pages = await prisma.content.findMany({
      select: {
        page: true
      },
      distinct: ['page']
    });
    
    // Extract pages
    const pageList = pages.map(item => item.page);
    
    res.json(pageList);
  } catch (error) {
    console.error('Error fetching content pages:', error);
    res.status(500).json({ error: 'Failed to fetch content pages', details: error.message });
  }
});

// Get sections for a page (requires auth)
router.get('/management/page/:page/sections', auth, async (req, res) => {
  try {
    const { page } = req.params;
    
    // Get distinct sections for page
    const sections = await prisma.content.findMany({
      where: { page },
      select: {
        section: true
      },
      distinct: ['section']
    });
    
    // Extract sections
    const sectionList = sections.map(item => item.section);
    
    res.json(sectionList);
  } catch (error) {
    console.error('Error fetching content sections:', error);
    res.status(500).json({ error: 'Failed to fetch content sections', details: error.message });
  }
});

// Update content order (requires auth)
router.post('/management/reorder', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    
    // Update order for each item
    const updates = items.map(item => 
      prisma.content.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    );
    
    await prisma.$transaction(updates);
    
    res.json({ message: 'Content order updated successfully' });
  } catch (error) {
    console.error('Error updating content order:', error);
    res.status(500).json({ error: 'Failed to update content order', details: error.message });
  }
});

// Bulk update content (requires auth)
router.post('/management/bulk-update', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    
    // Update each item
    const updates = items.map(item => 
      prisma.content.update({
        where: { id: item.id },
        data: {
          title: item.title,
          content: item.content,
          active: item.active,
          metadata: item.metadata
        }
      })
    );
    
    const results = await prisma.$transaction(updates);
    
    res.json({ 
      message: 'Content bulk updated successfully',
      count: results.length
    });
  } catch (error) {
    console.error('Error bulk updating content:', error);
    res.status(500).json({ error: 'Failed to bulk update content', details: error.message });
  }
});

module.exports = router;
