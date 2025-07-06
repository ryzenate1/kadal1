"use client";

import { ReactNode, useEffect, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  
  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Initialize Lenis for smooth scrolling
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    
    setLenis(lenisInstance);
    
    // Connect Lenis to ScrollTrigger
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    
    // Update ScrollTrigger when Lenis scrolls
    lenisInstance.on("scroll", ScrollTrigger.update);
    
    // Clean up
    return () => {
      lenisInstance.destroy();
      gsap.ticker.remove(lenisInstance.raf);
    };
  }, []);
  
  return <>{children}</>;
}
