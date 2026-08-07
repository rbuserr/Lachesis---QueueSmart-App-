import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import {
  createService,
  deleteService,
  getService,
  listServices,
  updateService,
} from "@/server/services";
import type { CreateServiceInput } from "@/types/domain";

// Track every service id created during the run so we can clean up,
// even if a test fails partway through and doesn't reach its own delete.
const createdServiceIds: number[] = [];

function baseInput(overrides: Partial<CreateServiceInput> = {}): CreateServiceInput {
  return {
    name: "Test Service",
    description: "A service created during automated tests.",
    expectedDurationMinutes: 15,
    priority: "medium",
    ...overrides,
  };
}

async function create(overrides: Partial<CreateServiceInput> = {}) {
  const service = await createService(baseInput(overrides));
  createdServiceIds.push(service.id);
  return service;
}

afterAll(async () => {
  // Best-effort cleanup: remove queue entries/history/queues/services this
  // run created, in dependency order, so re-running tests doesn't leave
  // orphaned rows in the shared dev database.
  if (createdServiceIds.length === 0) return;

  await prisma.queueEntry.deleteMany({
    where: { serviceId: { in: createdServiceIds } },
  });
  await prisma.queueHistory.deleteMany({
    where: { serviceId: { in: createdServiceIds } },
  });
  await prisma.queue.deleteMany({
    where: { serviceId: { in: createdServiceIds } },
  });
  await prisma.service.deleteMany({
    where: { id: { in: createdServiceIds } },
  });

  await prisma.$disconnect();
});

describe("createService", () => {
  it("persists a service to the database", async () => {
    const service = await create({ name: "Persistence Check" });

    // Re-read via a fresh query (not the in-memory return value) to prove
    // it actually landed in the DB.
    const found = await prisma.service.findUnique({ where: { id: service.id } });
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Persistence Check");
    expect(found?.isOpen).toBe(true);
  });

  it("creates an open queue alongside the service", async () => {
    const service = await create();

    const queue = await prisma.queue.findFirst({
      where: { serviceId: service.id, status: "open" },
    });
    expect(queue).not.toBeNull();
  });

  it("trims whitespace from name and description", async () => {
    const service = await create({
      name: "  Padded Name  ",
      description: "  Padded description.  ",
    });
    expect(service.name).toBe("Padded Name");
    expect(service.description).toBe("Padded description.");
  });

  it("rejects an empty name", async () => {
    await expect(create({ name: "   " })).rejects.toThrow(AppError);
  });

  it("rejects a name over 100 characters", async () => {
    await expect(create({ name: "a".repeat(101) })).rejects.toThrow(AppError);
  });

  it("rejects a non-positive expected duration", async () => {
    await expect(create({ expectedDurationMinutes: 0 })).rejects.toThrow(AppError);
  });
});

describe("listServices", () => {
  it("includes newly created services", async () => {
    const service = await create({ name: "List Check" });
    const services = await listServices();
    expect(services.some((s) => s.id === service.id)).toBe(true);
  });

  it("filters to open services only when openOnly is true", async () => {
    const open = await create({ name: "Open Service" });
    const closed = await create({ name: "Closed Service" });
    await updateService(closed.id, { isOpen: false });

    const services = await listServices({ openOnly: true });
    expect(services.some((s) => s.id === open.id)).toBe(true);
    expect(services.some((s) => s.id === closed.id)).toBe(false);
  });
});

describe("getService", () => {
  it("returns the service when it exists", async () => {
    const service = await create({ name: "Get Check" });
    const found = await getService(service.id);
    expect(found?.id).toBe(service.id);
  });

  it("returns null when the service does not exist", async () => {
    const found = await getService(-1);
    expect(found).toBeNull();
  });
});

describe("updateService", () => {
  it("updates and persists changed fields", async () => {
    const service = await create({ name: "Before Update" });
    const updated = await updateService(service.id, { name: "After Update" });
    expect(updated.name).toBe("After Update");

    const reread = await getService(service.id);
    expect(reread?.name).toBe("After Update");
  });

  it("leaves fields unchanged when not provided", async () => {
    const service = await create({ name: "Partial Update", expectedDurationMinutes: 20 });
    const updated = await updateService(service.id, { name: "Partial Update Renamed" });
    expect(updated.expectedDurationMinutes).toBe(20);
  });

  it("throws 404 for a nonexistent service", async () => {
    await expect(updateService(-1, { name: "Nope" })).rejects.toMatchObject({
      status: 404,
    });
  });

  it("re-validates merged fields", async () => {
    const service = await create();
    await expect(updateService(service.id, { name: "" })).rejects.toThrow(AppError);
  });
});

describe("deleteService", () => {
  it("removes a service with no active queue entries", async () => {
    const service = await create({ name: "Delete Check" });
    await deleteService(service.id);

    const found = await getService(service.id);
    expect(found).toBeNull();

    // Already deleted — drop it from cleanup tracking so afterAll doesn't
    // try to delete it again.
    const idx = createdServiceIds.indexOf(service.id);
    if (idx !== -1) createdServiceIds.splice(idx, 1);
  });

  it("throws 404 for a nonexistent service", async () => {
    await expect(deleteService(-1)).rejects.toMatchObject({ status: 404 });
  });

  it("refuses to delete a service with an active queue entry", async () => {
    const service = await create({ name: "Has Active Entry" });
    const queue = await prisma.queue.findFirstOrThrow({
      where: { serviceId: service.id, status: "open" },
    });

    await prisma.queueEntry.create({
      data: {
        queueId: queue.id,
        traderName: "Active Trader",
        serviceId: service.id,
        priority: "medium",
        position: 0,
        status: "waiting",
      },
    });

    await expect(deleteService(service.id)).rejects.toMatchObject({ status: 409 });
  });
});