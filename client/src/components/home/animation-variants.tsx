/**
 * Animation variants for Framer Motion
 * All animations start in a visible state to avoid invisible content issues
 */

// FadeInUp animation that starts visible
export const fadeInUp = {
  hidden: { opacity: 1, y: 0 }, // Start visible instead of hidden
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Stagger container animation that starts visible
export const staggerContainer = {
  hidden: { opacity: 1 }, // Start visible instead of hidden
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Fade animation that is always visible
export const alwaysVisible = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 }
};

// Scale animation that starts visible
export const scaleUp = {
  hidden: { opacity: 1, scale: 1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// Slide animation that starts visible
export const slideIn = {
  hidden: { opacity: 1, x: 0 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};
