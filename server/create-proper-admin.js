const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('=== CREATING ADMIN USER ===');
    
    // First, let's clear any existing admin user
    await prisma.user.deleteMany({
      where: { 
        OR: [
          { email: 'admin@example.com' },
          { phoneNumber: '9876543211' }
        ]
      }
    });
    
    // Hash the password properly
    const adminPassword = await bcrypt.hash('password123', 12);
    console.log('Password hashed successfully, length:', adminPassword.length);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        phoneNumber: '9876543211',
        password: adminPassword,
        role: 'admin',
        loyaltyPoints: 0,
        loyaltyTier: 'Bronze'
      }
    });
    
    console.log('Admin user created successfully:');
    console.log('ID:', adminUser.id);
    console.log('Name:', adminUser.name);
    console.log('Email:', adminUser.email);
    console.log('Phone:', adminUser.phoneNumber);
    console.log('Role:', adminUser.role);
    
    // Test the password
    const passwordTest = await bcrypt.compare('password123', adminUser.password);
    console.log('Password verification test:', passwordTest ? 'PASSED' : 'FAILED');
    
    // Also create a customer user for testing
    const customerPassword = await bcrypt.hash('customer123', 12);
    
    await prisma.user.deleteMany({
      where: { 
        OR: [
          { email: 'customer@example.com' },
          { phoneNumber: '9876543212' }
        ]
      }
    });
    
    const customerUser = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'customer@example.com',
        phoneNumber: '9876543212',
        password: customerPassword,
        role: 'customer',
        loyaltyPoints: 350,
        loyaltyTier: 'Silver'
      }
    });
    
    console.log('\nCustomer user created successfully:');
    console.log('ID:', customerUser.id);
    console.log('Name:', customerUser.name);
    console.log('Email:', customerUser.email);
    console.log('Phone:', customerUser.phoneNumber);
    console.log('Role:', customerUser.role);
    
    console.log('\n=== SETUP COMPLETE ===');
    console.log('Admin Login Details:');
    console.log('Phone: 9876543211');
    console.log('Password: password123');
    console.log('\nCustomer Login Details:');
    console.log('Phone: 9876543212');
    console.log('Password: customer123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
