import "server-only";

import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import { cloneQueueEntry, getQueueStats } from "@/server/wait-time";
import type { Priority, QueueSnapshot } from "@/types/domain";

// Priority map for calculating DB insertion indexes
const priorityRank: Record<Priority | string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export async function getQueueSnapshot(): Promise<QueueSnapshot> {
  const entries = await prisma.queueEntry.findMany({
    where: { status: "waiting" },
    orderBy: { position: "asc" },
  });

  const currentlyServing = await prisma.queueEntry.findFirst({
    where: { status: "serving" },
  });

  const openQueue = await prisma.queue.findFirst({
    where: { status: "open" },
  });

  return {
    entries: entries.map((e) => cloneQueueEntry(e as any)) as any,
    currentlyServing: currentlyServing ? (cloneQueueEntry(currentlyServing as any) as any) : null,
    isOpen: !!openQueue,
    stats: await getQueueStats(),
  };
}

export async function joinQueue(input: {
  traderName: string;
  serviceId: number;
  userId?: string; 
}) {
  const traderName = input.traderName.trim();
  if (!traderName) throw new AppError("Trader name is required.");

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
    include: { queues: { where: { status: "open" } } },
  });

  if (!service) throw new AppError("Service not found.", 404);
  if (!service.isOpen) throw new AppError("This service is currently closed.", 409);

  const activeQueue = service.queues[0];
  if (!activeQueue) throw new AppError("Queue is currently closed.", 409);

  const normalizedName = traderName.toLowerCase();
  const alreadyQueued = await prisma.queueEntry.findFirst({
    where: {
      traderName: { equals: normalizedName, mode: "insensitive" },
      status: { in: ["waiting", "serving"] },
    },
  });

  if (alreadyQueued) throw new AppError("This trader is already in the queue.", 409);

  const entry = await prisma.$transaction(async (tx) => {
    const waitingEntries = await tx.queueEntry.findMany({
      where: { status: "waiting" },
      orderBy: { position: "asc" },
    });

    const entryPriorityRank = priorityRank[service.priority] ?? 2;
    let targetPosition = waitingEntries.length; 

    for (let i = 0; i < waitingEntries.length; i++) {
      if ((priorityRank[waitingEntries[i].priority] ?? 2) > entryPriorityRank) {
        targetPosition = i;
        break;
      }
    }

    if (targetPosition < waitingEntries.length) {
      await tx.queueEntry.updateMany({
        where: { status: "waiting", position: { gte: targetPosition } },
        data: { position: { increment: 1 } },
      });
    }

    const newEntry = await tx.queueEntry.create({
      data: {
        queueId: activeQueue.id,
        userId: input.userId,
        traderName,
        serviceId: service.id,
        priority: service.priority,
        position: targetPosition,
        status: "waiting",
      },
    });

    if (input.userId) {
      await tx.notification.create({
        data: {
          userId: input.userId,
          message: `You successfully joined the queue for ${service.name}.`,
          status: "sent",
        },
      });
    }

    return newEntry;
  });

  return cloneQueueEntry(entry as any) as any;
}

export async function leaveQueue(id: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const entry = await tx.queueEntry.findUnique({ where: { id } });
    if (!entry || entry.status !== "waiting") {
      throw new AppError("Queue entry not found or not waiting.", 404);
    }

    await tx.queueEntry.update({
      where: { id },
      data: { status: "canceled", position: -1 },
    });

    await tx.queueEntry.updateMany({
      where: { status: "waiting", position: { gt: entry.position } },
      data: { position: { decrement: 1 } },
    });

    await tx.queueHistory.create({
      data: {
        userId: entry.userId,
        traderName: entry.traderName,
        serviceId: entry.serviceId,
        joinedAt: entry.joinedAt,
        completedAt: new Date(),
        outcome: "cancelled",
      },
    });
  });
}

export async function serveNext() {
  return await prisma.$transaction(async (tx) => {
    const currentlyServing = await tx.queueEntry.findFirst({
      where: { status: "serving" },
    });
    
    if (currentlyServing) {
      throw new AppError("Finish the current trader before serving the next one.", 409);
    }

    const next = await tx.queueEntry.findFirst({
      where: { status: "waiting" },
      orderBy: { position: "asc" },
    });

    if (!next) return null;

    const updatedNext = await tx.queueEntry.update({
      where: { id: next.id },
      data: { status: "serving", position: -1 },
    });

    await tx.queueEntry.updateMany({
      where: { status: "waiting" },
      data: { position: { decrement: 1 } },
    });

    const upcoming = await tx.queueEntry.findMany({
      where: { status: "waiting", userId: { not: null }, position: { in: [0, 1] } },
      take: 2,
    });

    for (const user of upcoming) {
      if (user.userId) {
        await tx.notification.create({
          data: {
            userId: user.userId,
            message: `Get ready, ${user.traderName}! You are close to being served.`,
            status: "sent",
          },
        });
      }
    }

    return cloneQueueEntry(updatedNext as any) as any;
  });
}

export async function completeCurrentService() {
  return await prisma.$transaction(async (tx) => {
    const completed = await tx.queueEntry.findFirst({
      where: { status: "serving" },
    });
    
    if (!completed) return null;

    await tx.queueEntry.update({
      where: { id: completed.id },
      data: { status: "served" },
    });

    await tx.queueHistory.create({
      data: {
        userId: completed.userId,
        traderName: completed.traderName,
        serviceId: completed.serviceId,
        joinedAt: completed.joinedAt,
        completedAt: new Date(),
        outcome: "served",
      },
    });

    return cloneQueueEntry(completed as any) as any;
  });
}

export async function moveQueueEntry(id: number, direction: "up" | "down"): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const entry = await tx.queueEntry.findUnique({ where: { id } });
    if (!entry || entry.status !== "waiting") throw new AppError("Queue entry not found.", 404);

    const targetPosition = direction === "up" ? entry.position - 1 : entry.position + 1;
    if (targetPosition < 0) return;

    const swapTarget = await tx.queueEntry.findFirst({
      where: { status: "waiting", position: targetPosition },
    });

    if (!swapTarget) return;

    await tx.queueEntry.update({ where: { id: entry.id }, data: { position: targetPosition } });
    await tx.queueEntry.update({ where: { id: swapTarget.id }, data: { position: entry.position } });
  });
}

export async function setQueueOpen(isOpen: boolean): Promise<boolean> {
  const status = isOpen ? "open" : "closed";
  await prisma.queue.updateMany({
    data: { status },
  });
  return isOpen;
}