"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * A wrapper around the Button component that prevents hydration mismatches
 * caused by browser extensions that inject attributes like fdprocessedid
 */

interface SafeButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const SafeButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  SafeButtonProps
>(({ children, ...props }, ref) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // During SSR and before hydration, render with suppressHydrationWarning
    return (
      <Button 
        ref={ref} 
        suppressHydrationWarning 
        {...props}
      >
        {children}
      </Button>
    );
  }

  // After hydration, render normally
  return (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  );
});

SafeButton.displayName = "SafeButton";

export { SafeButton };
