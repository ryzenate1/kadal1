import { useInView } from 'react-intersection-observer';
import { useAnimation, Variant } from 'framer-motion';
import { useEffect } from 'react';

interface AnimationConfig {
  visible: Variant;
  hidden: Variant;
  once?: boolean;
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
}

/**
 * Custom hook that combines react-intersection-observer with framer-motion
 * to create animations that trigger when elements come into view
 */
export const useAnimatedInView = ({
  visible,
  hidden,
  once = true,
  threshold = 0.1,
  triggerOnce = true,
  delay = 0
}: AnimationConfig) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce,
    threshold,
  });

  useEffect(() => {
    if (inView) {
      controls.start(visible);
    } else if (!once) {
      controls.start(hidden);
    }
  }, [controls, inView, visible, hidden, once, delay]);

  return { ref, controls, inView };
};

// Preset animations for common use cases
export const fadeInUp = {
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
  hidden: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.5 }
  }
};

export const fadeIn = {
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  },
  hidden: { 
    opacity: 0,
    transition: { duration: 0.5 }
  }
};

export const scaleIn = {
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  },
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.5 }
  }
};

export const slideInRight = {
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  hidden: { 
    opacity: 0, 
    x: -50,
    transition: { duration: 0.5, ease: 'easeIn' }
  }
};

export const slideInLeft = {
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  hidden: { 
    opacity: 0, 
    x: 50,
    transition: { duration: 0.5, ease: 'easeIn' }
  }
};
