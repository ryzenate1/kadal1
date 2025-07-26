const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' }
    });
    
    console.log('Admin users found:');
    adminUsers.forEach(user => {
      console.log(`- Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Phone: ${user.phoneNumber}`);
      console.log(`  Role: ${user.role}`);
      console.log('---');
    });
    
    if (adminUsers.length === 0) {
      console.log('No admin users found. Creating one...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const adminUser = await prisma.user.create({
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
      
      console.log('Created admin user:');
      console.log(`- Name: ${adminUser.name}`);
      console.log(`- Email: ${adminUser.email}`);
      console.log(`- Phone: ${adminUser.phoneNumber}`);
      console.log(`- Role: ${adminUser.role}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
