"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { motion } from "framer-motion";

interface FadeInImageProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt: string;
  threshold?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}

export function FadeInImage({
  src,
  alt,
  threshold = 0.1,
  delay = 0,
  duration = 0.5,
  once = true,
  className = "",
  ...props
}: FadeInImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    // Create an intersection observer to detect when the image is in view
    if (typeof window !== "undefined" && window.IntersectionObserver) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              if (once) {
                observer.disconnect();
              }
            } else if (!once) {
              setIsInView(false);
            }
          });
        },
        { threshold }
      );
      
      // Get the parent element to observe
      const element = document.getElementById(`image-container-${alt.replace(/\s+/g, "-").toLowerCase()}`);
      if (element) {
        observer.observe(element);
      }
      
      return () => {
        if (element) {
          observer.unobserve(element);
        }
        observer.disconnect();
      };
    }
    
    // Fallback for browsers that don't support IntersectionObserver
    setIsInView(true);
    return () => {};
  }, [alt, once, threshold]);
  
  return (
    <div 
      id={`image-container-${alt.replace(/\s+/g, "-").toLowerCase()}`} 
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={isInView && isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
        transition={{ 
          duration, 
          delay,
          ease: "easeOut"
        }}
        className="w-full h-full"
      >
        <Image
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      </motion.div>
    </div>
  );
}
