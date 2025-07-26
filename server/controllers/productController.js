const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

// Load environment variables from env.local
let adminApiUrl = 'http://localhost:3001/api';
try {
  const envFilePath = path.join(__dirname, '..', 'env.local');
  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const envLines = envContent.split('\n');
    for (const line of envLines) {
      const [key, value] = line.split('=');
      if (key === 'ADMIN_API_URL' && value) {
        adminApiUrl = value.trim().replace(/"/g, '');
        break;
      }
    }
  }
} catch (err) {
  console.error('Error loading env.local:', err);
}

exports.getAll = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { 
      name, 
      slug, 
      description, 
      price, 
      originalPrice, 
      imageUrl, 
      weight, 
      tag, 
      featured, 
      stock, 
      categoryId 
    } = req.body;
    
    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });
    
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this slug already exists' });
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        imageUrl,
        weight,
        tag,
        featured: featured === true,
        stock: parseInt(stock),
        categoryId,
      },
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      slug, 
      description, 
      price, 
      originalPrice, 
      imageUrl, 
      weight, 
      tag, 
      featured, 
      stock, 
      categoryId,
      addToSection
    } = req.body;
    
    // Check if slug already exists for another product
    if (slug) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: id }
        },
      });
      
      if (existingProduct) {
        return res.status(400).json({ message: 'Another product with this slug already exists' });
      }
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price: price ? parseFloat(price) : undefined,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        imageUrl,
        weight,
        tag,
        featured: featured !== undefined ? featured : undefined,
        stock: stock ? parseInt(stock) : undefined,
        categoryId,
      },
      include: {
        category: true,
      },
    });
    
    // Handle adding to featured fish or trusted badge if requested
    if (addToSection && addToSection !== 'none') {
      try {
        // Get category name
        const category = product.category ? product.category.name : 'Fish';
        
        // Create data for the section
        let sectionData = {
          id: product.id,
          name: product.name,
          image: product.imageUrl,
          imageUrl: product.imageUrl,
          description: product.description || '',
          price: product.price
        };
        
        if (addToSection === 'featured-fish') {
          sectionData = {
            ...sectionData,
            slug: product.slug,
            type: category,
            featured: true,
            weight: product.weight || '',
            discount: product.originalPrice ? 
              Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0,
            iconName: 'Fish',
            isActive: true,
            order: 0
          };
        } else if (addToSection === 'trusted-badge') {
          sectionData = {
            ...sectionData,
            category,
            originalPrice: product.originalPrice || product.price * 1.1,
            weight: product.weight || '',
            freshness: 'Fresh',
            iconName: 'Fish',
            color: 'bg-blue-500',
            rating: 4.5,
            isActive: true
          };
        }
        
        // Use axios or node-fetch to call the API
        const sectionApiUrl = `${adminApiUrl}/${addToSection}`;
        const response = await fetch(sectionApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sectionData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to add product to ${addToSection}:`, errorData);
        }
      } catch (sectionError) {
        console.error(`Error adding product to ${addToSection}:`, sectionError);
        // We don't want to fail the main request if section update fails
      }
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await prisma.product.delete({
      where: { id },
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
}; 