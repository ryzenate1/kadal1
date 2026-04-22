"use client";

import * as React from "react";

/**
 * A wrapper around native HTML input that prevents hydration mismatches
 * caused by browser extensions that inject attributes like fdprocessedid
 */

type SafeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const SafeInput = React.forwardRef<HTMLInputElement, SafeInputProps>(
  ({ ...props }, ref) => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      // During SSR and before hydration, render with suppressHydrationWarning
      return (
        <input 
          ref={ref} 
          suppressHydrationWarning 
          {...props}
        />
      );
    }

    // After hydration, render normally
    return (
      <input ref={ref} {...props} />
    );
  }
);

SafeInput.displayName = "SafeInput";

export { SafeInput };
