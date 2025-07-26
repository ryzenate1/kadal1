// Generate simple test tokens with known secret
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

// Generate test user token
const testUserToken = jwt.sign(
  {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'customer'
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// Generate admin token
const adminToken = jwt.sign(
  {
    userId: 'admin-user-123',
    email: 'admin@example.com',
    role: 'admin'
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('Test User Token:');
console.log(testUserToken);

console.log('\nAdmin Token:');
console.log(adminToken);

console.log('\nExport commands:');
console.log(`$env:TEST_TOKEN="${testUserToken}"`);
console.log(`$env:ADMIN_TEST_TOKEN="${adminToken}"`);
console.log(`$env:JWT_SECRET="${JWT_SECRET}"`);
