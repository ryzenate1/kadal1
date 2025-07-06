/* 🎥 Animation Utilities for Kadal Thunai */

import { Variants } from 'framer-motion';

// === Framer Motion Variants ===

export const fadeIn: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    } 
  }
};

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    } 
  }
};

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -40 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    } 
  }
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  show: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    } 
  }
};

export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -50 
  },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    } 
  }
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 50 
  },
  show: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    } 
  }
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    } 
  }
};

// === Page Transition Variants ===

export const pageTransition: Variants = {
  initial: { 
    opacity: 0, 
    y: 20 
  },
  in: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
  out: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.4,
      ease: "easeIn"
    }
  }
};

// === Card Hover Animations ===

export const cardHover: Variants = {
  rest: { 
    scale: 1, 
    y: 0,
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
  },
  hover: { 
    scale: 1.02, 
    y: -4,
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export const buttonHover: Variants = {
  rest: { 
    scale: 1, 
    y: 0 
  },
  hover: { 
    scale: 1.05, 
    y: -2,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.95, 
    y: 0 
  }
};

// === Slider/Carousel Animations ===

export const sliderContainer: Variants = {
  hidden: { 
    opacity: 0 
  },
  show: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.15
    }
  }
};

export const sliderItem: Variants = {
  hidden: { 
    opacity: 0, 
    x: 50 
  },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// === GSAP Animation Configurations ===

export const gsapFadeIn = {
  opacity: 0,
  y: 30,
  duration: 0.8,
  ease: "power3.out"
};

export const gsapSlideIn = {
  x: -100,
  opacity: 0,
  duration: 1,
  ease: "power2.out"
};

export const gsapStagger = {
  y: 50,
  opacity: 0,
  duration: 0.8,
  stagger: 0.2,
  ease: "power3.out"
};

// === Utility Functions ===

export const createStaggerAnimation = (delay: number = 0.1) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: delay,
      delayChildren: 0.2
    }
  }
});

export const createFadeAnimation = (duration: number = 0.6, delay: number = 0) => ({
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration,
      delay,
      ease: "easeOut"
    } 
  }
});

// === Hero Banner Specific ===

export const heroTextAnimation: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8,
      ease: "easeOut",
      delay: 0.3
    } 
  }
};

// === Scroll-triggered Animations (for GSAP ScrollTrigger) ===

export const scrollFadeIn = {
  trigger: ".scroll-trigger",
  start: "top 80%",
  end: "bottom 20%",
  animation: {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power2.out"
  }
};

export const scrollSlideIn = {
  trigger: ".scroll-trigger",
  start: "top 75%",
  animation: {
    x: -100,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out"
  }
};
