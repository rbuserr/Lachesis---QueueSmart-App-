import "server-only";
import { getHistoryStore } from "@/server/app-store";
import type { QueueHistoryEntry } from "@/types/trader";

export async function getQueueHistory(): Promise<QueueHistoryEntry[]> {
  // Replaced mock data with actual integration to the shared in-memory store
  return getHistoryStore();
}

