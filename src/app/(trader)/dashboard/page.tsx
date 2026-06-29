import { NotificationsSummary } from "@/components/trader/notifications-summary";
import { QueueOverviewCard } from "@/components/trader/queue-overview-card";
import { ServicesList } from "@/components/trader/services-list";
import { getActiveQueue } from "@/lib/trader/get-active-queue";
import { getNotifications } from "@/lib/trader/get-notifications";
import { getServiceById, getServices } from "@/lib/trader/get-services";
import { MOCK_TRADER_NAME } from "@/lib/mock-data";

export default async function UserDashboard() {
  const [activeQueue, services, notifications] = await Promise.all([
    getActiveQueue(),
    getServices(),
    getNotifications(),
  ]);

  const activeService = activeQueue
    ? await getServiceById(activeQueue.serviceId)
    : undefined;

  const firstName = MOCK_TRADER_NAME.split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Good morning, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Overview of your support queue activity
        </p>
      </div>

      <QueueOverviewCard activeQueue={activeQueue} service={activeService} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ServicesList services={services} activeQueue={activeQueue} />
        <NotificationsSummary notifications={notifications} />
      </div>
    </div>
  );
}
