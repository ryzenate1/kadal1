"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  once?: boolean;
}

export function CountUp({
  end,
  start = 0,
  duration = 2,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  className = "",
  once = true
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once });
  const [hasStarted, setHasStarted] = useState(false);
  
  useEffect(() => {
    if (!isInView || hasStarted) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const startAnimation = () => {
      startTime = performance.now();
      animationFrame = requestAnimationFrame(updateCount);
      setHasStarted(true);
    };
    
    const updateCount = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }
      
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentCount = start + (end - start) * easeOutQuart(progress);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };
    
    // Easing function for smoother animation
    const easeOutQuart = (x: number): number => {
      return 1 - Math.pow(1 - x, 4);
    };
    
    // Start animation after delay
    const timer = setTimeout(() => {
      startAnimation();
    }, delay * 1000);
    
    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, hasStarted, start, end, duration, delay]);
  
  // Format the number with separators and decimals
  const formatNumber = (num: number): string => {
    const fixedNum = num.toFixed(decimals);
    const [whole, decimal] = fixedNum.split('.');
    
    // Add separators to the whole number part
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    // Return the formatted number with or without decimals
    return decimals > 0 ? `${formattedWhole}.${decimal}` : formattedWhole;
  };
  
  return (
    <span ref={ref} className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
}
