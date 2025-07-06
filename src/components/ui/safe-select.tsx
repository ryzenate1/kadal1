"use client";

import * as React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

/**
 * A wrapper around the Select component that prevents hydration mismatches
 * caused by browser extensions that inject attributes like fdprocessedid
 */

interface SafeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  children: React.ReactNode;
}

interface SafeSelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

// Safe SelectTrigger that suppresses hydration warnings for browser extension attributes
const SafeSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  SafeSelectTriggerProps
>(({ className, children, ...props }, ref) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // During SSR and before hydration, render without potential browser extension attributes
    return (
      <SelectTrigger 
        ref={ref} 
        className={className} 
        suppressHydrationWarning 
        {...props}
      >
        {children}
      </SelectTrigger>
    );
  }

  // After hydration, render normally
  return (
    <SelectTrigger ref={ref} className={className} {...props}>
      {children}
    </SelectTrigger>
  );
});

SafeSelectTrigger.displayName = "SafeSelectTrigger";

// Main SafeSelect component
const SafeSelect: React.FC<SafeSelectProps> & {
  Trigger: typeof SafeSelectTrigger;
  Content: typeof SelectContent;
  Item: typeof SelectItem;
  Value: typeof SelectValue;
} = ({ value, onValueChange, children, ...props }) => {
  return (
    <Select value={value} onValueChange={onValueChange} {...props}>
      {children}
    </Select>
  );
};

// Attach sub-components
SafeSelect.Trigger = SafeSelectTrigger;
SafeSelect.Content = SelectContent;
SafeSelect.Item = SelectItem;
SafeSelect.Value = SelectValue;

export { SafeSelect };
