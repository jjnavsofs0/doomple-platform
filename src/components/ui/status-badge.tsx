"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge, type BadgeProps } from "./badge"

type StatusType = "active" | "inactive" | "pending" | "completed" | "cancelled" | "draft" | "published"

interface StatusColorMap {
  [key: string]: BadgeProps["variant"]
}

const statusColorMap: StatusColorMap = {
  active: "success",
  inactive: "outline",
  pending: "warning",
  completed: "success",
  cancelled: "destructive",
  draft: "outline",
  published: "default",
}

export interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string
  customColorMap?: Record<string, BadgeProps["variant"]>
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, customColorMap, className, ...props }, ref) => {
    const colorMap = customColorMap || statusColorMap
    const variant = colorMap[status.toLowerCase()] as BadgeProps["variant"] || "default"

    const displayLabel = status
      .split(/(?=[A-Z])/)
      .join(" ")
      .charAt(0)
      .toUpperCase() + status.slice(1)

    return (
      <Badge
        ref={ref}
        variant={variant}
        className={cn("capitalize", className)}
        {...props}
      >
        {displayLabel}
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }
