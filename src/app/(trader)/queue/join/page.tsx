import Link from "next/link";
import { Clock, Users } from "lucide-react";

import { JoinQueueButton } from "@/components/trader/join-queue-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServices } from "@/lib/trader/get-services";
import { getActiveQueue } from "@/lib/trader/get-active-queue";
import { getServiceQueuePreview } from "@/server/wait-time";

export const dynamic = "force-dynamic";

export default async function JoinQueueScreen() {
  const [services, activeQueue] = await Promise.all([
    getServices(),
    getActiveQueue(),
  ]);
  const previews = services.map((service) =>
    getServiceQueuePreview(service.id)
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Join a Queue</h1>
        <p className="text-muted-foreground">
          Select a support service to connect with a risk manager.
        </p>
      </div>

      {/* Warning if already in queue */}
      {activeQueue && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/50">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You are currently in a queue. Joining a new one will replace your
            current position.
          </p>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {previews.map(({ service, waitingCount, estimatedWaitMinutes }) => (
          <Card key={service.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-base">{service.name}</CardTitle>
                {service.priority === "high" && (
                  <Badge variant="secondary">High Priority</Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {service.description || "Get assistance from our specialists."}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="grid gap-2 text-sm text-muted-foreground mt-auto">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Est. wait: ~{estimatedWaitMinutes} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {waitingCount} {waitingCount === 1 ? "person" : "people"} ahead
                </span>
              </div>
            </CardContent>

            <CardFooter>
              <JoinQueueButton
                serviceId={service.id}
                serviceName={service.name}
                disabled={Boolean(activeQueue)}
              />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap gap-3 pt-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Cancel & Return</Link>
        </Button>
      </div>
    </div>
  );
}
