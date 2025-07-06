"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation, Variants, Variant } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  once?: boolean;
  delay?: number;
  speed?: number;
  staggerChildren?: number;
  tag?: keyof JSX.IntrinsicElements;
}

export function AnimatedText({
  text,
  className = "",
  once = true,
  delay = 0,
  speed = 0.05,
  staggerChildren = 0.015,
  tag: Tag = "p",
}: AnimatedTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!once) {
      controls.start("hidden");
    }
  }, [isInView, controls, once]);
  
  // Split text into words and characters
  const words = text.split(" ");
  
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren,
        delayChildren: delay,
      },
    },
  };
  
  const child: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: speed,
      },
    },
  };
  
  return (
    <Tag className={className}>
      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={controls}
        className="inline-block"
      >
        {words.map((word: string, index: number) => (
          <motion.span
            key={index}
            className="inline-block mr-1"
            variants={child}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </Tag>
  );
}

export default AnimatedText;
