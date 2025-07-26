const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAdminCredentials() {
  try {
    console.log('=== FIXING ADMIN CREDENTIALS ===');
    
    // Create a fresh admin password
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    console.log(`Creating/updating admin with password: ${plainPassword}`);
    
    // Find existing admin or create new one
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        OR: [
          { role: 'admin' },
          { email: 'admin@example.com' },
          { phoneNumber: '9876543211' }
        ]
      }
    });
    
    let adminUser;
    
    if (existingAdmin) {
      console.log('Found existing admin, updating credentials...');
      adminUser = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          phoneNumber: '9876543211',
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('Admin updated successfully');
    } else {
      console.log('No admin found, creating new admin...');
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          phoneNumber: '9876543211',
          password: hashedPassword,
          role: 'admin',
          loyaltyPoints: 0,
          loyaltyTier: 'Bronze'
        }
      });
      console.log('Admin created successfully');
    }
    
    // Verify password with bcrypt
    const verifyPassword = await bcrypt.compare(plainPassword, adminUser.password);
    console.log(`\nPassword verification test: ${verifyPassword ? 'PASSED' : 'FAILED'}`);
    
    // Show login info
    console.log('\n=== ADMIN LOGIN INFO ===');
    console.log(`Phone Number: ${adminUser.phoneNumber}`);
    console.log(`Password: ${plainPassword}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Name: ${adminUser.name}`);
    console.log(`Role: ${adminUser.role}`);
    
    console.log('\n=== INSTRUCTIONS ===');
    console.log('1. Use these credentials in the admin login form');
    console.log('2. Make sure the server is running (node index.js)');
    console.log('3. Ensure the admin panel is pointed to http://localhost:5001/api');
    console.log('4. Clear browser cache/storage if you had previous login attempts');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminCredentials();
