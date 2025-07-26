const http = require('http');

function testLogin() {
  console.log('Testing admin login...');
    const data = JSON.stringify({
    phoneNumber: '9876543210',
    password: 'Admin@123'
  });
    const options = {
    hostname: '127.0.0.1',
    port: 5001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response data:', responseData);
      if (res.statusCode === 200) {
        console.log('Login SUCCESS');
      } else {
        console.log('Login FAILED');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error testing login:', error);
  });
  
  req.write(data);
  req.end();
}

testLogin();
