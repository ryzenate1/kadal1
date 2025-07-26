// auth-middleware.js
// This is a direct client-side middleware script to check if the user is authenticated
// Include this in the login page to force redirect to dashboard if already logged in

(function() {
  try {
    // Check if running in browser
    if (typeof window !== 'undefined') {
      console.log('Auth middleware running...');
      
      // Get the current path
      const currentPath = window.location.pathname;
      
      // Check if we're not already on the dashboard
      if (currentPath === '/login') {
        // Check for stored user data
        const storedUser = localStorage.getItem('oceanFreshUser');
        const token = localStorage.getItem('oceanFreshToken');
        
        if (storedUser && token) {
          console.log('User already logged in, redirecting to dashboard...');
          
          // Force redirect to dashboard
          window.location.href = '/dashboard';
        }
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
  }
})();
