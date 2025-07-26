const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createOrUpdateAdmin() {
  try {
    // First, let's check if there's already an admin user
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'admin@example.com' },
          { phoneNumber: '9876543211' }
        ]
      }
    });
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    if (existingAdmin) {
      // Update existing user to be admin
      const updatedAdmin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          phoneNumber: '9876543211',
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('Updated existing user to admin:', updatedAdmin);
    } else {
      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          phoneNumber: '9876543211',
          password: hashedPassword,
          loyaltyPoints: 0,
          loyaltyTier: 'Bronze',
          role: 'admin'
        }
      });
      console.log('Created new admin user:', newAdmin);
    }
    
    // Show all admin users
    const allAdmins = await prisma.user.findMany({
      where: { role: 'admin' }
    });
    
    console.log('\n=== ADMIN LOGIN CREDENTIALS ===');
    allAdmins.forEach(admin => {
      console.log(`Phone Number: ${admin.phoneNumber}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Password: password123`);
      console.log(`Name: ${admin.name}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOrUpdateAdmin();
