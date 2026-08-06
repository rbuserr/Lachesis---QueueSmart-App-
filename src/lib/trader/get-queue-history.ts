import "server-only";

import { readSessionUserServer } from "@/lib/auth/session.server";
import { prisma } from "@/server/db";
import type { QueueHistoryEntry } from "@/types/trader";

export async function getQueueHistory(): Promise<QueueHistoryEntry[]> {
  const user = await readSessionUserServer();

  if (!user) {
    return [];
  }

  const history = await prisma.queueHistory.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return history.map((record) => ({
    id: record.id,
    traderName: record.traderName,
    serviceId: record.serviceId,
    joinedAt: record.joinedAt.toISOString(),
    completedAt: record.completedAt?.toISOString() ?? null,
    outcome: record.outcome,
  }));
}