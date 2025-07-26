// Test database connection with Prisma
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPrismaConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to fetch all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in the database:`);
    
    // Print details of each user (excluding password)
    users.forEach(user => {
      const { password, ...userWithoutPassword } = user;
      console.log('-'.repeat(40));
      console.log('User ID:', user.id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Phone:', user.phoneNumber);
      console.log('Role:', user.role);
      console.log('-'.repeat(40));
    });
    
    // Specifically check for admin user
    const adminUser = await prisma.user.findUnique({
      where: { phoneNumber: '9876543210' }
    });
    
    if (adminUser) {
      console.log('\nFound admin user:');
      console.log('Name:', adminUser.name);
      console.log('Email:', adminUser.email);
      console.log('Phone:', adminUser.phoneNumber);
      console.log('Role:', adminUser.role);
      
      // Test password hash
      const bcrypt = require('bcryptjs');
      const passwordMatch = await bcrypt.compare('Admin@123', adminUser.password);
      console.log('Password matches "Admin@123":', passwordMatch);
    } else {
      console.log('\nCould not find admin user with phone number 9876543210');
    }
    
  } catch (error) {
    console.error('Error testing database connection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();
