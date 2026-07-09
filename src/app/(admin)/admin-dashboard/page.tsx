  "use client";

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
  import AdminNavbar from "@/components/admin/admin-navbar";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";

  export default function AdminDashboard() {
    const stats = [
      {
        title: "Total Traders",
        value: "243",
        icon: Users,
        subtitle: "+18 today",
      },
      {
        title: "Active Queue",
        value: "18",
        icon: Clock3,
        subtitle: "Average wait 13 min",
      },
      {
        title: "Services",
        value: "3",
        icon: ClipboardList,
        subtitle: "All operational",
      },
      {
        title: "Staff Online",
        value: "6",
        icon: ShieldCheck,
        subtitle: "2 Risk Managers",
      },
    ];

    const services = [
      {
        name: "General Account Inquiry",
        priority: "Low",
        duration: "10 mins",
        waiting: 4,
      },
      {
        name: "Evaluation Phase Verification",
        priority: "Medium",
        duration: "25 mins",
        waiting: 8,
      },
      {
        name: "Live Trade / Platform Execution Issue",
        priority: "High",
        duration: "5 mins",
        waiting: 6,
      },
    ];

    const activity = [
      "Sarah Chen joined Evaluation Queue",
      "Alex Morgan served by Risk Manager",
      "Queue opened for Live Platform Issues",
      "New service created by Administrator",
      "David Kim notified: You're next!",
    ];

    return (
      <>
        <AdminNavbar />
        <main className="min-h-screen bg-background p-8">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">

          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center">
              Good Morning, Admin
            </h1>

            <p className="text-muted-foreground mt-2">
              Monitor traders, queues, and support services from one place.
            </p>

            <p className="text-sm text-muted-foreground mt-3">
              Last Updated • Today at 9:42 AM
            </p>

          </div>

          <div className="flex gap-3">

            <div className="relative">

              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Search..."
                className="pl-10 w-72"
              />

            </div>

            <Button variant="outline">

              <Bell className="mr-2 h-4 w-4" />

              Notifications

            </Button>

          </div>

        </div>

        

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">

          {stats.map((stat) => {

            const Icon = stat.icon;

            return (

              <Card
                key={stat.title}
                className="transition-all hover:shadow-lg hover:-translate-y-1"
              >

                <CardHeader className="flex flex-row items-center justify-between">

                  <CardTitle className="text-base">
                    {stat.title}
                  </CardTitle>

                  <Icon className="h-5 w-5 text-primary" />

                </CardHeader>

                <CardContent>

                  <h2 className="text-4xl font-bold">
                    {stat.value}
                  </h2>

                  <p className="text-sm text-muted-foreground mt-2">
                    {stat.subtitle}
                  </p>

                </CardContent>

              </Card>

            );

          })}

        </div>
              

        <div className="grid gap-6 lg:grid-cols-3">

         

          <Card className="lg:col-span-2 transition-all hover:shadow-lg">

            <CardHeader>

              <CardTitle>
                Available Services
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              {services.map((service) => (

                <div
                  key={service.name}
                  className="rounded-xl border p-5 transition-all hover:bg-muted/40"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-semibold text-lg">
                        {service.name}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-1">
                        Expected Duration: {service.duration}
                      </p>

                    </div>

                    <Badge
                      variant={
                        service.priority === "High"
                          ? "destructive"
                          : service.priority === "Medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {service.priority}
                    </Badge>

                  </div>

                </div>

              ))}

            </CardContent>

          </Card>

          {/* Queue Summary */}

          <Card className="transition-all hover:shadow-lg">

            <CardHeader>

              <CardTitle>
                Queue Summary
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-5">

              {services.map((service) => (

                <div
                  key={service.name}
                  className="flex items-center justify-between"
                >

                  <div>

                    <p className="font-medium">
                      {service.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Waiting Traders
                    </p>

                  </div>

                  <Badge>
                    {service.waiting}
                  </Badge>

                </div>

              ))}

            </CardContent>

          </Card>

        </div>

       

        <div className="grid gap-6 lg:grid-cols-2 mt-8">

          

          <Card className="transition-all hover:shadow-lg">

            <CardHeader>

              <CardTitle>
                Recent Activity
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              {activity.map((item, index) => (

                <div
                  key={index}
                  className="flex items-start gap-3 border-b pb-3 last:border-none"
                >

                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />

                  <p className="text-sm">
                    {item}
                  </p>

                </div>

              ))}

            </CardContent>

          </Card>

          <Card className="transition-all hover:shadow-lg">

            <CardHeader>

              <CardTitle>
                Quick Actions
              </CardTitle>

            </CardHeader>

            <CardContent className="grid gap-4">

              <Button className="justify-start">
                Open Queue
              </Button>

              <Button
                variant="destructive"
                className="justify-start"
              >
                Close Queue
              </Button>

              <Button
                variant="outline"
                className="justify-start"
              >
                Add New Service
              </Button>

              <Button
                variant="outline"
                className="justify-start"
              >
                View Queue Report
              </Button>

            </CardContent>

          </Card>

        </div>

        <footer>

          <div className="mt-10 border-t pt-5 text-center text-1xl font-bold text-muted-foreground flex items-center justify-center gap-2">
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

      </main>
      </>
    );
  }