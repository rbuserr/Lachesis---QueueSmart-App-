import Link from "next/link";
import { Info, ListOrdered } from "lucide-react";

import { QueuePositionHero } from "@/components/trader/queue-position-hero";
import { StatusStepper } from "@/components/trader/status-stepper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getActiveQueue } from "@/lib/trader/get-active-queue";
import { getServiceById } from "@/lib/trader/get-services";

const alertIconClassName =
  "flex items-center gap-3 [&>svg]:static [&>svg]:shrink-0 [&>svg+div]:translate-y-0 [&>svg~*]:pl-0";

export default async function QueueStatus() {
  const activeQueue = await getActiveQueue();

  if (!activeQueue) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Queue Status</h1>
          <p className="text-muted-foreground">
            Live view of your position in line
          </p>
        </div>

        <ListOrdered className="h-12 w-12 text-muted-foreground" />

        <div className="max-w-md space-y-2">
          <p className="text-lg font-medium">You&apos;re not in a queue.</p>
          <p className="text-sm text-muted-foreground">
            Join a service to get support from a risk manager.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/queue/join">Join a Queue</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const service = await getServiceById(activeQueue.serviceId);

  if (!service) {
    return (
      <p className="text-sm text-muted-foreground">
        Unable to load queue details for this service.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Queue Status</h1>
        <p className="text-muted-foreground">
          Live view of your position in line
        </p>
      </div>

      {activeQueue.status === "almost_ready" && (
        <Alert className={alertIconClassName}>
          <Info className="h-4 w-4" />
          <AlertDescription>
            A risk manager will review your account shortly.
          </AlertDescription>
        </Alert>
      )}

      <QueuePositionHero activeQueue={activeQueue} service={service} />

      <StatusStepper status={activeQueue.status} />

      <Alert className={alertIconClassName}>
        <Info className="h-4 w-4" />
        <AlertDescription>
          High-priority tickets may move ahead of you. Your position updates
          automatically.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button disabled title="Leave queue will be available in A3">
          Leave Queue
        </Button>
      </div>
    </div>
  );
}
