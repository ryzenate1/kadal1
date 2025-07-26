const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniquePrefix}${ext}`);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

exports.upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Get all media files
exports.getAll = async (req, res) => {
  try {
    const media = await prisma.media.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: 'Error fetching media', error: error.message });
  }
};

// Get one media file by ID
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await prisma.media.findUnique({
      where: { id }
    });
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    res.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: 'Error fetching media', error: error.message });
  }
};

// Upload media file
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { originalname, mimetype, filename, size } = req.file;
    const fileUrl = `/uploads/images/${filename}`;
    
    // Create media record in database
    const media = await prisma.media.create({
      data: {
        name: req.body.name || originalname,
        type: mimetype,
        size,
        url: fileUrl,
        alt: req.body.alt || originalname.split('.')[0],
        description: req.body.description || ''
      }
    });
    
    res.status(201).json(media);
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: 'Error uploading media', error: error.message });
  }
};

// Update media metadata
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, alt, description } = req.body;
    
    const media = await prisma.media.update({
      where: { id },
      data: {
        name,
        alt,
        description
      }
    });
    
    res.json(media);
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ message: 'Error updating media', error: error.message });
  }
};

// Delete media file
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get media info
    const media = await prisma.media.findUnique({
      where: { id }
    });
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Delete file from disk
    const filePath = path.join(__dirname, '..', media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await prisma.media.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ message: 'Error deleting media', error: error.message });
  }
};
