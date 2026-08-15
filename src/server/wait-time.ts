import "server-only";

import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type {
  ActiveQueue,
  QueueStats,
  ServiceQueuePreview,
} from "@/types/domain";

/** How many recent served history rows feed the moving average. */
export const WAIT_HISTORY_SAMPLE_SIZE = 20;

export type WaitEstimateSource = "historical" | "baseline";

export interface ServiceDurationEstimate {
  minutes: number;
  source: WaitEstimateSource;
  sampleSize: number;
}

/**
 * SMART FEATURE: Dynamic wait-time estimator
 *
 * For each service, prefers a moving average of the last N successfully served
 * QueueHistory durations (completedAt − joinedAt). Falls back to the service's
 * configured expectedDurationMinutes when no history exists yet.
 */
export async function getSmartServiceDurations(): Promise<
  Map<number, ServiceDurationEstimate>
> {
  const services = await prisma.service.findMany({
    select: { id: true, expectedDurationMinutes: true },
  });

  const history = await prisma.queueHistory.findMany({
    where: {
      outcome: "served",
      completedAt: { not: null },
      serviceId: { in: services.map((service) => service.id) },
    },
    orderBy: { completedAt: "desc" },
    select: {
      serviceId: true,
      joinedAt: true,
      completedAt: true,
    },
  });

  const samplesByService = new Map<
    number,
    Array<{ joinedAt: Date; completedAt: Date }>
  >();

  for (const record of history) {
    if (!record.completedAt) continue;
    const bucket = samplesByService.get(record.serviceId) ?? [];
    if (bucket.length >= WAIT_HISTORY_SAMPLE_SIZE) continue;
    bucket.push({
      joinedAt: record.joinedAt,
      completedAt: record.completedAt,
    });
    samplesByService.set(record.serviceId, bucket);
  }

  const durationMap = new Map<number, ServiceDurationEstimate>();

  for (const service of services) {
    const samples = samplesByService.get(service.id) ?? [];

    if (samples.length === 0) {
      durationMap.set(service.id, {
        minutes: service.expectedDurationMinutes,
        source: "baseline",
        sampleSize: 0,
      });
      continue;
    }

    const totalMs = samples.reduce((sum, record) => {
      return sum + (record.completedAt.getTime() - record.joinedAt.getTime());
    }, 0);

    const avgMinutes = Math.round(totalMs / samples.length / (1000 * 60));
    durationMap.set(service.id, {
      minutes: Math.max(1, avgMinutes),
      source: "historical",
      sampleSize: samples.length,
    });
  }

  return durationMap;
}

function minutesFor(
  durations: Map<number, ServiceDurationEstimate>,
  serviceId: number,
): number {
  return durations.get(serviceId)?.minutes ?? 0;
}

export async function estimateWaitForQueuePosition(
  targetPosition: number,
): Promise<number> {
  const durations = await getSmartServiceDurations();

  const serving = await prisma.queueEntry.findFirst({
    where: { status: "serving" },
  });

  let totalMinutes = serving ? minutesFor(durations, serving.serviceId) : 0;

  const entriesAhead = await prisma.queueEntry.findMany({
    where: { status: "waiting", position: { lt: targetPosition } },
  });

  for (const entry of entriesAhead) {
    totalMinutes += minutesFor(durations, entry.serviceId);
  }

  return totalMinutes;
}

export async function buildActiveQueue(
  traderName: string,
): Promise<ActiveQueue | null> {
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
      joinedAt: serving.joinedAt.toISOString(),
    };
  }

  const entry = await prisma.queueEntry.findFirst({
    where: {
      traderName: { equals: normalizedName, mode: "insensitive" },
      status: "waiting",
    },
  });

  if (!entry) return null;

  const peopleAhead = entry.position + (serving ? 1 : 0);
  const estimatedWaitMinutes = await estimateWaitForQueuePosition(
    entry.position,
  );

  return {
    id: entry.id,
    serviceId: entry.serviceId,
    position: peopleAhead + 1,
    peopleAhead,
    estimatedWaitMinutes,
    status: peopleAhead <= 1 ? "almost_ready" : "waiting",
    joinedAt: entry.joinedAt.toISOString(),
  };
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

  let currentWait = serving ? minutesFor(durations, serving.serviceId) : 0;
  let totalWaitSum = 0;
  let highPriorityCount = 0;

  for (const entry of waitingEntries) {
    totalWaitSum += currentWait;
    currentWait += minutesFor(durations, entry.serviceId);
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

export async function getServiceQueuePreview(
  serviceId: number,
): Promise<ServiceQueuePreview> {
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
  const thisService = durations.get(service.id) ?? {
    minutes: service.expectedDurationMinutes,
    source: "baseline" as const,
    sampleSize: 0,
  };

  let estimatedWaitMinutes = serving
    ? minutesFor(durations, serving.serviceId)
    : 0;
  for (const entry of waitingEntries) {
    estimatedWaitMinutes += minutesFor(durations, entry.serviceId);
  }

  return {
    service: {
      id: service.id,
      name: service.name,
      description: service.description,
      expectedDurationMinutes: service.expectedDurationMinutes,
      priority: service.priority,
      isOpen: service.isOpen,
    },
    waitingCount: waitingEntries.length + (serving ? 1 : 0),
    estimatedWaitMinutes,
    typicalServiceMinutes: thisService.minutes,
    waitEstimateSource: thisService.source,
    historySampleSize: thisService.sampleSize,
  };
}

export function cloneQueueEntry(entry: {
  id: number;
  traderName: string;
  serviceId: number;
  priority: string;
  joinedAt: Date | string;
  status?: string;
}): {
  id: number;
  traderName: string;
  serviceId: number;
  priority: string;
  joinedAt: string;
  status?: string;
} {
  return {
    id: entry.id,
    traderName: entry.traderName,
    serviceId: entry.serviceId,
    priority: entry.priority,
    joinedAt:
      entry.joinedAt instanceof Date
        ? entry.joinedAt.toISOString()
        : entry.joinedAt,
    ...(entry.status ? { status: entry.status } : {}),
  };
}
