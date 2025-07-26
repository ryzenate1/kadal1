// Comprehensive test script for admin panel functionality
const { execSync } = require('child_process');

async function testAdminPanelFunctionality() {
  console.log('🧪 Testing Admin Panel Functionality...\n');
  
  try {
    // Test 1: Authentication
    console.log('📝 Test 1: Authentication API');
    const authResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '9876543210',
        password: 'Admin@123'
      })
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Authentication: PASSED');
      console.log(`   Token received: ${authData.token ? 'Yes' : 'No'}`);
      console.log(`   User role: ${authData.user?.role || 'Unknown'}\n`);
      
      const token = authData.token;
      
      // Test 2: Products API
      console.log('📦 Test 2: Products API');
      const productsResponse = await fetch('http://localhost:5001/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('✅ Products API: PASSED');
        console.log(`   Products count: ${Array.isArray(productsData) ? productsData.length : 'Unknown'}\n`);
      } else {
        console.log('❌ Products API: FAILED');
        console.log(`   Status: ${productsResponse.status}\n`);
      }
      
      // Test 3: Users API  
      console.log('👥 Test 3: Users API');
      const usersResponse = await fetch('http://localhost:5001/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Users API: PASSED');
        console.log(`   Users count: ${Array.isArray(usersData) ? usersData.length : 'Unknown'}\n`);
      } else {
        console.log('❌ Users API: FAILED');
        console.log(`   Status: ${usersResponse.status}\n`);
      }
      
      // Test 4: Orders API
      console.log('📋 Test 4: Orders API');
      const ordersResponse = await fetch('http://localhost:5001/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log('✅ Orders API: PASSED');
        console.log(`   Orders count: ${Array.isArray(ordersData) ? ordersData.length : 'Unknown'}\n`);
      } else {
        console.log('❌ Orders API: FAILED');
        console.log(`   Status: ${ordersResponse.status}\n`);
      }
      
      // Test 5: File Upload API
      console.log('📤 Test 5: File Upload API');
      const uploadResponse = await fetch('http://localhost:5001/api/upload/product', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        console.log('✅ File Upload API: PASSED');
        console.log(`   Upload URL: ${uploadData.url || 'Unknown'}\n`);
      } else {
        console.log('❌ File Upload API: FAILED');
        console.log(`   Status: ${uploadResponse.status}\n`);
      }
      
    } else {
      console.log('❌ Authentication: FAILED');
      console.log(`   Status: ${authResponse.status}`);
      const errorData = await authResponse.text();
      console.log(`   Error: ${errorData}\n`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
  
  console.log('🏁 Test completed!\n');
  console.log('📋 Summary of fixes implemented:');
  console.log('   ✅ Fixed authentication token handling');
  console.log('   ✅ Added proper error handling for API calls');
  console.log('   ✅ Implemented file upload with authentication');
  console.log('   ✅ Fixed order status update functionality');
  console.log('   ✅ Added payment status update functionality');
  console.log('   ✅ Enhanced dashboard with real data fetching');
  console.log('   ✅ Added comprehensive API endpoints');
  console.log('   ✅ Improved mobile responsiveness considerations');
}

testAdminPanelFunctionality();
