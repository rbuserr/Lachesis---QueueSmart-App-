import "server-only";

import type { QueueEntry, Service, User } from "@/types/domain";
import type { QueueHistoryEntry } from "@/types/trader"; // Moved to the top

export interface AppStore {
  services: Service[];
  queue: QueueEntry[];
  users: User[]; // Eduardo's user management
  currentlyServing: QueueEntry | null;
  queueOpen: boolean;
  nextServiceId: number;
  nextQueueEntryId: number;
  history: QueueHistoryEntry[]; // 1. Added history to the shared interface
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
    history: [], // 2. Initialized the empty history array
  };
}

const globalStore = globalThis as typeof globalThis & {
  queueSmartStore?: AppStore;
};

export const appStore =
  globalStore.queueSmartStore ?? createInitialStore();

globalStore.queueSmartStore = appStore;

// --------------------------------------------------------
// HISTORY MODULE (Section 2 - David)
// In-memory data store for queue participation history
// --------------------------------------------------------

export function getHistoryStore(): QueueHistoryEntry[] {
  // 3. Pointing to the global appStore to prevent hot-reload data loss
  return appStore.history;
}

export function addHistoryRecord(record: QueueHistoryEntry): void {
  // Unshift adds the newest records to the top of the list
  appStore.history.unshift(record);
}
