import "server-only";

import { getCurrentTraderName } from "@/lib/trader/current-trader";
import { getRecentCompletion as fetchRecentCompletion } from "@/server/wait-time";
import type { RecentCompletion } from "@/server/wait-time";

export async function getRecentCompletion(): Promise<RecentCompletion | null> {
  const traderName = await getCurrentTraderName();
  if (!traderName) {
    return null;
  }

  return fetchRecentCompletion(traderName);
}