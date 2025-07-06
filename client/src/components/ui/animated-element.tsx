'use client';

import { ReactNode, forwardRef } from 'react';
import { motion, Variants, HTMLMotionProps } from 'framer-motion';
import { useAnimatedInView } from '@/hooks/useAnimatedInView';

type AnimatedElementProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  animation?: Variants;
  triggerOnce?: boolean;
  threshold?: number;
  as?: keyof JSX.IntrinsicElements;
} & Omit<HTMLMotionProps<'div'>, 'as'>;

/**
 * A wrapper component that animates its children when they come into view
 */
const AnimatedElement = forwardRef<HTMLElement, AnimatedElementProps>(({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  animation = {
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        ease: 'easeOut' 
      } 
    },
    hidden: { 
      opacity: 0, 
      y: 20, 
      transition: { 
        duration: 0.5,
        ease: 'easeIn' 
      } 
    },
  },
  triggerOnce = true,
  threshold = 0.1,
  as: Tag = 'div',
  ...props
}, ref) => {
  // Apply delay to the animation
  const animationWithDelay = {
    visible: {
      ...animation.visible,
      transition: {
        ...('transition' in animation.visible ? animation.visible.transition : {}),
        delay,
        duration,
        ease: 'easeInOut' as const
      },
    },
    hidden: {
      ...animation.hidden,
      transition: {
        ...('transition' in animation.hidden ? animation.hidden.transition : {}),
        duration,
        ease: 'easeInOut' as const
      }
    },
  };

  const { ref: inViewRef, controls } = useAnimatedInView({
    visible: animationWithDelay.visible,
    hidden: animationWithDelay.hidden,
    triggerOnce,
    threshold,
  });

  // Use a simpler ref handling approach
  const MotionComponent = motion[Tag as keyof typeof motion] || motion.div;
  const motionProps: any = {
    ref: inViewRef,
    initial: "hidden",
    animate: controls,
    className,
    ...props
  };

  return (
    <MotionComponent {...motionProps}>
      {children}
    </MotionComponent>
  );
});

AnimatedElement.displayName = 'AnimatedElement';

export { AnimatedElement };

/**
 * Specialized animated components for common elements
 */

export function AnimatedHeading({
  children,
  className = '',
  level = 2,
  ...props
}: AnimatedElementProps & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <AnimatedElement
      as={HeadingTag}
      className={className}
      {...props}
    >
      {children}
    </AnimatedElement>
  );
}

export function AnimatedImage({
  src,
  alt,
  className = '',
  width,
  height,
  ...props
}: AnimatedElementProps & { 
  src: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  return (
    <AnimatedElement
      as="div"
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
        width={width}
        height={height}
      />
    </AnimatedElement>
  );
}

export function AnimatedSection({
  children,
  className = '',
  ...props
}: AnimatedElementProps) {
  return (
    <AnimatedElement
      as="section"
      className={className}
      {...props}
    >
      {children}
    </AnimatedElement>
  );
}

export function AnimatedCard({
  children,
  className = '',
  ...props
}: AnimatedElementProps) {
  return (
    <AnimatedElement
      className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </AnimatedElement>
  );
}
