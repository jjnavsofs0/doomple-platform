"use client";

import { format } from "date-fns";
import { FileText, MessageSquare, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { LeadActivity } from "@prisma/client";

interface ActivityTimelineProps {
  activities: (LeadActivity & {
    user?: { name: string } | null;
  })[];
  isLoading?: boolean;
}

const activityIconMap: Record<string, React.ReactNode> = {
  note: <MessageSquare className="h-4 w-4" />,
  status_change: <CheckCircle2 className="h-4 w-4" />,
  assignment: <AlertCircle className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  default: <Clock className="h-4 w-4" />,
};

const activityColorMap: Record<string, string> = {
  note: "bg-blue-100 text-blue-700",
  status_change: "bg-green-100 text-green-700",
  assignment: "bg-purple-100 text-purple-700",
  document: "bg-orange-100 text-orange-700",
  default: "bg-gray-100 text-gray-700",
};

function getActivityIcon(type: string) {
  return activityIconMap[type.toLowerCase()] || activityIconMap.default;
}

function getActivityColor(type: string) {
  return activityColorMap[type.toLowerCase()] || activityColorMap.default;
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-4">
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${getActivityColor(
                activity.type
              )}`}
            >
              {getActivityIcon(activity.type)}
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 h-12 bg-border mt-2"></div>
            )}
          </div>

          {/* Activity content */}
          <div className="flex-1 pt-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h4 className="font-medium capitalize">
                  {activity.type.replace(/_/g, " ")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(activity.createdAt), "MMM d, yyyy h:mm a")}
              </div>
            </div>
            {activity.user && (
              <p className="text-xs text-muted-foreground mt-2">
                by {activity.user.name}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
