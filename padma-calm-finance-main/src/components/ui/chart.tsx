// Simple Chart UI component - minimal implementation to avoid type conflicts

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple chart context
const ChartContext = React.createContext<{
  config: Record<string, any>
}>({
  config: {}
})

export const useChart = () => {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

// Chart container component
export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: Record<string, any>
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ children, config, className, ...props }, ref) => {
    return (
      <ChartContext.Provider value={{ config }}>
        <div ref={ref} className={cn("w-full h-full", className)} {...props}>
          {children}
        </div>
      </ChartContext.Provider>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

// Simple tooltip component
export interface ChartTooltipProps {
  children?: React.ReactNode
  className?: string
}

export const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={cn(
          "bg-background border border-border rounded-lg p-2 shadow-md",
          className
        )} 
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChartTooltip.displayName = "ChartTooltip"

// Chart tooltip content
export interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  className?: string
}

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, label, className, ...props }, ref) => {
    if (!active || !payload?.length) {
      return null
    }

    return (
      <div 
        ref={ref}
        className={cn("space-y-1", className)} 
        {...props}
      >
        {label && (
          <p className="text-sm font-medium">{label}</p>
        )}
        {payload.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">{item.value}</span>
          </div>
        ))}
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"