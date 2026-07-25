import "server-only";
import { CURRENT_TRADER_NAME } from "@/lib/trader/current-trader";
import { getHistoryStore } from "@/server/app-store";
import type { QueueHistoryEntry } from "@/types/trader";

export async function getQueueHistory(): Promise<QueueHistoryEntry[]> {
  // Replaced mock data with actual integration to the shared in-memory store
  return getHistoryStore().filter(
    (record) => record.traderName === CURRENT_TRADER_NAME
  );
}

