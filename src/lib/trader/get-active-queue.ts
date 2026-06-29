import { MOCK_ACTIVE_QUEUE, MOCK_SCENARIO } from "@/lib/mock-data";
import type { ActiveQueue } from "@/types/trader";

export async function getActiveQueue(): Promise<ActiveQueue | null> {
  if (!MOCK_SCENARIO.inQueue) return null;
  return MOCK_ACTIVE_QUEUE;
  // A3: return fetch("/api/trader/queue/active").then((r) =>
  //   r.status === 404 ? null : r.json()
  // );
}
