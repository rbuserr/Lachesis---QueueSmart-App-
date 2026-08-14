import "server-only";

import { prisma } from "@/server/db";

export interface HistoryReportRow {
  id: string;
  traderName: string;
  serviceId: number;
  serviceName: string;
  joinedAt: string;
  completedAt: string | null;
  outcome: string;
}

export interface ServiceUsageStat {
  serviceId: number;
  serviceName: string;
  totalServed: number;
  totalLeft: number;
  totalCancelled: number;
  averageWaitMinutes: number;
}

/*Pulls every QueueHistory record, newest first, joined with its Service name. */
export async function getHistoryReportRows(): Promise<HistoryReportRow[]> {
  const records = await prisma.queueHistory.findMany({
    orderBy: { joinedAt: "desc" },
    include: { service: true },
  });

  return records.map((record) => ({
    id: record.id,
    traderName: record.traderName,
    serviceId: record.serviceId,
    serviceName: record.service.name,
    joinedAt: record.joinedAt.toISOString(),
    completedAt: record.completedAt ? record.completedAt.toISOString() : null,
    outcome: record.outcome,
  }));
}

/**
 * Aggregates QueueHistory into per-service usage statistics: how many
 * traders were served / left / cancelled for each service, and the
 * average time (in minutes) between joining and completion for served
 * entries. Includes every service, even ones with zero history.
 */
export async function getServiceUsageStats(): Promise<ServiceUsageStat[]> {
  const [services, historyRecords] = await Promise.all([
    prisma.service.findMany({ orderBy: { id: "asc" } }),
    prisma.queueHistory.findMany(),
  ]);

  return services.map((service) => {
    const records = historyRecords.filter((r) => r.serviceId === service.id);
    const served = records.filter((r) => r.outcome === "served");
    const left = records.filter((r) => r.outcome === "left");
    const cancelled = records.filter((r) => r.outcome === "cancelled");

    const completedDurationsMinutes = served
      .filter((r) => r.completedAt !== null)
      .map(
        (r) =>
          (r.completedAt!.getTime() - r.joinedAt.getTime()) / (1000 * 60),
      );

    const averageWaitMinutes =
      completedDurationsMinutes.length === 0
        ? 0
        : Math.round(
            completedDurationsMinutes.reduce((sum, m) => sum + m, 0) /
              completedDurationsMinutes.length,
          );

    return {
      serviceId: service.id,
      serviceName: service.name,
      totalServed: served.length,
      totalLeft: left.length,
      totalCancelled: cancelled.length,
      averageWaitMinutes,
    };
  });
}

function escapeCsvField(value: string): string {
  // Wrap in quotes and escape any embedded quotes if the field contains a
  // comma, quote, or newline — standard CSV escaping.
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Converts history rows into a CSV section with a header row. */
export function rowsToCsv(rows: HistoryReportRow[]): string {
  const headers = [
    "id",
    "traderName",
    "serviceId",
    "serviceName",
    "joinedAt",
    "completedAt",
    "outcome",
  ];

  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(
      [
        escapeCsvField(row.id),
        escapeCsvField(row.traderName),
        String(row.serviceId),
        escapeCsvField(row.serviceName),
        escapeCsvField(row.joinedAt),
        escapeCsvField(row.completedAt ?? ""),
        escapeCsvField(row.outcome),
      ].join(","),
    );
  }

  return lines.join("\n");
}

/** Converts service usage stats into a CSV section with a header row. */
export function statsToCsv(stats: ServiceUsageStat[]): string {
  const headers = [
    "serviceId",
    "serviceName",
    "totalServed",
    "totalLeft",
    "totalCancelled",
    "averageWaitMinutes",
  ];

  const lines = [headers.join(",")];

  for (const stat of stats) {
    lines.push(
      [
        String(stat.serviceId),
        escapeCsvField(stat.serviceName),
        String(stat.totalServed),
        String(stat.totalLeft),
        String(stat.totalCancelled),
        String(stat.averageWaitMinutes),
      ].join(","),
    );
  }

  return lines.join("\n");
}

/**
 * Generates the queue participation history report as a clean, standard CSV*/
export async function generateHistoryReportCsv(): Promise<string> {
  const rows = await getHistoryReportRows();
  return rowsToCsv(rows);
}

/**
 * Generates the per-service usage statistics report as a clean, standar CSV */
export async function generateServiceStatsCsv(): Promise<string> {
  const stats = await getServiceUsageStats();
  return statsToCsv(stats);
}