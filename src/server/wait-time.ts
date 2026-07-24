import "server-only";

import { appStore } from "@/server/app-store";
import { AppError } from "@/server/errors";
import type {
  ActiveQueue,
  QueueEntry,
  QueueStats,
  ServiceQueuePreview,
} from "@/types/domain";

function serviceDuration(serviceId: number): number {
  const service = appStore.services.find((item) => item.id === serviceId);
  if (!service) {
    throw new AppError("Queue entry references an unknown service.", 500);
  }
  return service.expectedDurationMinutes;
}

function currentServiceMinutes(): number {
  return appStore.currentlyServing
    ? serviceDuration(appStore.currentlyServing.serviceId)
    : 0;
}

export function estimateWaitForQueueIndex(index: number): number {
  const entriesAhead = appStore.queue.slice(0, Math.max(index, 0));
  return (
    currentServiceMinutes() +
    entriesAhead.reduce(
      (total, entry) => total + serviceDuration(entry.serviceId),
      0
    )
  );
}

export function buildActiveQueue(
  traderName: string
): ActiveQueue | null {
  const normalizedName = traderName.trim().toLowerCase();
  const serving = appStore.currentlyServing;

  if (serving?.traderName.toLowerCase() === normalizedName) {
    return {
      id: serving.id,
      serviceId: serving.serviceId,
      position: 1,
      peopleAhead: 0,
      estimatedWaitMinutes: 0,
      status: "serving",
      joinedAt: serving.joinedAt,
    };
  }

  const index = appStore.queue.findIndex(
    (entry) => entry.traderName.toLowerCase() === normalizedName
  );
  if (index === -1) return null;

  const entry = appStore.queue[index];
  const peopleAhead = index + (serving ? 1 : 0);

  return {
    id: entry.id,
    serviceId: entry.serviceId,
    position: peopleAhead + 1,
    peopleAhead,
    estimatedWaitMinutes: estimateWaitForQueueIndex(index),
    status: peopleAhead <= 1 ? "almost_ready" : "waiting",
    joinedAt: entry.joinedAt,
  };
}

export function getQueueStats(): QueueStats {
  const estimates = appStore.queue.map((_, index) =>
    estimateWaitForQueueIndex(index)
  );

  return {
    waiting: appStore.queue.length,
    highPriority: appStore.queue.filter((entry) => entry.priority === "high")
      .length,
    averageEstimatedWaitMinutes:
      estimates.length === 0
        ? 0
        : Math.round(
            estimates.reduce((total, estimate) => total + estimate, 0) /
              estimates.length
          ),
  };
}

export function getServiceQueuePreview(
  serviceId: number
): ServiceQueuePreview {
  const service = appStore.services.find((item) => item.id === serviceId);
  if (!service) {
    throw new AppError("Service not found.", 404);
  }

  return {
    service: { ...service },
    waitingCount: appStore.queue.length + (appStore.currentlyServing ? 1 : 0),
    estimatedWaitMinutes:
      currentServiceMinutes() +
      appStore.queue.reduce(
        (total, entry) => total + serviceDuration(entry.serviceId),
        0
      ),
  };
}

export function cloneQueueEntry(entry: QueueEntry): QueueEntry {
  return { ...entry };
}
