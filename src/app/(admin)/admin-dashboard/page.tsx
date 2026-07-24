"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  Clock3,
  ClipboardList,
  ShieldCheck,
  Search,
  Bell,
} from "lucide-react";
import Image from "next/image";
import SnakeLogo from "@/components/ui/snake-logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQueue } from "@/hooks/use-queue";
import { useServices } from "@/hooks/use-services";
import { api } from "@/lib/api-client";

export default function AdminDashboard() {
  const router = useRouter();
  const { services, error: servicesError } = useServices();
  const {
    snapshot,
    error: queueError,
    refresh: refreshQueue,
  } = useQueue();
  const queueStats = snapshot.stats;
  const queueOpen = snapshot.isOpen;

  // summary numbers shown in the top stat cards
  const stats = [
    {
      title: "Total Traders",
      value: "243",
      icon: Users,
      subtitle: "+18 today",
    },
    {
      title: "Active Queue",
      value: queueStats.waiting.toString(),
      icon: Clock3,
      subtitle:
        queueStats.waiting === 0
          ? "No traders waiting"
          : `Estimated wait ${queueStats.averageEstimatedWaitMinutes} min`,
    },
    {
      title: "Services",
      value: services.length.toString(),
      icon: ClipboardList,
      subtitle: `${services.filter((s) => s.isOpen).length} open`,
    },
    {
      title: "Staff Online",
      value: "6",
      icon: ShieldCheck,
      subtitle: "2 Risk Managers",
    },
  ];

  // opens or closes the queue via the queue manager
  const handleToggleQueue = async () => {
    await api.queue.setOpen(!queueOpen);
    await refreshQueue();
  };

  return (
    <div className="space-y-8">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Good Morning, Admin
          </h1>

          <p className="text-muted-foreground mt-2">
            Monitor traders, queues, and support services from one place.
          </p>

          <p className="text-sm text-muted-foreground mt-3">
            Queue is currently{" "}
            <span className={queueOpen ? "text-emerald-500" : "text-red-500"}>
              {queueOpen ? "Open" : "Closed"}
            </span>
          </p>
        </div>

        <div className="flex gap-3">

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 w-72" />
          </div>

          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>

        </div>

      </div>

      {(servicesError || queueError) && (
        <p className="text-sm text-red-500">
          {servicesError || queueError}
        </p>
      )}

      {/* top row of stat cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{stat.title}</CardTitle>
                <Icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <h2 className="text-2xl font-semibold">{stat.value}</h2>
                <p className="text-sm text-muted-foreground mt-2">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* list of all services with open/closed and priority badges */}
        <Card className="lg:col-span-2 transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Available Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No services configured yet.
              </p>
            ) : (
              services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border p-5 transition-all hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Expected Duration: {service.expectedDurationMinutes} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={service.isOpen ? "outline" : "secondary"}>
                        {service.isOpen ? "Open" : "Closed"}
                      </Badge>
                      <Badge
                        variant={
                          service.priority === "high"
                            ? "destructive"
                            : service.priority === "medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {service.priority[0].toUpperCase() +
                          service.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* condensed view of services grouped by priority */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Priority Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No services configured yet.
              </p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.expectedDurationMinutes} min expected
                    </p>
                  </div>
                  <Badge
                    variant={
                        service.priority === "high"
                        ? "destructive"
                          : service.priority === "medium"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {service.priority[0].toUpperCase() +
                      service.priority.slice(1)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>

      <div className="grid gap-6">
        {/* TODO(notification-module): add the assigned notification/activity UI here. */}
        {/* shortcut buttons for common admin actions */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              className="justify-start"
              disabled={queueOpen}
              onClick={() => void handleToggleQueue()}
            >
              Open Queue
            </Button>

            <Button
              variant="destructive"
              className="justify-start"
              disabled={!queueOpen}
              onClick={() => void handleToggleQueue()}
            >
              Close Queue
            </Button>

            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/services")}
            >
              Add New Service
            </Button>

            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/manage-queue")}
            >
              View Queue Report
            </Button>
          </CardContent>
        </Card>

      </div>

      <footer>
        <div className="border-t pt-5 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          QueueSmart Administrator Portal • Version 1.0
          <Image
            src={SnakeLogo}
            alt="QueueSmart Logo"
            width={40}
            height={40}
            className="object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>
      </footer>

    </div>
  );
}