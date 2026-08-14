import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/server/db";
import {
  generateHistoryReportCsv,
  generateServiceStatsCsv,
  getHistoryReportRows,
  getServiceUsageStats,
  rowsToCsv,
  statsToCsv,
} from "@/server/reports";

//Route-level security tests (mocked session)

vi.mock("@/lib/auth/session.server", () => ({
  readSessionUserServer: vi.fn(),
}));

import { readSessionUserServer } from "@/lib/auth/session.server";
import { GET } from "@/app/api/reports/route";

const adminUser = {
  id: "admin-1",
  name: "Test Admin",
  email: "admin@test.com",
  role: "admin" as const,
  createdAt: new Date().toISOString(),
};

const regularUser = {
  id: "user-1",
  name: "Test Trader",
  email: "trader@test.com",
  role: "user" as const,
  createdAt: new Date().toISOString(),
};

describe("GET /api/reports — access control", () => {
  beforeEach(() => {
    vi.mocked(readSessionUserServer).mockReset();
  });

  it("returns 401 when there is no session", async () => {
    vi.mocked(readSessionUserServer).mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/reports"));
    expect(response.status).toBe(401);
  });

  it("returns 403 for a non-admin session", async () => {
    vi.mocked(readSessionUserServer).mockResolvedValue(regularUser);
    const response = await GET(new Request("http://localhost/api/reports"));
    expect(response.status).toBe(403);
  });

  it("returns the history CSV by default for an admin session", async () => {
    vi.mocked(readSessionUserServer).mockResolvedValue(adminUser);
    const response = await GET(new Request("http://localhost/api/reports"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(response.headers.get("Content-Disposition")).toContain(
      "queue-history-report",
    );
  });

  it("returns the stats CSV when type=stats", async () => {
    vi.mocked(readSessionUserServer).mockResolvedValue(adminUser);
    const response = await GET(
      new Request("http://localhost/api/reports?type=stats"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toContain(
      "service-usage-stats",
    );
  });
});

// --- CSV formatting tests ---

describe("rowsToCsv", () => {
  it("produces a header row and one line per record", () => {
    const csv = rowsToCsv([
      {
        id: "abc123",
        traderName: "Jane Doe",
        serviceId: 1,
        serviceName: "General Account Inquiry",
        joinedAt: "2026-01-01T10:00:00.000Z",
        completedAt: "2026-01-01T10:10:00.000Z",
        outcome: "served",
      },
    ]);

    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "id,traderName,serviceId,serviceName,joinedAt,completedAt,outcome",
    );
    expect(lines[1]).toBe(
      "abc123,Jane Doe,1,General Account Inquiry,2026-01-01T10:00:00.000Z,2026-01-01T10:10:00.000Z,served",
    );
  });

  it("escapes fields containing commas", () => {
    const csv = rowsToCsv([
      {
        id: "abc123",
        traderName: "Doe, Jane",
        serviceId: 1,
        serviceName: "General Account Inquiry",
        joinedAt: "2026-01-01T10:00:00.000Z",
        completedAt: null,
        outcome: "left",
      },
    ]);

    expect(csv).toContain('"Doe, Jane"');
  });

  it("every line has the same number of columns (safe for spreadsheet import)", () => {
    const csv = rowsToCsv([
      {
        id: "a",
        traderName: "A",
        serviceId: 1,
        serviceName: "X",
        joinedAt: "2026-01-01T10:00:00.000Z",
        completedAt: null,
        outcome: "left",
      },
      {
        id: "b",
        traderName: "B",
        serviceId: 2,
        serviceName: "Y",
        joinedAt: "2026-01-01T10:00:00.000Z",
        completedAt: "2026-01-01T10:05:00.000Z",
        outcome: "served",
      },
    ]);

    const columnCounts = csv.split("\n").map((line) => line.split(",").length);
    expect(new Set(columnCounts).size).toBe(1);
  });
});

describe("statsToCsv", () => {
  it("produces a header row and one line per service", () => {
    const csv = statsToCsv([
      {
        serviceId: 1,
        serviceName: "Consultation",
        totalServed: 5,
        totalLeft: 1,
        totalCancelled: 0,
        averageWaitMinutes: 12,
      },
    ]);

    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "serviceId,serviceName,totalServed,totalLeft,totalCancelled,averageWaitMinutes",
    );
    expect(lines[1]).toBe("1,Consultation,5,1,0,12");
  });
});

//Real-DB integration tests

describe("report generation (real DB)", () => {
  let testServiceId: number;
  let testHistoryId: string;

  beforeEach(async () => {
    const service = await prisma.service.create({
      data: {
        name: `Report Test Service ${Date.now()}`,
        description: "Created for reports.test.ts",
        expectedDurationMinutes: 5,
        priority: "low",
      },
    });
    testServiceId = service.id;

    const history = await prisma.queueHistory.create({
      data: {
        traderName: "Report Test Trader",
        serviceId: testServiceId,
        joinedAt: new Date(Date.now() - 10 * 60 * 1000),
        completedAt: new Date(),
        outcome: "served",
      },
    });
    testHistoryId = history.id;
  });

  afterAll(async () => {
    await prisma.queueHistory.deleteMany({ where: { id: testHistoryId } });
    await prisma.service.deleteMany({ where: { id: testServiceId } });
    await prisma.$disconnect();
  });

  it("includes the joined service name for each history row", async () => {
    const rows = await getHistoryReportRows();
    const row = rows.find((r) => r.id === testHistoryId);

    expect(row).toBeDefined();
    expect(row?.serviceName).toContain("Report Test Service");
    expect(row?.outcome).toBe("served");
  });

  it("computes usage stats for the test service, including average wait time", async () => {
    const stats = await getServiceUsageStats();
    const stat = stats.find((s) => s.serviceId === testServiceId);

    expect(stat).toBeDefined();
    expect(stat?.totalServed).toBe(1);
    expect(stat?.totalLeft).toBe(0);
    expect(stat?.averageWaitMinutes).toBeGreaterThanOrEqual(9);
    expect(stat?.averageWaitMinutes).toBeLessThanOrEqual(11);
  });

  it("generateHistoryReportCsv produces a clean history CSV", async () => {
    const csv = await generateHistoryReportCsv();
    expect(csv).toContain("Report Test Trader");
    expect(csv.split("\n")[0]).toBe(
      "id,traderName,serviceId,serviceName,joinedAt,completedAt,outcome",
    );
  });

  it("generateServiceStatsCsv produces a clean stats CSV", async () => {
    const csv = await generateServiceStatsCsv();
    expect(csv.split("\n")[0]).toBe(
      "serviceId,serviceName,totalServed,totalLeft,totalCancelled,averageWaitMinutes",
    );
  });
});