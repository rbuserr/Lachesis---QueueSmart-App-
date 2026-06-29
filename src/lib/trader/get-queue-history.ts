import { MOCK_QUEUE_HISTORY } from "@/lib/mock-data";
import type { QueueHistoryEntry } from "@/types/trader";

export async function getQueueHistory(): Promise<QueueHistoryEntry[]> {
  return MOCK_QUEUE_HISTORY;
  // A3: return fetch("/api/trader/queue/history").then((r) => r.json());
}
