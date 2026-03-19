"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  percentage: number
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "destructive"
}

const variantClasses = {
  default: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  destructive: "bg-red-500",
}

const sizeClasses = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      percentage,
      showLabel = true,
      size = "md",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const percentage_clamped = Math.min(Math.max(percentage, 0), 100)

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className="flex items-center gap-2">
          <div className={cn("flex-1 rounded-full bg-muted overflow-hidden", sizeClasses[size])}>
            <div
              className={cn(
                "h-full transition-all duration-300",
                variantClasses[variant]
              )}
              style={{ width: `${percentage_clamped}%` }}
            />
          </div>
          {showLabel && (
            <span className="text-sm font-medium text-muted-foreground w-12 text-right">
              {Math.round(percentage_clamped)}%
            </span>
          )}
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
