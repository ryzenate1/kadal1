"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Custom hook for smooth animations and scroll effects
export function useSmooth(options?: {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { threshold = 0.1, once = true, rootMargin = "0px" } = options || {};

  useEffect(() => {
    if (!ref.current) return;
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Create animation timeline
    const element = ref.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: `top bottom-=${threshold * 100}%`,
        end: "bottom top",
        toggleActions: "play none none none",
        once,
        markers: false,
      },
    });
    
    // Add fade-in and slide-up animation
    tl.fromTo(
      element,
      { 
        y: 50, 
        opacity: 0 
      },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        ease: "power3.out" 
      }
    );
    
    // Clean up
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [threshold, once, rootMargin]);
  
  return ref;
}
