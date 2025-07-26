const bcrypt = require('bcryptjs');

async function testPassword() {
  const storedPasswordHash = '$2a$10$xsJ3HsxJ6yTVeayEtWCJkOAx5GmzKqjZx2QrCLo3sAHDPvjzRexe.';
  const inputPassword = 'password123';
  
  const passwordValid = await bcrypt.compare(inputPassword, storedPasswordHash);
  
  console.log(`Testing password '${inputPassword}' against stored hash...`);
  console.log(`Password valid: ${passwordValid}`);
  
  // Test other possible passwords
  const testPasswords = ['admin123', 'Password123', 'password', 'admin', '123456'];
  
  for (const pwd of testPasswords) {
    const isValid = await bcrypt.compare(pwd, storedPasswordHash);
    console.log(`Testing '${pwd}': ${isValid}`);
  }
}

testPassword();
