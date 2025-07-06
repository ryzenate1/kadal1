import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

// Optimized text reveal animation
export const textRevealAnimation = (
  element: HTMLElement,
  delay: number = 0,
  duration: number = 1,
  stagger: number = 0.05
) => {
  // Create a timeline for better control and optimization
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    paused: true,
  });

  // Use SplitText for character-based animation (more performant than word-based)
  const split = new SplitText(element, { type: "chars,words" });

  // Optimize animation with will-change for better GPU acceleration
  gsap.set(split.chars, { willChange: "opacity, transform" });

  // Add animations to timeline
  tl.fromTo(
    split.chars,
    {
      y: 100,
      opacity: 0,
      rotationX: -80,
    },
    {
      y: 0,
      opacity: 1,
      rotationX: 0,
      duration,
      stagger: {
        each: stagger,
        from: "start",
      },
    }
  );

  // Clean up function to improve performance
  const cleanup = () => {
    // Remove will-change after animation completes to free up GPU resources
    gsap.set(split.chars, { willChange: "auto" });
    if (split.revert) {
      split.revert();
    }
  };

  // Play the timeline and handle cleanup
  tl.play().then(cleanup);

  // Return the timeline for external control if needed
  return tl;
};

// Optimized fade-in animation with scale
export const fadeInAnimation = (
  element: HTMLElement | HTMLElement[],
  delay: number = 0,
  duration: number = 0.8,
  y: number = 50
) => {
  // Set will-change for better performance
  gsap.set(element, { willChange: "opacity, transform" });

  // Create animation
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    paused: true,
    onComplete: () => {
      // Clean up will-change after animation
      gsap.set(element, { willChange: "auto" });
    },
  });

  tl.fromTo(
    element,
    {
      y,
      opacity: 0,
      scale: 0.95,
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration,
      delay,
      clearProps: "transform", // Clear transform properties for better performance
    }
  );

  // Play the timeline
  tl.play();

  return tl;
};

// Scroll-triggered animations (optimized for performance)
export const createScrollAnimation = (
  trigger: string | HTMLElement,
  animation: (element: HTMLElement) => gsap.core.Timeline,
  options: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    markers?: boolean;
    once?: boolean;
  } = {}
) => {
  // Default options
  const defaultOptions = {
    start: "top 80%",
    end: "bottom 20%",
    scrub: false,
    markers: false,
    once: true,
  };

  // Merge options
  const mergedOptions = { ...defaultOptions, ...options };

  // Create ScrollTrigger
  const scrollTrigger = ScrollTrigger.create({
    trigger,
    start: mergedOptions.start,
    end: mergedOptions.end,
    scrub: mergedOptions.scrub,
    markers: mergedOptions.markers,
    once: mergedOptions.once,
    onEnter: (self) => {
      if (typeof trigger === "string") {
        const element = document.querySelector(trigger) as HTMLElement;
        if (element) {
          animation(element);
        }
      } else {
        animation(trigger as HTMLElement);
      }
    },
  });

  return scrollTrigger;
};

// Path drawing animation for SVG elements
export const pathDrawAnimation = (
  pathElement: SVGPathElement,
  duration: number = 1.5,
  delay: number = 0
) => {
  // Get the length of the path
  const pathLength = pathElement.getTotalLength();

  // Set up initial state
  gsap.set(pathElement, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
    willChange: "stroke-dashoffset",
  });

  // Create animation
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    paused: true,
    onComplete: () => {
      // Clean up will-change after animation
      gsap.set(pathElement, { willChange: "auto" });
    },
  });

  tl.to(pathElement, {
    strokeDashoffset: 0,
    duration,
    delay,
  });

  // Play the timeline
  tl.play();

  return tl;
};

// Staggered reveal animation for multiple elements
export const staggeredReveal = (
  elements: HTMLElement[] | NodeListOf<Element>,
  staggerAmount: number = 0.1,
  y: number = 30
) => {
  // Set will-change for better performance
  gsap.set(elements, { willChange: "opacity, transform" });

  // Create animation
  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    paused: true,
    onComplete: () => {
      // Clean up will-change after animation
      gsap.set(elements, { willChange: "auto" });
    },
  });

  tl.fromTo(
    elements,
    {
      y,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: staggerAmount,
      clearProps: "transform", // Clear transform properties for better performance
    }
  );

  // Play the timeline
  tl.play();

  return tl;
};
