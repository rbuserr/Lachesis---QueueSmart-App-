export type Priority = "low" | "medium" | "high";

export interface Service {
  id: number;
  name: string;
  description: string;
  expectedDurationMinutes: number;
  priority: Priority;
  isOpen: boolean;
}

export interface CreateServiceInput {
  name: string;
  description: string;
  expectedDurationMinutes: number;
  priority: Priority;
}

export type UpdateServiceInput = Partial<CreateServiceInput> & {
  isOpen?: boolean;
};

export interface QueueEntry {
  id: number;
  traderName: string;
  serviceId: number;
  priority: Priority;
  joinedAt: string;
}

export interface QueueStats {
  waiting: number;
  highPriority: number;
  averageEstimatedWaitMinutes: number;
}

export interface QueueSnapshot {
  entries: QueueEntry[];
  currentlyServing: QueueEntry | null;
  isOpen: boolean;
  stats: QueueStats;
}

export type QueueStatus = "waiting" | "almost_ready" | "serving";

export interface ActiveQueue {
  id: number;
  serviceId: number;
  position: number;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  status: QueueStatus;
  joinedAt: string;
}

export interface ServiceQueuePreview {
  service: Service;
  waitingCount: number;
  estimatedWaitMinutes: number;
}
