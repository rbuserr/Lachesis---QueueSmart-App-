import Link from "next/link";
import { History as HistoryIcon, SearchX } from "lucide-react";

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

// Assuming a mock fetcher to match @/lib/ structure
// import { getQueueHistory } from "@/lib/trader/get-queue-history";

export default async function HistoryScreen() {
  // Placeholder for actual data fetching logic
  // const history = await getQueueHistory();
  
  // Mock data to scaffold the UI
  const history = [
    { id: "Q-1004", service: "Margin Call Review", status: "Resolved", date: "2026-07-08T14:30:00Z", duration: "12m" },
    { id: "Q-1001", service: "Platform Bug Report", status: "Cancelled", date: "2026-07-07T09:15:00Z", duration: "5m" },
  ];

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
        // Empty State (Mirrors your status.tsx approach)
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
                  <TableCell>{record.service}</TableCell>
                  <TableCell>
                    {new Date(record.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{record.duration}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={record.status === "Resolved" ? "default" : "secondary"}
                    >
                      {record.status}
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
