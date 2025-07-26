const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAllUsers() {
  try {
    // Get all users
    const users = await prisma.user.findMany();
    
    console.log('\n=== ALL USERS IN DATABASE ===');
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Phone: ${user.phoneNumber}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password Hash: ${user.password.substring(0, 20)}...`);
      console.log('---');
    });
    
    // Find specific admin user
    const admin = await prisma.user.findUnique({
      where: { phoneNumber: '9876543211' }
    });
    
    if (admin) {
      console.log('\n=== ADMIN USER DETAILS ===');
      console.log(`ID: ${admin.id}`);
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Phone: ${admin.phoneNumber}`);
      console.log(`Role: ${admin.role}`);
      console.log(`Password Hash: ${admin.password}`);
    } else {
      console.log('\nAdmin user with phone 9876543211 not found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
