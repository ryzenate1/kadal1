"use client";

import { ReactNode, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export function AnimatedSection({
  children,
  delay = 0,
  className = "",
  direction = "up",
  distance = 50
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Register ScrollTrigger plugin
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      
      const element = sectionRef.current;
      if (!element) return;
      
      // Set initial position based on direction
      let x = 0;
      let y = 0;
      
      switch (direction) {
        case "up":
          y = distance;
          break;
        case "down":
          y = -distance;
          break;
        case "left":
          x = distance;
          break;
        case "right":
          x = -distance;
          break;
      }
      
      // Create animation
      gsap.fromTo(
        element,
        { 
          opacity: 0,
          x,
          y
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top bottom-=10%",
            toggleActions: "play none none none",
          }
        }
      );
    }
  }, [delay, direction, distance]);
  
  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
}
