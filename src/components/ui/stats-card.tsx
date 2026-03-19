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

// Brand-aligned icon container colors
const variantStyles: Record<string, { bg: string; color: string }> = {
  default: { bg: "rgba(26,191,173,0.12)",  color: "#1ABFAD" },   // teal
  success: { bg: "rgba(59,178,246,0.12)",  color: "#3BB2F6" },   // blue-accent
  warning: { bg: "rgba(245,158,11,0.12)",  color: "#F59E0B" },   // amber
  danger:  { bg: "rgba(239,68,68,0.12)",   color: "#EF4444" },   // red
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
  ) => {
    const vs = variantStyles[variant] ?? variantStyles.default;

    return (
      <Card
        ref={ref}
        className={cn("transition-shadow hover:shadow-md", className)}
        style={{ border: "1px solid #E5E7EB" }}
        {...props}
      >
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6B7280" }}>
                {label}
              </p>
              <p
                className={cn(
                  "mt-1.5 font-bold leading-tight",
                  valueSize === "sm" && "text-xl",
                  valueSize === "md" && "text-2xl",
                  valueSize === "lg" && "text-4xl"
                )}
                style={{ color: "#042042" }}
              >
                {value}
              </p>
              {trend !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  {trend > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  ) : trend < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  ) : null}
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      trend > 0 && "text-green-600",
                      trend < 0 && "text-red-500",
                      trend === 0 && "text-gray-400"
                    )}
                  >
                    {Math.abs(trend)}%{trendLabel && ` ${trendLabel}`}
                  </span>
                </div>
              )}
            </div>
            {icon && (
              <div
                className="p-2.5 rounded-lg flex-shrink-0"
                style={{ backgroundColor: vs.bg, color: vs.color }}
              >
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
)
StatsCard.displayName = "StatsCard"

export { StatsCard }
