import Link from "next/link";
import { Clock, Users, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServices } from "@/lib/trader/get-services";
import { getActiveQueue } from "@/lib/trader/get-active-queue";

export default async function JoinQueueScreen() {
  const [services, activeQueue] = await Promise.all([
    getServices(),
    getActiveQueue(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Join a Queue</h1>
        <p className="text-muted-foreground">
          Select a support service to connect with a risk manager.
        </p>
      </div>

      {/* Warning if already in queue */}
      {activeQueue && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/50">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You are currently in a queue. Joining a new one will replace your
            current position.
          </p>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-base">{service.name}</CardTitle>
                {service.priority && (
                  <Badge variant="secondary">High Priority</Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {service.description || "Get assistance from our specialists."}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="grid gap-2 text-sm text-muted-foreground mt-auto">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Est. wait: ~{service.durationMinutes} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>0 people waiting</span>
              </div>
            </CardContent>

            <CardFooter>
              <Button asChild className="w-full group">
                {/* 
                  FIX: Added flex layout to the Link, truncated the text span, 
                  and added shrink-0 to the icon to prevent overflow. 
                */}
                <Link 
                  href={`/queue/join/${service.id}`} 
                  className="flex items-center justify-center gap-2 overflow-hidden px-4"
                >
                  <span className="truncate">Join {service.name}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap gap-3 pt-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Cancel & Return</Link>
        </Button>
      </div>
    </div>
  );
}
