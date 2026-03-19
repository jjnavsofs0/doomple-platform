"use client"

import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"

export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  value: string | number
  label: string
  trend?: number
  trendLabel?: string
  variant?: "default" | "success" | "warning" | "danger"
  valueSize?: "sm" | "md" | "lg"
}

const variantClasses = {
  default: "bg-primary/10 text-primary",
  success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100",
  danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      className,
      icon,
      value,
      label,
      trend,
      trendLabel,
      variant = "default",
      valueSize = "md",
      ...props
    },
    ref
  ) => (
    <Card ref={ref} className={className} {...props}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p
              className={cn(
                "mt-2 font-bold text-foreground",
                valueSize === "sm" && "text-xl",
                valueSize === "md" && "text-3xl",
                valueSize === "lg" && "text-4xl"
              )}
            >
              {value}
            </p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : null}
                <span
                  className={cn(
                    "text-sm font-semibold",
                    trend > 0 && "text-green-600",
                    trend < 0 && "text-red-600",
                    trend === 0 && "text-muted-foreground"
                  )}
                >
                  {Math.abs(trend)}%
                  {trendLabel && ` ${trendLabel}`}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "p-3 rounded-lg",
                variantClasses[variant]
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
)
StatsCard.displayName = "StatsCard"

export { StatsCard }
