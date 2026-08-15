import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/server/db";
import {
  completeCurrentService,
  getQueueSnapshot,
  joinQueue,
  leaveQueue,
  moveQueueEntry,
  serveNext,
  setQueueOpen,
} from "@/server/queue";
import {
  buildActiveQueue,
  estimateWaitForQueuePosition,
  getServiceQueuePreview,
} from "@/server/wait-time";

describe("Queue Management and Wait-Time Logic (Prisma A4 Integration)", () => {
  beforeEach(async () => {
    // 1. Wipe the database cleanly to avoid foreign key collisions
    await prisma.queueHistory.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.queueEntry.deleteMany();
    await prisma.queue.deleteMany();
    await prisma.service.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.userCredential.deleteMany();

    // 2. Seed default services
    await prisma.service.createMany({
      data: [
        { id: 1, name: "Consultation", description: "Basic", expectedDurationMinutes: 10, priority: "low", isOpen: true },
        { id: 2, name: "Support", description: "Technical", expectedDurationMinutes: 25, priority: "medium", isOpen: true },
        { id: 3, name: "Emergency", description: "Urgent", expectedDurationMinutes: 5, priority: "high", isOpen: true },
      ],
    });

    // 3. Open a queue for each service
    await prisma.queue.createMany({
      data: [
        { serviceId: 1, status: "open" },
        { serviceId: 2, status: "open" },
        { serviceId: 3, status: "open" },
      ],
    });
  });

  it("joins a trader using the selected service priority", async () => {
    const entry = await joinQueue({
      traderName: "Joshua",
      serviceId: 3,
    });

    expect(entry).toMatchObject({
      traderName: "Joshua",
      serviceId: 3,
      priority: "high",
      status: "waiting",
    });

    const dbEntries = await prisma.queueEntry.findMany();
    expect(dbEntries).toHaveLength(1);
    expect(dbEntries[0].joinedAt).toBeInstanceOf(Date);
  });

  // TEST #1

  it("creates a notification when an authenticated user joins a queue", async () => {
    const user = await prisma.userCredential.create({
      data: {
        email: "notification-test@example.com",
        passwordHash: "test-hash",
        role: "user",
      },
    });

    await joinQueue({
      traderName: "Notification User",
      serviceId: 1,
      userId: user.id,
    });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
    });

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      userId: user.id,
      message: "You successfully joined the queue for Consultation.",
      status: "sent",
    });
  });


  // TEST #2

  it("notifies a user when they become close to being served", async () => {
    const firstUser = await prisma.userCredential.create({
      data: {
        email: "first@example.com",
        passwordHash: "test-hash",
        role: "user",
      },
    });

    const secondUser = await prisma.userCredential.create({
      data: {
        email: "second@example.com",
        passwordHash: "test-hash",
        role: "user",
      },
    });

    await joinQueue({
      traderName: "First User",
      serviceId: 1,
      userId: firstUser.id,
    });

    await joinQueue({
      traderName: "Second User",
      serviceId: 1,
      userId: secondUser.id,
    });

    // Remove join notifications so we're only checking
    // the "close to being served" notification.
    await prisma.notification.deleteMany();

    await serveNext();

    const notifications = await prisma.notification.findMany({
      where: { userId: secondUser.id },
    });

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      userId: secondUser.id,
      message: "Get ready, Second User! You are close to being served.",
      status: "sent",
    });
  });


  it("rejects duplicate traders and unavailable queues or services", async () => {
    await joinQueue({ traderName: "Joshua", serviceId: 1 });

    await expect(
      joinQueue({ traderName: " jOsHuA ", serviceId: 2 })
    ).rejects.toThrow("already in the queue");

    await setQueueOpen(false);
    await expect(
      joinQueue({ traderName: "Closed Queue", serviceId: 1 })
    ).rejects.toThrow("Queue is currently closed");

    await setQueueOpen(true);
    await prisma.service.update({ where: { id: 1 }, data: { isOpen: false } });
    await expect(
      joinQueue({ traderName: "Closed Service", serviceId: 1 })
    ).rejects.toThrow("service is currently closed");
  });

  it("orders traders by priority and preserves FIFO within each priority", async () => {
    await joinQueue({ traderName: "Low First", serviceId: 1 });
    await joinQueue({ traderName: "High First", serviceId: 3 });
    await joinQueue({ traderName: "Medium", serviceId: 2 });
    await joinQueue({ traderName: "High Second", serviceId: 3 });

    const snapshot = await getQueueSnapshot();
    expect(snapshot.entries.map((entry) => entry.traderName)).toEqual([
      "High First",
      "High Second",
      "Medium",
      "Low First",
    ]);
  });

  it("calculates wait time from the services ahead in the database", async () => {
    await prisma.service.update({ where: { id: 2 }, data: { priority: "low" } });

    await joinQueue({ traderName: "First", serviceId: 1 }); // 10 min
    await joinQueue({ traderName: "Second", serviceId: 2 }); // 25 min

    expect(await estimateWaitForQueuePosition(0)).toBe(0);
    expect(await estimateWaitForQueuePosition(1)).toBe(10);
    expect(await getServiceQueuePreview(3)).toMatchObject({
      waitingCount: 2,
      estimatedWaitMinutes: 35,
    });

    await serveNext();

    // Now 'First' is serving (10m). Second is at position 0, waiting for First.
    expect(await estimateWaitForQueuePosition(0)).toBe(10);
    expect(await buildActiveQueue("First")).toMatchObject({
      position: 1,
      peopleAhead: 0,
      estimatedWaitMinutes: 0,
      status: "serving",
    });
    expect(await buildActiveQueue("Second")).toMatchObject({
      position: 2,
      peopleAhead: 1,
      estimatedWaitMinutes: 10,
      status: "almost_ready",
    });
  });

  it("prevents serving another trader until the current service is completed", async () => {
    await joinQueue({ traderName: "First", serviceId: 1 });
    await joinQueue({ traderName: "Second", serviceId: 1 });

    await serveNext();

    await expect(serveNext()).rejects.toThrow(
      "Finish the current trader before serving the next one"
    );

    const serving = await prisma.queueEntry.findFirst({ where: { status: "serving" } });
    const waiting = await prisma.queueEntry.findFirst({ where: { status: "waiting" } });
    expect(serving?.traderName).toBe("First");
    expect(waiting?.traderName).toBe("Second");
  });

  it("records a served history outcome when service is completed", async () => {
    const joined = await joinQueue({ traderName: "Joshua", serviceId: 2 });
    await serveNext();
    
    const completed = await completeCurrentService();

    expect(completed?.id).toEqual(joined.id);
    
    const currentlyServing = await prisma.queueEntry.findFirst({ where: { status: "serving" } });
    expect(currentlyServing).toBeNull();
    
    const history = await prisma.queueHistory.findMany();
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      traderName: "Joshua",
      serviceId: 2,
      outcome: "served",
    });
  });

  it("records a cancelled history outcome when a trader leaves", async () => {
    const joined = await joinQueue({ traderName: "Joshua", serviceId: 1 });

    await leaveQueue(joined.id);

    const activeEntries = await prisma.queueEntry.findMany({ where: { status: "waiting" } });
    expect(activeEntries).toHaveLength(0);

    const history = await prisma.queueHistory.findMany();
    expect(history[0]).toMatchObject({
      traderName: "Joshua",
      outcome: "cancelled",
    });
  });

  it("supports manual reordering via Prisma transactions", async () => {
    const first = await joinQueue({ traderName: "First", serviceId: 1 });
    const second = await joinQueue({ traderName: "Second", serviceId: 1 });

    await moveQueueEntry(second.id, "up");
    const snapshot = await getQueueSnapshot();

    expect(snapshot.entries.map((entry) => entry.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it("handles empty states, missing records, and invalid service references cleanly", async () => {
    expect(await serveNext()).toBeNull();
    expect(await completeCurrentService()).toBeNull();
    expect(await buildActiveQueue("Missing Trader")).toBeNull();

    await expect(
      joinQueue({ traderName: "   ", serviceId: 1 })
    ).rejects.toThrow("Trader name is required");
    await expect(
      joinQueue({ traderName: "Missing Service", serviceId: 999 })
    ).rejects.toThrow("Service not found");
    await expect(leaveQueue(999)).rejects.toThrow("Queue entry not found");
    await expect(moveQueueEntry(999, "up")).rejects.toThrow(
      "Queue entry not found"
    );
    await expect(getServiceQueuePreview(999)).rejects.toThrow("Service not found");
  });

  it("covers queue boundaries, downward movement, and waiting status", async () => {
    const first = await joinQueue({ traderName: "First", serviceId: 1 });
    const second = await joinQueue({ traderName: "Second", serviceId: 1 });
    const third = await joinQueue({ traderName: "Third", serviceId: 1 });

    // First: 0, Second: 1, Third: 2 -> Move first up (no-op)
    await moveQueueEntry(first.id, "up"); 
    let snapshot = await getQueueSnapshot();
    expect(snapshot.entries.map((entry) => entry.id)).toEqual([first.id, second.id, third.id]);

    // Move first down -> Second: 0, First: 1, Third: 2
    await moveQueueEntry(first.id, "down");
    snapshot = await getQueueSnapshot();
    expect(snapshot.entries.map((entry) => entry.id)).toEqual([second.id, first.id, third.id]);
    
    expect(await buildActiveQueue("Third")).toMatchObject({
      peopleAhead: 2,
      position: 3,
      status: "waiting",
    });

    await serveNext();
    snapshot = await getQueueSnapshot();
    expect(snapshot.currentlyServing?.id).toBe(second.id);
  });
});