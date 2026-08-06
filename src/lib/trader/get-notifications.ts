import "server-only";

import { readSessionUserServer } from "@/lib/auth/session.server";
import { prisma } from "@/server/db";
import type { Notification } from "@/types/trader";

export async function getNotifications(): Promise<Notification[]> {
  const user = await readSessionUserServer();

  if (!user) {
    return [];
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  return notifications.map((notification) => ({
    id: notification.id,
    message: notification.message,
    timestamp: notification.timestamp.toISOString(),
    read: notification.status === "viewed",
  }));
}