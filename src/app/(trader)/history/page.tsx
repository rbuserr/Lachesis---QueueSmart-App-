import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// wired up my history fetcher here instead of hardcoding the import
import { getQueueHistory } from "@/lib/trader/get-queue-history";

export const dynamic = "force-dynamic";

export default async function HistoryScreen() {
  // pulling the mock data from our backend interface for section 2
  const history = await getQueueHistory();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Queue History</h1>
        <p className="text-muted-foreground">
          Review your past support requests and outcomes
        </p>
      </div>

      {history.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center gap-6 py-16 text-center border rounded-xl bg-muted/20">
          <SearchX className="h-12 w-12 text-muted-foreground" />
          <div className="max-w-md space-y-2">
            <p className="text-lg font-medium">No history found</p>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t joined any support queues yet. Your past requests will appear here.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      ) : (
        // History Data Table
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Wait Time</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {record.id}
                  </TableCell>
                  <TableCell>Service #{record.serviceId}</TableCell>
                  <TableCell>
                    {new Date(record.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {record.completedAt
                      ? `${Math.max(
                          0,
                          Math.round(
                            (new Date(record.completedAt).getTime() -
                              new Date(record.joinedAt).getTime()) /
                              60000
                          )
                        )} min`
                      : "In progress"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        record.outcome === "served" ? "default" : "secondary"
                      }
                    >
                      {record.outcome}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
