import { Bell } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/trader/format";
import type { Notification } from "@/types/trader";

interface NotificationsSummaryProps {
  notifications: Notification[];
}

export function NotificationsSummary({
  notifications,
}: NotificationsSummaryProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No notifications yet.</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll alert you when your queue status changes.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="flex items-start justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex gap-3">
                  <span
                    className={
                      notification.read
                        ? "mt-2 h-2 w-2 shrink-0 rounded-full bg-muted"
                        : "mt-2 h-2 w-2 shrink-0 rounded-full bg-brand"
                    }
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(notification.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
