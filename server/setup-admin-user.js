const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAdminUser() {
  try {
    console.log('Setting up admin user...');
    
    // Define admin credentials
    const adminCredentials = {
      name: 'Ocean Fresh Admin',
      email: 'admin@oceanfresh.com',
      phoneNumber: '9876543210', // Easy to remember phone number
      password: 'Admin@123',      // Strong password
      role: 'admin'
    };
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
    
    // Check if admin already exists with this phone number
    const existingAdmin = await prisma.user.findUnique({
      where: { phoneNumber: adminCredentials.phoneNumber }
    });
    
    if (existingAdmin) {
      console.log('Admin user exists, updating credentials...');
      
      // Update existing admin
      const updatedAdmin = await prisma.user.update({
        where: { phoneNumber: adminCredentials.phoneNumber },
        data: {
          name: adminCredentials.name,
          email: adminCredentials.email,
          password: hashedPassword,
          role: adminCredentials.role,
          loyaltyPoints: 0,
          loyaltyTier: 'Bronze'
        }
      });
      
      console.log('Admin user updated successfully!');
      console.log('Name:', updatedAdmin.name);
      console.log('Email:', updatedAdmin.email);
      console.log('Phone:', updatedAdmin.phoneNumber);
      console.log('Role:', updatedAdmin.role);
    } else {
      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: {
          name: adminCredentials.name,
          email: adminCredentials.email,
          phoneNumber: adminCredentials.phoneNumber,
          password: hashedPassword,
          role: adminCredentials.role,
          loyaltyPoints: 0,
          loyaltyTier: 'Bronze'
        }
      });
      
      console.log('New admin user created successfully!');
      console.log('Name:', newAdmin.name);
      console.log('Email:', newAdmin.email);
      console.log('Phone:', newAdmin.phoneNumber);
      console.log('Role:', newAdmin.role);
    }
    
    // Also update/create the old test admin if it exists
    const oldTestAdmin = await prisma.user.findUnique({
      where: { phoneNumber: '9876543211' }
    });
    
    if (oldTestAdmin) {
      await prisma.user.update({
        where: { phoneNumber: '9876543211' },
        data: {
          password: hashedPassword, // Same password for consistency
          role: 'admin'
        }
      });
      console.log('Updated old test admin user as well');
    }
    
    console.log('\n=== ADMIN LOGIN CREDENTIALS ===');
    console.log('Phone Number: 9876543210');
    console.log('Password: Admin@123');
    console.log('===============================\n');
    
    // Test the password
    const testLogin = await bcrypt.compare(adminCredentials.password, hashedPassword);
    console.log('Password verification test:', testLogin ? 'PASSED' : 'FAILED');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Error setting up admin user:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setupAdminUser();
