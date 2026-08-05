import "server-only";

import { getCurrentTraderName } from "@/lib/trader/current-trader";
import { getHistoryStore } from "@/server/app-store";
import type { QueueHistoryEntry } from "@/types/trader";

export async function getQueueHistory(): Promise<QueueHistoryEntry[]> {
  const traderName = await getCurrentTraderName();
  if (!traderName) {
    return [];
  }

  return getHistoryStore().filter((record) => record.traderName === traderName);
}
