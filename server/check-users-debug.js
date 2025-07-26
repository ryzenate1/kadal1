const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('=== CHECKING DATABASE USERS ===');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        password: true, // We'll check if password exists and looks hashed
        createdAt: true
      }
    });
    
    console.log('Total users found:', users.length);
    console.log('\n=== USER DETAILS ===');
    
    for (const user of users) {
      console.log(`\nUser ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Phone: ${user.phoneNumber}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password exists: ${!!user.password}`);
      console.log(`Password length: ${user.password ? user.password.length : 0}`);
      console.log(`Password looks hashed: ${user.password && user.password.startsWith('$2')}`);
      console.log(`Created: ${user.createdAt}`);
      
      // Test password verification for admin user
      if (user.email === 'admin@example.com') {
        console.log('\n--- Testing admin password ---');
        try {
          const testPasswords = ['password123', 'admin123', '123456'];
          for (const testPass of testPasswords) {
            const isValid = await bcrypt.compare(testPass, user.password);
            console.log(`Password "${testPass}": ${isValid ? 'VALID' : 'invalid'}`);
            if (isValid) break;
          }
        } catch (err) {
          console.log('Error testing password:', err.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
