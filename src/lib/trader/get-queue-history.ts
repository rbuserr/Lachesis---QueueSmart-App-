import { MOCK_QUEUE_HISTORY } from "@/lib/mock-data";
import type { QueueHistoryEntry } from "@/types/trader";

export async function getQueueHistory(): Promise<QueueHistoryEntry[]> {
  return MOCK_QUEUE_HISTORY;
  // TODO(history-module): replace mock data with its API integration.
}
