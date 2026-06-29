export type Priority = "low" | "medium" | "high";

export type QueueStatus = "waiting" | "almost_ready" | "served";

export type QueueOutcome = "served" | "left" | "cancelled";

export interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  priority: Priority;
}

export interface ActiveQueue {
  id: string;
  serviceId: number;
  position: number;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  status: QueueStatus;
  joinedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface QueueHistoryEntry {
  id: string;
  serviceId: number;
  joinedAt: string;
  completedAt: string | null;
  outcome: QueueOutcome;
}
