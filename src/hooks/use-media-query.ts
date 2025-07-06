import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // For SSR, we need to check if window is defined
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Initial check
      setMatches(media.matches);
      
      // Create listener function
      const listener = (e: MediaQueryListEvent) => {
        setMatches(e.matches);
      };
      
      // Add listener
      media.addEventListener('change', listener);
      
      // Clean up
      return () => {
        media.removeEventListener('change', listener);
      };
    }
  }, [query]);

  return matches;
}
