import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../index';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads/images');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `media-${uniqueSuffix}${fileExtension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all media files
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
        { alt: { contains: search } }
      ]
    } : {};
    
    const [media, total] = await Promise.all([
      (prisma as any).media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      (prisma as any).media.count({ where })
    ]);
    
    res.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    res.status(500).json({ 
      message: 'Error fetching media', 
      error: error.message 
    });
  }
});

// Get specific media by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const media = await (prisma as any).media.findUnique({
      where: { id }
    });
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    res.json(media);
  } catch (error: any) {
    console.error('Error fetching media:', error);
    res.status(500).json({ 
      message: 'Error fetching media', 
      error: error.message 
    });
  }
});

// Upload new media file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { alt, description } = req.body;
    const baseUrl = process.env.SERVER_URL || 'http://localhost:5001';
    const fileUrl = `${baseUrl}/uploads/images/${req.file.filename}`;
    
    const media = await (prisma as any).media.create({
      data: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        alt: alt || '',
        description: description || ''
      }
    });
    
    res.status(201).json({ 
      message: 'File uploaded successfully', 
      media 
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    res.status(500).json({ 
      message: 'Error uploading media', 
      error: error.message 
    });
  }
});

// Update media metadata
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, alt, description } = req.body;
    
    const media = await (prisma as any).media.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(alt !== undefined && { alt }),
        ...(description !== undefined && { description }),
        updatedAt: new Date()
      }
    });
    
    res.json({ message: 'Media updated successfully', media });
  } catch (error: any) {
    console.error('Error updating media:', error);
    res.status(500).json({ 
      message: 'Error updating media', 
      error: error.message 
    });
  }
});

// Delete media
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get media info to delete file
    const media = await (prisma as any).media.findUnique({
      where: { id }
    });
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Delete from database
    await (prisma as any).media.delete({
      where: { id }
    });
    
    // Delete physical file
    try {
      const filename = path.basename(media.url);
      const filePath = path.join(__dirname, '../../uploads/images', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError);
    }
    
    res.json({ message: 'Media deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    res.status(500).json({ 
      message: 'Error deleting media', 
      error: error.message 
    });
  }
});

// Bulk delete media
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Media IDs array is required' });
    }
    
    // Get media info for file deletion
    const mediaFiles = await (prisma as any).media.findMany({
      where: { id: { in: ids } }
    });
    
    // Delete from database
    await (prisma as any).media.deleteMany({
      where: { id: { in: ids } }
    });
    
    // Delete physical files
    mediaFiles.forEach((media: any) => {
      try {
        const filename = path.basename(media.url);
        const filePath = path.join(__dirname, '../../uploads/images', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.warn('Could not delete physical file:', fileError);
      }
    });
    
    res.json({ 
      message: `${mediaFiles.length} media files deleted successfully` 
    });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    res.status(500).json({ 
      message: 'Error deleting media', 
      error: error.message 
    });
  }
});

export default router;
