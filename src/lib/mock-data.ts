import type {
  ActiveQueue,
  Notification,
  QueueHistoryEntry,
  Service,
} from "@/types/trader";

/** Flip these flags to demo different UI states without code changes. */
export const MOCK_SCENARIO = {
  inQueue: false,
  hasNotifications: false,
};

export const MOCK_TRADER_NAME = "John D.";

export const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    name: "General Account Inquiry",
    durationMinutes: 10,
    priority: "low",
  },
  {
    id: 2,
    name: "Evaluation Phase Verification",
    durationMinutes: 25,
    priority: "medium",
  },
  {
    id: 3,
    name: "Live Trade/Platform Execution Issue",
    durationMinutes: 5,
    priority: "high",
  },
];

export const MOCK_ACTIVE_QUEUE: ActiveQueue = {
  id: "ticket-1042",
  serviceId: 2,
  position: 3,
  peopleAhead: 2,
  estimatedWaitMinutes: 18,
  status: "waiting",
  joinedAt: "2026-06-28T09:42:00.000Z",
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
