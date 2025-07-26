const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminWithCustomPhone() {
  try {
    const phoneNumber = '987654321'; // The phone number you're trying to use
    const password = 'password123';
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { phoneNumber }
    });
    
    if (existingUser) {
      console.log(`User with phone ${phoneNumber} already exists:`, existingUser);
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await prisma.user.create({
      data: {
        name: 'Custom Admin',
        email: 'custom@example.com',
        phoneNumber: phoneNumber,
        password: hashedPassword,
        loyaltyPoints: 0,
        loyaltyTier: 'Bronze',
        role: 'admin'
      }
    });
    
    console.log('✅ Created new admin user:');
    console.log(`📱 Phone: ${newAdmin.phoneNumber}`);
    console.log(`📧 Email: ${newAdmin.email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${newAdmin.name}`);
    console.log(`🔐 Role: ${newAdmin.role}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminWithCustomPhone();
