import { useRef, useState, useEffect } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

/**
 * Custom hook for detecting when an element enters the viewport
 * @param options IntersectionObserver options
 * @returns [ref, isIntersecting] - Ref to attach to the element and boolean indicating if it's in view
 */
export const useIntersectionObserver = (options: IntersectionObserverOptions = {}) => {
  const { 
    root = null, 
    rootMargin = '0px', 
    threshold = 0, 
    triggerOnce = false 
  } = options;
  
  const ref = useRef<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state when observer callback fires
        setIsIntersecting(entry.isIntersecting);
        
        // Unobserve the element if triggerOnce is true and it's intersecting
        if (entry.isIntersecting && triggerOnce && ref.current) {
          observer.unobserve(ref.current);
        }
      },
      { root, rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [root, rootMargin, threshold, triggerOnce]);

  return [ref, isIntersecting] as const;
};

export default useIntersectionObserver;
