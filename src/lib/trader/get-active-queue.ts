import "server-only";

import { CURRENT_TRADER_NAME } from "@/lib/trader/current-trader";
import { buildActiveQueue } from "@/server/wait-time";
import type { ActiveQueue } from "@/types/domain";

export async function getActiveQueue(): Promise<ActiveQueue | null> {
  // TODO(authentication-module): use the authenticated trader identity.
  return buildActiveQueue(CURRENT_TRADER_NAME);
}
