// API Testing Utility for Featured Products
export const testFeaturedProductsAPI = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    clientAPI: null as any,
    adminAPI: null as any,
    serverAPI: null as any,
    summary: '',
  };

  console.log('🧪 Testing Featured Products API connections...');

  // Test 1: Client API endpoint
  try {
    console.log('📡 Testing client API: /api/featured-fish');
    const clientResponse = await fetch('/api/featured-fish', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    results.clientAPI = {
      status: clientResponse.status,
      ok: clientResponse.ok,
      data: clientResponse.ok ? await clientResponse.json() : null,
      error: clientResponse.ok ? null : `HTTP ${clientResponse.status}`
    };

    console.log(clientResponse.ok ? '✅ Client API working' : '❌ Client API failed');
  } catch (error) {
    results.clientAPI = {
      status: 0,
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    console.log('❌ Client API error:', error);
  }

  // Test 2: Admin API endpoint (if accessible)
  try {
    console.log('📡 Testing admin API: http://localhost:3001/api/featured-fish');
    const adminResponse = await fetch('http://localhost:3001/api/featured-fish', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    results.adminAPI = {
      status: adminResponse.status,
      ok: adminResponse.ok,
      data: adminResponse.ok ? await adminResponse.json() : null,
      error: adminResponse.ok ? null : `HTTP ${adminResponse.status}`
    };

    console.log(adminResponse.ok ? '✅ Admin API working' : '❌ Admin API failed');
  } catch (error) {
    results.adminAPI = {
      status: 0,
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : 'Admin API not accessible from client'
    };
    console.log('❌ Admin API error:', error);
  }

  // Test 3: Server API endpoint (if accessible)
  try {
    console.log('📡 Testing server API: http://localhost:5001/api/featured-fish');
    const serverResponse = await fetch('http://localhost:5001/api/featured-fish', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-test-token'
      },
      cache: 'no-store'
    });

    results.serverAPI = {
      status: serverResponse.status,
      ok: serverResponse.ok,
      data: serverResponse.ok ? await serverResponse.json() : null,
      error: serverResponse.ok ? null : `HTTP ${serverResponse.status}`
    };

    console.log(serverResponse.ok ? '✅ Server API working' : '❌ Server API failed');
  } catch (error) {
    results.serverAPI = {
      status: 0,
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : 'Server API not accessible from client'
    };
    console.log('❌ Server API error:', error);
  }

  // Generate summary
  const workingAPIs = [
    results.clientAPI?.ok && 'Client',
    results.adminAPI?.ok && 'Admin',
    results.serverAPI?.ok && 'Server'
  ].filter(Boolean);

  if (workingAPIs.length > 0) {
    results.summary = `✅ ${workingAPIs.join(', ')} API(s) working`;
  } else {
    results.summary = '❌ All APIs failed - using fallback data';
  }

  console.log('🔍 Test Summary:', results.summary);
  console.log('📊 Full Results:', results);

  return results;
};

// Test responsive breakpoints
export const testResponsiveBreakpoints = () => {
  const breakpoints = {
    mobile: window.innerWidth < 768,
    tablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    desktop: window.innerWidth >= 1024,
    current: window.innerWidth
  };

  console.log('📱 Current Device:', {
    width: window.innerWidth,
    type: breakpoints.mobile ? 'Mobile' : breakpoints.tablet ? 'Tablet' : 'Desktop',
    breakpoints
  });

  return breakpoints;
};

// Combined test function
export const runFullAPITest = async () => {
  console.log('🚀 Running full API and responsive test...');
  
  const responsive = testResponsiveBreakpoints();
  const api = await testFeaturedProductsAPI();
  
  return {
    responsive,
    api,
    recommendations: generateRecommendations(api, responsive)
  };
};

const generateRecommendations = (apiResults: any, responsive: any) => {
  const recommendations = [];

  if (!apiResults.clientAPI?.ok) {
    recommendations.push('⚠️ Client API is not working - check Next.js API routes');
  }

  if (!apiResults.adminAPI?.ok) {
    recommendations.push('⚠️ Admin API is not accessible - ensure admin server is running on port 3001');
  }

  if (!apiResults.serverAPI?.ok) {
    recommendations.push('⚠️ Server API is not accessible - ensure backend server is running on port 5001');
  }

  if (responsive.mobile) {
    recommendations.push('📱 Mobile view - ensure horizontal scrolling works properly');
  } else {
    recommendations.push('🖥️ Desktop view - ensure cards display in horizontal row');
  }

  return recommendations;
};
