import "server-only";

import { appStore } from "@/server/app-store";
import { AppError } from "@/server/errors";
import { cloneQueueEntry, getQueueStats } from "@/server/wait-time";
import type { Priority, QueueEntry, QueueSnapshot } from "@/types/domain";

const priorityRank: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export async function getQueueSnapshot(): Promise<QueueSnapshot> {
  return {
    entries: appStore.queue.map(cloneQueueEntry),
    currentlyServing: appStore.currentlyServing
      ? cloneQueueEntry(appStore.currentlyServing)
      : null,
    isOpen: appStore.queueOpen,
    stats: getQueueStats(),
  };
}

export async function joinQueue(input: {
  traderName: string;
  serviceId: number;
}): Promise<QueueEntry> {
  const traderName = input.traderName.trim();
  if (!traderName) {
    throw new AppError("Trader name is required.");
  }
  if (!appStore.queueOpen) {
    throw new AppError("Queue is currently closed.", 409);
  }

  const service = appStore.services.find((item) => item.id === input.serviceId);
  if (!service) {
    throw new AppError("Service not found.", 404);
  }
  if (!service.isOpen) {
    throw new AppError("This service is currently closed.", 409);
  }

  const normalizedName = traderName.toLowerCase();
  const alreadyQueued =
    appStore.queue.some(
      (entry) => entry.traderName.toLowerCase() === normalizedName
    ) ||
    appStore.currentlyServing?.traderName.toLowerCase() === normalizedName;
  if (alreadyQueued) {
    throw new AppError("This trader is already in the queue.", 409);
  }

  const entry: QueueEntry = {
    id: appStore.nextQueueEntryId++,
    traderName,
    serviceId: service.id,
    priority: service.priority,
    joinedAt: new Date().toISOString(),
  };

  // Priority groups are served high-to-low; arrival order is preserved in each group.
  const insertionIndex = appStore.queue.findIndex(
    (queued) => priorityRank[queued.priority] > priorityRank[entry.priority]
  );
  if (insertionIndex === -1) {
    appStore.queue.push(entry);
  } else {
    appStore.queue.splice(insertionIndex, 0, entry);
  }

  // TODO(notification-module): trigger the user-joined notification here.
  return cloneQueueEntry(entry);
}

export async function leaveQueue(id: number): Promise<void> {
  const index = appStore.queue.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new AppError("Queue entry not found.", 404);
  }

  appStore.queue.splice(index, 1);
  // TODO(history-module): record a "left" outcome here.
}

export async function serveNext(): Promise<QueueEntry | null> {
  if (appStore.currentlyServing) {
    throw new AppError(
      "Finish the current trader before serving the next one.",
      409
    );
  }

  const next = appStore.queue.shift() ?? null;
  appStore.currentlyServing = next;
  // TODO(notification-module): notify the next waiting trader when they are close.
  return next ? cloneQueueEntry(next) : null;
}

export async function completeCurrentService(): Promise<QueueEntry | null> {
  const completed = appStore.currentlyServing;
  appStore.currentlyServing = null;

  // TODO(history-module): record a "served" outcome here.
  return completed ? cloneQueueEntry(completed) : null;
}

export async function moveQueueEntry(
  id: number,
  direction: "up" | "down"
): Promise<void> {
  const index = appStore.queue.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new AppError("Queue entry not found.", 404);
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= appStore.queue.length) return;

  [appStore.queue[index], appStore.queue[targetIndex]] = [
    appStore.queue[targetIndex],
    appStore.queue[index],
  ];
}

export async function setQueueOpen(isOpen: boolean): Promise<boolean> {
  appStore.queueOpen = isOpen;
  return appStore.queueOpen;
}
