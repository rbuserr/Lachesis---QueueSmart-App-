import { MOCK_NOTIFICATIONS, MOCK_SCENARIO } from "@/lib/mock-data";
import type { Notification } from "@/types/trader";

export async function getNotifications(): Promise<Notification[]> {
  if (!MOCK_SCENARIO.hasNotifications) return [];
  return MOCK_NOTIFICATIONS;
  // A3: return fetch("/api/trader/notifications").then((r) => r.json());
}
