"use client";

import * as React from "react";

/**
 * A wrapper around native HTML button that prevents hydration mismatches
 * caused by browser extensions that inject attributes like fdprocessedid
 */

interface SafeHtmlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const SafeHtmlButton = React.forwardRef<HTMLButtonElement, SafeHtmlButtonProps>(
  ({ children, ...props }, ref) => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      // During SSR and before hydration, render with suppressHydrationWarning
      return (
        <button 
          ref={ref} 
          suppressHydrationWarning 
          {...props}
        >
          {children}
        </button>
      );
    }

    // After hydration, render normally
    return (
      <button ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

SafeHtmlButton.displayName = "SafeHtmlButton";

export { SafeHtmlButton };
