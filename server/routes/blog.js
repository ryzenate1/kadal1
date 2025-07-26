const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/auth');

// Get all blog posts with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, tag, featured, published = true, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Build filters
    let where = {};
    
    // Only show published posts to public API
    if (published === 'true' || published === true) {
      where.published = true;
    }
    
    if (featured === 'true' || featured === true) {
      where.featured = true;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (tag) {
      where.tags = {
        has: tag
      };
    }
    
    if (search) {
      where = {
        ...where,
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } }
        ]
      };
    }
    
    // Build sort options
    const orderBy = {};
    orderBy[sortBy] = order.toLowerCase();
    
    // Query posts
    const posts = await prisma.blogPost.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        category: true,
        tags: true,
        author: true,
        published: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        // Don't include full content in list view
      }
    });
    
    // Get total count for pagination
    const total = await prisma.blogPost.count({ where });
    
    res.json({
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts', details: error.message });
  }
});

// Get blog post by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is a UUID or slug
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(identifier);
    
    // Query by ID or slug
    const post = await prisma.blogPost.findFirst({
      where: isUuid 
        ? { id: identifier }
        : { slug: identifier },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        featuredImage: true,
        category: true,
        tags: true,
        author: true,
        published: true,
        featured: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // If not published, require auth
    if (!post.published && !req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post', details: error.message });
  }
});

// Create new blog post (requires auth)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, excerpt, featuredImage, category, tags, author, published = false, featured = false } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
    
    // Check if slug already exists
    const existingPost = await prisma.blogPost.findFirst({
      where: { slug }
    });
    
    // If slug exists, append a unique identifier
    let finalSlug = slug;
    if (existingPost) {
      finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    
    // Create post
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt: excerpt || content.substring(0, 150),
        featuredImage,
        category,
        tags: tags || [],
        author: author || 'Admin',
        published,
        featured
      }
    });
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post', details: error.message });
  }
});

// Update blog post (requires auth)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, featuredImage, category, tags, author, published, featured } = req.body;
    
    // Create update data
    const updateData = {};
    
    if (title) {
      updateData.title = title;
      
      // Update slug if title changes
      const slug = title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      
      // Check if slug already exists
      const existingPost = await prisma.blogPost.findFirst({
        where: { 
          slug,
          id: { not: id }
        }
      });
      
      // If slug exists, append a unique identifier
      updateData.slug = existingPost 
        ? `${slug}-${Date.now().toString().slice(-4)}`
        : slug;
    }
    
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (author !== undefined) updateData.author = author;
    if (published !== undefined) updateData.published = published;
    if (featured !== undefined) updateData.featured = featured;
    
    // Update post
    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData
    });
    
    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post', details: error.message });
  }
});

// Delete blog post (requires auth)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Store post for undo capability
    const post = await prisma.blogPost.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Delete post
    await prisma.blogPost.delete({
      where: { id }
    });
    
    // Store deleted post in deletedBlogPosts table for undo capability
    await prisma.deletedBlogPost.create({
      data: {
        originalId: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        category: post.category,
        tags: post.tags,
        author: post.author,
        published: post.published,
        featured: post.featured,
        deletedAt: new Date()
      }
    });
    
    res.json({ 
      message: 'Blog post deleted successfully',
      undoAvailable: true,
      undoExpiresAt: new Date(Date.now() + 10 * 1000) // 10 seconds
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post', details: error.message });
  }
});

// Undo delete (requires auth)
router.post('/:id/restore', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find deleted post
    const deletedPost = await prisma.deletedBlogPost.findFirst({
      where: { originalId: id }
    });
    
    if (!deletedPost) {
      return res.status(404).json({ error: 'Deleted post not found or undo period expired' });
    }
    
    // Check if undo period expired (10 seconds)
    const undoExpiration = new Date(deletedPost.deletedAt);
    undoExpiration.setSeconds(undoExpiration.getSeconds() + 10);
    
    if (new Date() > undoExpiration) {
      return res.status(400).json({ error: 'Undo period expired' });
    }
    
    // Restore post
    const restoredPost = await prisma.blogPost.create({
      data: {
        id: deletedPost.originalId,
        title: deletedPost.title,
        slug: deletedPost.slug,
        content: deletedPost.content,
        excerpt: deletedPost.excerpt,
        featuredImage: deletedPost.featuredImage,
        category: deletedPost.category,
        tags: deletedPost.tags,
        author: deletedPost.author,
        published: deletedPost.published,
        featured: deletedPost.featured,
        createdAt: deletedPost.createdAt
      }
    });
    
    // Remove from deleted posts
    await prisma.deletedBlogPost.delete({
      where: { id: deletedPost.id }
    });
    
    res.json({
      message: 'Blog post restored successfully',
      post: restoredPost
    });
  } catch (error) {
    console.error('Error restoring blog post:', error);
    res.status(500).json({ error: 'Failed to restore blog post', details: error.message });
  }
});

// Get blog categories (requires auth)
router.get('/categories/list', auth, async (req, res) => {
  try {
    // Get distinct categories
    const categories = await prisma.blogPost.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });
    
    // Extract and filter null values
    const categoryList = categories
      .map(item => item.category)
      .filter(Boolean);
    
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({ error: 'Failed to fetch blog categories', details: error.message });
  }
});

// Get blog tags (requires auth)
router.get('/tags/list', auth, async (req, res) => {
  try {
    // Get all posts
    const posts = await prisma.blogPost.findMany({
      select: {
        tags: true
      }
    });
    
    // Extract and flatten tags
    const tags = posts
      .flatMap(post => post.tags || [])
      .filter(Boolean);
    
    // Get unique tags
    const uniqueTags = [...new Set(tags)];
    
    res.json(uniqueTags);
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    res.status(500).json({ error: 'Failed to fetch blog tags', details: error.message });
  }
});

module.exports = router;
