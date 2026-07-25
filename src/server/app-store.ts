import "server-only";

import type { QueueEntry, Service, User } from "@/types/domain";

export interface AppStore {
  services: Service[];
  queue: QueueEntry[];
  users: User[]; // Eduardo's user management
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

    //Eduardo's default admin user for testing purposes. In a real application, this should be handled securely and not hardcoded.
    users: [
      {
        id: "user-1",
        name: "QueueSmart Administrator",
        email: "admin@queuesmart.com",
        password: "Admin123",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
    ],
    currentlyServing: null,
    queueOpen: true,
    nextServiceId: 4,
    nextQueueEntryId: 1,
  };
}

const globalStore = globalThis as typeof globalThis & {
  queueSmartStore?: AppStore;
};

export const appStore =
  globalStore.queueSmartStore ?? createInitialStore();

globalStore.queueSmartStore = appStore;