const fetch = require('node-fetch');

async function testLogin() {
  console.log('=== TESTING ADMIN LOGIN ===');
  
  try {
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: '9876543211',
        password: 'password123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('User Role:', data.user.role);
      console.log('Token received:', !!data.token);
    } else {
      console.log('\n❌ LOGIN FAILED');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();
