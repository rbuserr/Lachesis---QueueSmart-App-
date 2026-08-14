import "server-only";

import { requireAdminUser } from "@/server/api-auth";
import { errorResponse } from "@/server/errors";
import {
  generateHistoryReportCsv,
  generateServiceStatsCsv,
} from "@/server/reports";

/**
 *GET /api/reports?type=history  
  GET /api/reports?type=stats   Admin-only. Returns a downloadable CSV report.
  Kept as two separate, uniformly-shaped CSVs rather than one combined
  Security: requireAdminUser() runs before any data is touched. Middleware file
  does not cover /api/* routes (see middleware.ts matcher), so this check
  is the only access gate for this route.*/
export async function GET(request: Request) {
  try {
    await requireAdminUser();

    const type = new URL(request.url).searchParams.get("type") ?? "history";
    const timestamp = new Date().toISOString().split("T")[0];

    let csv: string;
    let filename: string;

    if (type === "stats") {
      csv = await generateServiceStatsCsv();
      filename = `service-usage-stats-${timestamp}.csv`;
    } else {
      csv = await generateHistoryReportCsv();
      filename = `queue-history-report-${timestamp}.csv`;
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}