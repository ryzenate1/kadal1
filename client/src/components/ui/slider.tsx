"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
  className?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: number[]
  value?: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, defaultValue, value, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(defaultValue || value || [min])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(e.target.value)]
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }
    
    // Update internal value when controlled value changes
    React.useEffect(() => {
      if (value) {
        setInternalValue(value)
      }
    }, [value])
    
    const percentage = ((internalValue[0] - min) / (max - min)) * 100
    
    return (
      <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
        <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <div 
            className="absolute h-full bg-primary" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={internalValue[0]}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          {...props}
        />
        <div 
          className="absolute block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          style={{ left: `calc(${percentage}% - 0.5rem)` }}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
