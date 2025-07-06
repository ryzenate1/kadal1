/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { ReactNode, useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisRef.current = lenis;

    // Animation frame loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Function to scroll to a specific element
  const scrollTo = (target: string | HTMLElement, options?: { offset?: number; duration?: number }) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: options?.offset || 0,
        duration: options?.duration || 1.2,
      });
    }
  };

  // Function to stop/start smooth scrolling
  const stopScrolling = () => {
    if (lenisRef.current) {
      lenisRef.current.stop();
    }
  };

  const startScrolling = () => {
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  };

  return (
    <div className="smooth-scroll-container">
      {children}
    </div>
  );
};

export default SmoothScrollProvider;
