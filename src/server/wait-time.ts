import "server-only";

import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type {
  ActiveQueue,
  QueueEntry,
  QueueStats,
  ServiceQueuePreview,
} from "@/types/domain";

// SMART FEATURE: Dynamic Wait Time Estimator
// Calculates service durations using a moving average of recent historical completion times 
// rather than relying on static expected durations.
async function getSmartServiceDurations(): Promise<Map<number, number>> {
  const services = await prisma.service.findMany({
    select: { id: true, expectedDurationMinutes: true },
  });

  const durationMap = new Map<number, number>();

  for (const service of services) {
    // Fetch the last 20 successfully served entries to calculate a recent moving average
    const recentHistory = await prisma.queueHistory.findMany({
      where: {
        serviceId: service.id,
        outcome: "served",
        completedAt: { not: null },
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });

    if (recentHistory.length === 0) {
      // Fallback to static expected time if no historical data exists yet
      durationMap.set(service.id, service.expectedDurationMinutes);
      continue;
    }

    // Calculate the total wait time for these historical entries in milliseconds
    const totalMs = recentHistory.reduce((sum, record) => {
      // We can safely assert completedAt is not null due to our Prisma where clause
      const diff = record.completedAt!.getTime() - record.joinedAt.getTime();
      return sum + diff;
    }, 0);

    // Convert to minutes and round. Enforce a minimum of 1 minute.
    const avgMinutes = Math.round(totalMs / recentHistory.length / (1000 * 60));
    durationMap.set(service.id, Math.max(1, avgMinutes));
  }

  return durationMap;
}

export async function estimateWaitForQueuePosition(targetPosition: number): Promise<number> {
  const durations = await getSmartServiceDurations();

  const serving = await prisma.queueEntry.findFirst({
    where: { status: "serving" },
  });

  let totalMinutes = serving ? (durations.get(serving.serviceId) || 0) : 0;

  const entriesAhead = await prisma.queueEntry.findMany({
    where: { status: "waiting", position: { lt: targetPosition } },
  });

  for (const entry of entriesAhead) {
    totalMinutes += durations.get(entry.serviceId) || 0;
  }

  return totalMinutes;
}

export async function buildActiveQueue(traderName: string): Promise<ActiveQueue | null> {
  const normalizedName = traderName.trim().toLowerCase();

  const serving = await prisma.queueEntry.findFirst({
    where: { status: "serving" },
  });

  if (serving && serving.traderName.toLowerCase() === normalizedName) {
    return {
      id: serving.id,
      serviceId: serving.serviceId,
      position: 1,
      peopleAhead: 0,
      estimatedWaitMinutes: 0,
      status: "serving",
      joinedAt: serving.joinedAt as any,
    } as any;
  }

  const entry = await prisma.queueEntry.findFirst({
    where: {
      traderName: { equals: normalizedName, mode: "insensitive" },
      status: "waiting",
    },
  });

  if (!entry) return null;

  const peopleAhead = entry.position + (serving ? 1 : 0);
  const estimatedWaitMinutes = await estimateWaitForQueuePosition(entry.position);

  return {
    id: entry.id,
    serviceId: entry.serviceId,
    position: peopleAhead + 1,
    peopleAhead,
    estimatedWaitMinutes,
    status: peopleAhead <= 1 ? "almost_ready" : "waiting",
    joinedAt: entry.joinedAt as any,
  } as any;
}

export async function getQueueStats(): Promise<QueueStats> {
  const waitingEntries = await prisma.queueEntry.findMany({
    where: { status: "waiting" },
    orderBy: { position: "asc" },
  });

  const durations = await getSmartServiceDurations();
  const serving = await prisma.queueEntry.findFirst({
    where: { status: "serving" },
  });

  let currentWait = serving ? (durations.get(serving.serviceId) || 0) : 0;
  let totalWaitSum = 0;
  let highPriorityCount = 0;

  for (const entry of waitingEntries) {
    totalWaitSum += currentWait;
    currentWait += durations.get(entry.serviceId) || 0;
    if (entry.priority === "high") highPriorityCount++;
  }

  return {
    waiting: waitingEntries.length,
    highPriority: highPriorityCount,
    averageEstimatedWaitMinutes:
      waitingEntries.length === 0
        ? 0
        : Math.round(totalWaitSum / waitingEntries.length),
  };
}

export async function getServiceQueuePreview(serviceId: number): Promise<ServiceQueuePreview> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  
  if (!service) {
    throw new AppError("Service not found.", 404);
  }

  const serving = await prisma.queueEntry.findFirst({
    where: { status: "serving" },
  });

  const waitingEntries = await prisma.queueEntry.findMany({
    where: { status: "waiting" },
  });

  const durations = await getSmartServiceDurations();

  let estimatedWaitMinutes = serving ? (durations.get(serving.serviceId) || 0) : 0;
  for (const entry of waitingEntries) {
    estimatedWaitMinutes += durations.get(entry.serviceId) || 0;
  }

  return {
    service: {
      id: service.id,
      name: service.name,
      description: service.description,
      expectedDurationMinutes: service.expectedDurationMinutes,
      priority: service.priority,
      isOpen: service.isOpen
    } as any,
    waitingCount: waitingEntries.length + (serving ? 1 : 0),
    estimatedWaitMinutes,
  } as any;
}

// Fixed type constraint here to accept Prisma objects
export function cloneQueueEntry(entry: any): any {
  return { ...entry };
}