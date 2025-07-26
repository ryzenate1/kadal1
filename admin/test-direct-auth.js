require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function directAuthTest() {
  try {
    console.log('Testing direct authentication...');
    
    const phoneNumber = '9876543210';
    const password = 'Admin@123';
    
    // Find user directly in the database
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });
    
    if (!user) {
      console.error('User not found');
      return;
    }
    
    console.log('User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    // Verify the password
    const passwordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', passwordValid);
    
    if (!passwordValid) {
      console.error('Password invalid');
      return;
    }
    
    if (user.role !== 'admin') {
      console.error('User is not an admin, role:', user.role);
      return;
    }
    
    console.log('Authentication SUCCESS');
    
  } catch (error) {
    console.error('Error in direct authentication test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

directAuthTest();
