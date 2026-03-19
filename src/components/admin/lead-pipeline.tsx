"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@prisma/client";

interface LeadPipelineProps {
  currentStatus: LeadStatus;
  className?: string;
}

const LEAD_STAGES: Array<{ status: LeadStatus; label: string; description: string }> = [
  { status: "NEW", label: "New", description: "Lead created" },
  { status: "CONTACTED", label: "Contacted", description: "Initial contact made" },
  { status: "QUALIFIED", label: "Qualified", description: "Lead qualified" },
  { status: "DISCOVERY_SCHEDULED", label: "Discovery", description: "Call scheduled" },
  { status: "PROPOSAL_SENT", label: "Proposal", description: "Proposal sent" },
  { status: "NEGOTIATION", label: "Negotiation", description: "In negotiation" },
  { status: "WON", label: "Won", description: "Deal closed" },
];

export function LeadPipeline({ currentStatus, className }: LeadPipelineProps) {
  const currentStageIndex = LEAD_STAGES.findIndex((stage) => stage.status === currentStatus);

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-border" />
        <div
          className="absolute top-6 left-0 h-1 bg-primary transition-all duration-300"
          style={{
            width: currentStageIndex >= 0
              ? `${(currentStageIndex / (LEAD_STAGES.length - 1)) * 100}%`
              : "0%"
          }}
        />

        {/* Stages */}
        <div className="relative flex justify-between">
          {LEAD_STAGES.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isUpcoming = index > currentStageIndex;

            return (
              <div key={stage.status} className="flex flex-col items-center gap-3">
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-300",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background ring-2 ring-primary ring-offset-2",
                    isUpcoming && "border-muted bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted || isCurrent ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center gap-1 min-w-[80px]">
                  <p className={cn(
                    "text-xs font-semibold text-center leading-tight",
                    (isCompleted || isCurrent) && "text-foreground",
                    isUpcoming && "text-muted-foreground"
                  )}>
                    {stage.label}
                  </p>
                  <p className={cn(
                    "text-xs text-center leading-tight",
                    isUpcoming && "text-muted-foreground"
                  )}>
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
