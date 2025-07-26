// Test script to create and update orders for testing real-time tracking
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test users...');
    
    // Create a test customer
    const customer = await prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        name: 'Test Customer',
        email: 'customer@example.com',
        phoneNumber: '9876543210',
        password: '$2a$10$JW0GtUXY8sE3J5tZqzXKv.4UUjnJpkw5WZhYTWfWMrxXDEcJRz7j2', // "password123"
        role: 'customer',
        loyaltyPoints: 100,
        loyaltyTier: 'Silver'
      }
    });
    
    // Create an admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        phoneNumber: '9876543211',
        password: '$2a$10$GEIFZnKJDhUQMfR9O6NiceEXyZ.xpGJcw4MH2jlQn8UVyH0m3NBk.', // "admin123"
        role: 'admin',
        loyaltyPoints: 0,
        loyaltyTier: 'Bronze'
      }
    });
    
    console.log('Creating test address...');
    
    // Create a test address
    const address = await prisma.address.upsert({
      where: {
        id: 'test-address-1'
      },
      update: {},
      create: {
        id: 'test-address-1',
        userId: customer.id,
        name: 'Home',
        address: '123 Main St, Apartment 4B',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        isDefault: true
      }
    });
    
    console.log('Creating test categories and products...');
    
    // Create a test category
    const category = await prisma.category.upsert({
      where: { slug: 'fresh-fish' },
      update: {},
      create: {
        name: 'Fresh Fish',
        slug: 'fresh-fish',
        description: 'Freshly caught fish from the local waters',
        imageUrl: '/images/categories/fresh-fish.jpg',
        type: 'Fish',
        icon: 'Fish',
        order: 1,
        isActive: true
      }
    });
    
    // Create test products
    const products = await Promise.all([
      prisma.product.upsert({
        where: { slug: 'atlantic-salmon' },
        update: {},
        create: {
          name: 'Atlantic Salmon',
          slug: 'atlantic-salmon',
          description: 'Fresh Atlantic Salmon, rich in Omega-3',
          price: 599.00,
          originalPrice: 699.00,
          imageUrl: '/images/products/salmon.jpg',
          weight: '500g',
          tag: 'Bestseller',
          featured: true,
          isActive: true,
          stock: 25,
          categoryId: category.id
        }
      }),
      prisma.product.upsert({
        where: { slug: 'king-prawns' },
        update: {},
        create: {
          name: 'King Prawns',
          slug: 'king-prawns',
          description: 'Large king prawns, perfect for grilling',
          price: 399.00,
          originalPrice: 449.00,
          imageUrl: '/images/products/prawns.jpg',
          weight: '250g',
          tag: 'Popular',
          featured: true,
          isActive: true,
          stock: 30,
          categoryId: category.id
        }
      }),
      prisma.product.upsert({
        where: { slug: 'crab-meat' },
        update: {},
        create: {
          name: 'Crab Meat',
          slug: 'crab-meat',
          description: 'Fresh crab meat, cleaned and ready to cook',
          price: 499.00,
          originalPrice: 549.00,
          imageUrl: '/images/products/crab.jpg',
          weight: '300g',
          tag: 'Fresh',
          featured: false,
          isActive: true,
          stock: 15,
          categoryId: category.id
        }
      })
    ]);
    
    console.log('Creating test order...');
    
    // Create a test order
    const order = await prisma.order.create({
      data: {
        id: 'test-order-123456',
        userId: customer.id,
        addressId: address.id,
        status: 'processing',
        totalAmount: 1497.00,
        paymentStatus: 'completed',
        paymentMethod: 'card',
        trackingNumber: 'TRK123456',
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        eta: 45,
        pointsEarned: 150,
        deliveryAgent: 'Rajesh Kumar',
        deliveryPhone: '9876543299',
        orderItems: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: products[0].price
            },
            {
              productId: products[1].id,
              quantity: 2,
              price: products[1].price
            }
          ]
        },
        trackingHistory: {
          create: [
            {
              status: 'pending',
              description: 'Order received',
              timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
              metadata: JSON.stringify({
                lat: 13.0827,
                lng: 80.2707
              })
            },
            {
              status: 'processing',
              description: 'Order is being prepared',
              timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
              metadata: JSON.stringify({
                lat: 13.0827,
                lng: 80.2707,
                note: 'Items being packed'
              })
            }
          ]
        }
      }
    });
    
    console.log('Test data created successfully!');
    console.log('Test order ID:', order.id);
    console.log('Test customer ID:', customer.id);
    console.log('Test admin ID:', admin.id);
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
