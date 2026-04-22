"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type LocationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function LocationSheet({ open, onOpenChange, title, children, className }: LocationSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]",
            "data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-150"
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(680px,calc(100vw-1rem))] max-h-[calc(100vh-2rem)]",
            "-translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-100 bg-white shadow-2xl",
            "overflow-hidden",
            className
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>

          <DialogPrimitive.Close
            className={cn(
              "absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full",
              "text-gray-600 hover:bg-gray-100 focus:outline-none"
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>

          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default LocationSheet;

