import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Initial check
      setMatches(media.matches);
      
      // Add listener for changes
      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);
      
      // Clean up
      return () => media.removeEventListener('change', listener);
    }
    
    return undefined;
  }, [query]);
  
  return matches;
}
