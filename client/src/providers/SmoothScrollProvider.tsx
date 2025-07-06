"use client";

import { ReactNode, createContext, useContext, useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

interface SmoothScrollContextType {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling (this provider is now conditionally loaded)
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      wrapper: document.body,
      content: document.documentElement,
    });

    // Store the lenis instance
    lenisRef.current = lenis;

    // Intercept events before they reach Lenis (backup protection)

    // Store the lenis instance
    lenisRef.current = lenis;

    // Intercept events before they reach Lenis
    const interceptWheelEvent = (e: WheelEvent) => {
      const target = e.target as Element;
      // Check if event is on a map element
      if (target && (
        target.closest('.no-tailwind-map-container') ||
        target.closest('.google-maps-container') ||
        target.closest('[class*="map"]') ||
        target.closest('[class*="gm-"]') ||
        target.closest('[id*="map"]') ||
        target.closest('.gm-style') ||
        target.closest('div[id^="gmp-map"]')
      )) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    };

    const interceptTouchEvent = (e: TouchEvent) => {
      const target = e.target as Element;
      // Check if event is on a map element
      if (target && (
        target.closest('.no-tailwind-map-container') ||
        target.closest('.google-maps-container') ||
        target.closest('[class*="map"]') ||
        target.closest('[class*="gm-"]') ||
        target.closest('[id*="map"]') ||
        target.closest('.gm-style') ||
        target.closest('div[id^="gmp-map"]')
      )) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    };

    // Add event interceptors before Lenis processes events
    document.addEventListener('wheel', interceptWheelEvent, { capture: true, passive: false });
    document.addEventListener('touchmove', interceptTouchEvent, { capture: true, passive: false });

    // Function to add event prevention on map elements
    const preventLenisOnMaps = () => {
      // Find all map containers and their children with more specific selectors
      const mapSelectors = [
        '.no-tailwind-map-container',
        '.google-maps-container',
        '[class*="map"]',
        '[class*="google"]',
        '[class*="gm-"]',
        '[id*="map"]',
        '[id*="google"]',
        // More specific Google Maps elements
        '.gm-style',
        '.gm-style *',
        '[class^="gm-"]',
        '[id^="gm-"]'
      ];
      
      mapSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Add event listeners to completely block Lenis events
          const preventLenis = (e: Event) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
          };
          
          // Remove any existing listeners first to avoid duplicates
          const events = ['wheel', 'touchstart', 'touchmove', 'scroll', 'mousewheel', 'DOMMouseScroll'];
          events.forEach(eventType => {
            element.removeEventListener(eventType, preventLenis);
            element.addEventListener(eventType, preventLenis, { passive: false, capture: true });
          });
          
          // Also disable Lenis on these elements directly
          (element as any).lenisDisabled = true;
        });
      });
      
      // Additional check for map containers specifically
      const mapContainers = document.querySelectorAll('[class*="map"], [id*="map"]');
      mapContainers.forEach(container => {
        // Disable Lenis scrolling on map containers
        container.addEventListener('wheel', (e) => {
          e.stopPropagation();
          e.preventDefault();
        }, { passive: false, capture: true });
        
        container.addEventListener('touchmove', (e) => {
          e.stopPropagation();
        }, { passive: false, capture: true });
      });
    };

    // Set up the RAF loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    // Start the animation loop
    requestAnimationFrame(raf);
    
    // Prevent Lenis on map elements after a short delay to ensure DOM is ready
    setTimeout(preventLenisOnMaps, 100);
    
    // Global zoom detection - no more overlay hiding since they're conditionally rendered
    const handleGlobalZoom = () => {
      // Just handle zoom events - overlays are now conditionally rendered instead of hidden
      console.log('Global zoom detected - overlays conditionally rendered');
    };
    
    // Listen for Ctrl+Zoom globally
    document.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        handleGlobalZoom();
      }
    }, { passive: true });
    
    // Listen for resize events that might indicate zoom
    window.addEventListener('resize', handleGlobalZoom);
    
    // Also run when new elements are added (for dynamic content)
    const observer = new MutationObserver(() => {
      setTimeout(preventLenisOnMaps, 50);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id']
    });

    return () => {
      // Clean up
      observer.disconnect();
      document.removeEventListener('wheel', handleGlobalZoom);
      document.removeEventListener('wheel', interceptWheelEvent);
      document.removeEventListener('touchmove', interceptTouchEvent);
      window.removeEventListener('resize', handleGlobalZoom);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
