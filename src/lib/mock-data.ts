import type {
  Notification,
  QueueHistoryEntry,
} from "@/types/trader";

/** Flip these flags to demo different UI states without code changes. */
export const MOCK_SCENARIO = {
  hasNotifications: false,
};

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    message:
      "You're next in queue. A risk manager will review your dashboard shortly.",
    timestamp: "2026-06-28T10:14:00.000Z",
    read: false,
  },
  {
    id: "notif-2",
    message: "Ticket picked up. Evaluation verification started.",
    timestamp: "2026-06-28T10:02:00.000Z",
    read: true,
  },
  {
    id: "notif-3",
    message: "Queue position updated. You moved to position #3.",
    timestamp: "2026-06-28T09:15:00.000Z",
    read: true,
  },
];

export const MOCK_QUEUE_HISTORY: QueueHistoryEntry[] = [
  {
    id: "hist-1",
    serviceId: 1,
    joinedAt: "2026-06-20T14:30:00.000Z",
    completedAt: "2026-06-20T14:45:00.000Z",
    outcome: "served",
  },
  {
    id: "hist-2",
    serviceId: 3,
    joinedAt: "2026-06-15T09:10:00.000Z",
    completedAt: "2026-06-15T09:18:00.000Z",
    outcome: "served",
  },
];
