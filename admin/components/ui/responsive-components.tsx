import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveForm({ children, className }: ResponsiveFormProps) {
  return (
    <div className={cn(
      "space-y-4 sm:space-y-6",
      "w-full max-w-none sm:max-w-lg md:max-w-2xl lg:max-w-4xl",
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveFormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function ResponsiveFormGrid({ 
  children, 
  columns = 2, 
  className 
}: ResponsiveFormGridProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
  }[columns];

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      gridClass,
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveFormFieldProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function ResponsiveFormField({ 
  children, 
  label, 
  required, 
  error, 
  className 
}: ResponsiveFormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="w-full">{children}</div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface ResponsiveCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function ResponsiveCard({ 
  children, 
  title, 
  description, 
  className 
}: ResponsiveCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 shadow-sm",
      "p-4 sm:p-6",
      className
    )}>
      {(title || description) && (
        <div className="mb-4 sm:mb-6">
          {title && (
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Mobile-optimized button group
interface ResponsiveButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ResponsiveButtonGroup({ 
  children, 
  className,
  orientation = 'horizontal'
}: ResponsiveButtonGroupProps) {
  const orientationClass = orientation === 'vertical' 
    ? "flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2"
    : "flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2";

  return (
    <div className={cn(orientationClass, className)}>
      {children}
    </div>
  );
}
