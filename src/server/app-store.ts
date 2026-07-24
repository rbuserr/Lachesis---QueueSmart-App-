import "server-only";

import type { QueueEntry, Service } from "@/types/domain";

export interface AppStore {
  services: Service[];
  queue: QueueEntry[];
  currentlyServing: QueueEntry | null;
  queueOpen: boolean;
  nextServiceId: number;
  nextQueueEntryId: number;
}

function createInitialStore(): AppStore {
  return {
    services: [
      {
        id: 1,
        name: "General Account Inquiry",
        description: "General questions regarding trader accounts.",
        expectedDurationMinutes: 10,
        priority: "low",
        isOpen: true,
      },
      {
        id: 2,
        name: "Evaluation Phase Verification",
        description: "Review and verify evaluation phase progress.",
        expectedDurationMinutes: 25,
        priority: "medium",
        isOpen: true,
      },
      {
        id: 3,
        name: "Live Trade / Platform Execution Issue",
        description: "Urgent support for live trading platform issues.",
        expectedDurationMinutes: 5,
        priority: "high",
        isOpen: true,
      },
    ],
    queue: [],
    currentlyServing: null,
    queueOpen: true,
    nextServiceId: 4,
    nextQueueEntryId: 1,
  };
}

const globalStore = globalThis as typeof globalThis & {
  queueSmartStore?: AppStore;
};

// One store per Node.js process. Replace this module when persistent storage is added.
export const appStore = globalStore.queueSmartStore ?? createInitialStore();
globalStore.queueSmartStore = appStore;
