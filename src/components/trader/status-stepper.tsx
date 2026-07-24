import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { QueueStatus } from "@/types/trader";

const steps: { key: QueueStatus; label: string }[] = [
  { key: "waiting", label: "Waiting" },
  { key: "almost_ready", label: "Almost Ready" },
  { key: "serving", label: "Being Served" },
];

interface StatusStepperProps {
  status: QueueStatus;
}

function stepIndex(status: QueueStatus): number {
  return steps.findIndex((step) => step.key === status);
}

export function StatusStepper({ status }: StatusStepperProps) {
  const currentIndex = stepIndex(status);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Status
      </h2>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.key} className="flex flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  isComplete && "border-foreground bg-foreground text-background",
                  isCurrent && "border-brand bg-background text-brand",
                  isUpcoming && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-brand underline underline-offset-4",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden h-px flex-1 bg-border md:block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
