import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTime } from "@/lib/trader/format";
import { priorityLabel, priorityVariant } from "@/lib/trader/priority";
import type { ActiveQueue, Service } from "@/types/trader";

interface QueueOverviewCardProps {
  activeQueue: ActiveQueue | null;
  service?: Service;
}

function statusLabel(status: ActiveQueue["status"]): string {
  switch (status) {
    case "waiting":
      return "WAITING";
    case "almost_ready":
      return "ALMOST READY";
    case "served":
      return "SERVED";
  }
}

export function QueueOverviewCard({
  activeQueue,
  service,
}: QueueOverviewCardProps) {
  if (!activeQueue || !service) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wide text-muted-foreground">
            Current Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">You are not currently in a queue.</p>
          <CardDescription>
            Select a service below or join a queue directly.
          </CardDescription>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/queue/join">Join a Queue</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <CardTitle className="text-base uppercase tracking-wide text-muted-foreground">
          Current Queue Status
        </CardTitle>
        <Badge variant="secondary">{statusLabel(activeQueue.status)}</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-medium">{service.name}</p>
          <Badge variant={priorityVariant(service.priority)}>
            {priorityLabel(service.priority)}
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Position
            </p>
            <p className="text-2xl font-semibold">#{activeQueue.position}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Est. wait
            </p>
            <p className="text-2xl font-semibold">
              ~{activeQueue.estimatedWaitMinutes} min
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Joined at
            </p>
            <p className="text-2xl font-semibold">
              {formatTime(activeQueue.joinedAt)}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href="/queue/status">View Live Status</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
