import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/trader/format";
import { priorityLabel, priorityVariant } from "@/lib/trader/priority";
import type { ActiveQueue, Service } from "@/types/trader";

interface QueuePositionHeroProps {
  activeQueue: ActiveQueue;
  service: Service;
}

export function QueuePositionHero({
  activeQueue,
  service,
}: QueuePositionHeroProps) {
  return (
    <Card>
      <CardContent className="space-y-6 p-8 text-center">
        <div className="space-y-2">
          <p className="text-lg font-medium">{service.name}</p>
          <Badge variant={priorityVariant(service.priority)}>
            {priorityLabel(service.priority)}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-6xl font-semibold tracking-tight">
            #{activeQueue.position}
          </p>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            in queue
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-semibold">
            ~ {activeQueue.estimatedWaitMinutes} min
          </p>
          <p className="text-sm text-muted-foreground">estimated wait</p>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            {activeQueue.peopleAhead}{" "}
            {activeQueue.peopleAhead === 1 ? "person" : "people"} ahead of you
          </p>
          <p>Joined at {formatTime(activeQueue.joinedAt)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
