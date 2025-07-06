"use client";

import { useRef, useEffect, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  offset?: number;
}

export function ParallaxSection({
  children,
  className = "",
  speed = 0.2,
  direction = "up",
  offset = 50,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Calculate transform values based on direction
  let x = useTransform(scrollYProgress, [0, 1], [0, 0]);
  let y = useTransform(scrollYProgress, [0, 1], [0, 0]);
  
  switch (direction) {
    case "up":
      y = useTransform(scrollYProgress, [0, 1], [offset, -offset * speed]);
      break;
    case "down":
      y = useTransform(scrollYProgress, [0, 1], [-offset, offset * speed]);
      break;
    case "left":
      x = useTransform(scrollYProgress, [0, 1], [offset, -offset * speed]);
      break;
    case "right":
      x = useTransform(scrollYProgress, [0, 1], [-offset, offset * speed]);
      break;
  }
  
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
