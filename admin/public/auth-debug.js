// Debug script for testing auth and navigation
// This script should be included in the admin panel for debugging

(function() {
  try {
    if (typeof window !== 'undefined') {
      console.log('=== AUTH DEBUG SCRIPT LOADED ===');
      
      // Store original router.push
      const nextRouterPush = window.history.pushState;
      
      // Override router.push to log more details
      window.history.pushState = function() {
        console.log('Navigation detected!', {
          arguments: arguments,
          url: arguments[2],
          timestamp: new Date().toISOString()
        });
        
        // Call original function
        return nextRouterPush.apply(this, arguments);
      };
      
      // Check local storage
      const checkStorage = () => {
        console.log('Checking localStorage for auth data:');
        try {
          const user = localStorage.getItem('oceanFreshUser');
          const token = localStorage.getItem('oceanFreshToken');
          
          console.log('User in localStorage:', user ? JSON.parse(user) : null);
          console.log('Token in localStorage:', token ? 'Present (length: ' + token.length + ')' : null);
        } catch (e) {
          console.error('Error checking localStorage:', e);
        }
      };
      
      // Run check immediately and every 5 seconds
      checkStorage();
      setInterval(checkStorage, 5000);
      
      // Log all navigation events
      window.addEventListener('popstate', function() {
        console.log('Navigation event (popstate):', {
          pathname: window.location.pathname,
          timestamp: new Date().toISOString()
        });
      });
    }
  } catch (error) {
    console.error('Auth debug script error:', error);
  }
})();
