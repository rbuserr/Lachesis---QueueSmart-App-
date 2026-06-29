import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { priorityLabel, priorityVariant } from "@/lib/trader/priority";
import type { ActiveQueue, Service } from "@/types/trader";

interface ServicesListProps {
  services: Service[];
  activeQueue: ActiveQueue | null;
}

export function ServicesList({ services, activeQueue }: ServicesListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Available Services</CardTitle>
        {activeQueue && (
          <CardDescription>One active queue at a time.</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {services.map((service) => {
          const isActive = activeQueue?.serviceId === service.id;
          const isDisabled = Boolean(activeQueue && !isActive);

          return (
            <div
              key={service.id}
              className={
                isDisabled
                  ? "flex items-center justify-between rounded-lg border border-dashed p-4 opacity-60"
                  : "flex items-center justify-between rounded-lg border p-4"
              }
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{service.name}</p>
                  <Badge variant={priorityVariant(service.priority)}>
                    {priorityLabel(service.priority)}
                  </Badge>
                  {isActive && <Badge variant="outline">ACTIVE</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  ~{service.durationMinutes} min
                  {isDisabled ? " · in queue" : ""}
                </p>
              </div>
              {!isDisabled && (
                <Link
                  href={`/queue/join?service=${service.id}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Join queue for ${service.name}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
