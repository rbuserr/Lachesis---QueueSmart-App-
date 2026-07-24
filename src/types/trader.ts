export type {
  ActiveQueue,
  Priority,
  QueueStatus,
  Service,
} from "@/types/domain";

export type QueueOutcome = "served" | "left" | "cancelled";

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
