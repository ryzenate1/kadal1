// Generate a test token for API testing
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Set up test user and generate token
async function generateTestToken() {
  try {
    // Check if test user exists, create if not
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: '9876543210',
          password: 'hashedpassword', // In real app this would be hashed
          role: 'customer'
        }
      });
    }
    
    console.log('Test user ID:', testUser.id);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role 
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    console.log('Test token generated:');
    console.log(token);
    
    // Also generate an admin token
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.log('Creating admin user...');
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          phoneNumber: '9876543211',
          password: 'hashedpassword', // In real app this would be hashed
          role: 'admin'
        }
      });
    }
    
    console.log('Admin user ID:', adminUser.id);
    
    // Generate admin JWT token
    const adminToken = jwt.sign(
      { 
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role 
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    console.log('Admin token generated:');
    console.log(adminToken);
    
    return {
      testUserId: testUser.id,
      testToken: token,
      adminUserId: adminUser.id,
      adminToken: adminToken
    };
  } catch (error) {
    console.error('Error generating test token:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
generateTestToken()
  .then(result => {
    console.log('\nUser token for TEST_TOKEN:');
    console.log('export TEST_TOKEN="' + result.testToken + '"');
    console.log('\nAdmin token for ADMIN_TEST_TOKEN:');
    console.log('export ADMIN_TEST_TOKEN="' + result.adminToken + '"');
  })
  .catch(error => {
    console.error('Failed:', error);
    process.exit(1);
  });
