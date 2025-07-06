'use client';

/**
 * Utility to suppress hydration warnings for form elements
 * 
 * This is particularly helpful for elements that might get modified by browser extensions
 * that add attributes like 'fdprocessedid' which causes hydration mismatches.
 */

/**
 * HOC that adds suppressHydrationWarning to form elements
 * 
 * @param {React.ComponentType} Component - The component to wrap
 * @returns {React.ComponentType} - The wrapped component with suppressHydrationWarning
 */
export function withSuppressHydrationWarning(Component) {
  return function WrappedComponent(props) {
    return <Component {...props} suppressHydrationWarning />;
  };
}

/**
 * Props for elements that need hydration warning suppression
 * 
 * @returns {Object} - The props to spread on elements that need hydration warning suppression
 */
export function useHydrationSafeProps() {
  return {
    suppressHydrationWarning: true,
  };
}

/**
 * Button component that suppresses hydration warnings
 * 
 * @param {Object} props - Button props
 * @returns {JSX.Element} - Button element with suppressHydrationWarning
 */
export function HydrationSafeButton({ children, ...props }) {
  return (
    <button {...props} suppressHydrationWarning>
      {children}
    </button>
  );
}

/**
 * Input component that suppresses hydration warnings
 * 
 * @param {Object} props - Input props
 * @returns {JSX.Element} - Input element with suppressHydrationWarning
 */
export function HydrationSafeInput(props) {
  return <input {...props} suppressHydrationWarning />;
}
