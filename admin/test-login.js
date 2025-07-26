// Test login with fetch
console.log('Testing login with fetch API...');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: '9876543210',
        password: 'Admin@123'
      })
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('Login SUCCESS');
    } else {
      console.log('Login FAILED');
    }
  } catch (error) {
    console.error('Error during login test:', error);
  }
}

testLogin();
