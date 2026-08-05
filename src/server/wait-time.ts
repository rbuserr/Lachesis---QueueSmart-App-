import "server-only";

import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type {
  ActiveQueue,
  QueueEntry,
  QueueStats,
  ServiceQueuePreview,
} from "@/types/domain";

// Helper to map service durations efficiently (prevents N+1 DB queries)
async function getServiceDurations(): Promise<Map<number, number>> {
  const services = await prisma.service.findMany({
    select: { id: true, expectedDurationMinutes: true },
  });
  return new Map(services.map((s) => [s.id, s.expectedDurationMinutes]));
}

export async function estimateWaitForQueuePosition(targetPosition: number): Promise<number> {
  const durations = await getServiceDurations();
  
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
  
  const durations = await getServiceDurations();
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
  
  const durations = await getServiceDurations();
  
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