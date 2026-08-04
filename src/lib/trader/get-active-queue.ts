import "server-only";

import { getCurrentTraderName } from "@/lib/trader/current-trader";
import { buildActiveQueue } from "@/server/wait-time";
import type { ActiveQueue } from "@/types/domain";

export async function getActiveQueue(): Promise<ActiveQueue | null> {
  const traderName = await getCurrentTraderName();
  if (!traderName) {
    return null;
  }

  return buildActiveQueue(traderName);
}
