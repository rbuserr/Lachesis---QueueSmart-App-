import { MOCK_NOTIFICATIONS, MOCK_SCENARIO } from "@/lib/mock-data";
import type { Notification } from "@/types/trader";

export async function getNotifications(): Promise<Notification[]> {
  if (!MOCK_SCENARIO.hasNotifications) return [];
  return MOCK_NOTIFICATIONS;
  // TODO(notification-module): replace mock data with its API integration.
}
