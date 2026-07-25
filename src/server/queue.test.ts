// QUEUE MANAGEMENT AND WAIT-TIME TESTS (Joshua)

import { beforeEach, describe, expect, it } from "vitest";

import { appStore } from "@/server/app-store";
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
  estimateWaitForQueueIndex,
  getServiceQueuePreview,
} from "@/server/wait-time";

const initialServices = appStore.services.map((service) => ({ ...service }));

describe("Queue Management and Wait-Time Logic", () => {
  beforeEach(() => {
    appStore.services.splice(
      0,
      appStore.services.length,
      ...initialServices.map((service) => ({ ...service }))
    );
    appStore.queue.splice(0);
    appStore.history.splice(0);
    appStore.currentlyServing = null;
    appStore.queueOpen = true;
    appStore.nextQueueEntryId = 1;
  });

  it("joins a trader using the selected service priority", async () => {
    const entry = await joinQueue({
      traderName: "Joshua",
      serviceId: 3,
    });

    expect(entry).toMatchObject({
      id: 1,
      traderName: "Joshua",
      serviceId: 3,
      priority: "high",
    });
    expect(appStore.queue).toHaveLength(1);
    expect(Date.parse(entry.joinedAt)).not.toBeNaN();
  });

  it("rejects duplicate traders and unavailable queues or services", async () => {
    await joinQueue({ traderName: "Joshua", serviceId: 1 });

    await expect(
      joinQueue({ traderName: " jOsHuA ", serviceId: 2 })
    ).rejects.toThrow("already in the queue");

    appStore.queue.splice(0);
    await setQueueOpen(false);
    await expect(
      joinQueue({ traderName: "Closed Queue", serviceId: 1 })
    ).rejects.toThrow("Queue is currently closed");

    await setQueueOpen(true);
    appStore.services[0].isOpen = false;
    await expect(
      joinQueue({ traderName: "Closed Service", serviceId: 1 })
    ).rejects.toThrow("service is currently closed");
  });

  it("orders traders by priority and preserves FIFO within each priority", async () => {
    await joinQueue({ traderName: "Low First", serviceId: 1 });
    await joinQueue({ traderName: "High First", serviceId: 3 });
    await joinQueue({ traderName: "Medium", serviceId: 2 });
    await joinQueue({ traderName: "High Second", serviceId: 3 });

    expect(appStore.queue.map((entry) => entry.traderName)).toEqual([
      "High First",
      "High Second",
      "Medium",
      "Low First",
    ]);
  });

  it("calculates wait time from the services ahead in the queue", async () => {
    const secondService = appStore.services.find((service) => service.id === 2);
    if (!secondService) throw new Error("Expected seeded service 2.");
    secondService.priority = "low";

    await joinQueue({ traderName: "First", serviceId: 1 });
    await joinQueue({ traderName: "Second", serviceId: 2 });

    expect(estimateWaitForQueueIndex(0)).toBe(0);
    expect(estimateWaitForQueueIndex(1)).toBe(10);
    expect(getServiceQueuePreview(3)).toMatchObject({
      waitingCount: 2,
      estimatedWaitMinutes: 35,
    });

    await serveNext();

    expect(estimateWaitForQueueIndex(0)).toBe(10);
    expect(buildActiveQueue("First")).toMatchObject({
      position: 1,
      peopleAhead: 0,
      estimatedWaitMinutes: 0,
      status: "serving",
    });
    expect(buildActiveQueue("Second")).toMatchObject({
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
    expect(appStore.currentlyServing?.traderName).toBe("First");
    expect(appStore.queue[0].traderName).toBe("Second");
  });

  it("records a served history outcome when service is completed", async () => {
    const joined = await joinQueue({ traderName: "Joshua", serviceId: 2 });
    await serveNext();

    const completed = await completeCurrentService();

    expect(completed).toEqual(joined);
    expect(appStore.currentlyServing).toBeNull();
    expect(appStore.history).toHaveLength(1);
    expect(appStore.history[0]).toMatchObject({
      id: `Q-${joined.id}`,
      traderName: "Joshua",
      serviceId: 2,
      joinedAt: joined.joinedAt,
      outcome: "served",
    });
  });

  it("records a left history outcome when a trader leaves", async () => {
    const joined = await joinQueue({ traderName: "Joshua", serviceId: 1 });

    await leaveQueue(joined.id);

    expect(appStore.queue).toHaveLength(0);
    expect(appStore.history[0]).toMatchObject({
      id: `Q-${joined.id}`,
      traderName: "Joshua",
      outcome: "left",
    });
  });

  it("supports manual reordering and exposes an isolated queue snapshot", async () => {
    const first = await joinQueue({ traderName: "First", serviceId: 1 });
    const second = await joinQueue({ traderName: "Second", serviceId: 1 });

    await moveQueueEntry(second.id, "up");
    const snapshot = await getQueueSnapshot();

    expect(snapshot.entries.map((entry) => entry.id)).toEqual([
      second.id,
      first.id,
    ]);

    snapshot.entries.splice(0);
    expect(appStore.queue).toHaveLength(2);
  });

  it("handles empty states, missing records, and invalid service references", async () => {
    expect(await serveNext()).toBeNull();
    expect(await completeCurrentService()).toBeNull();
    expect(buildActiveQueue("Missing Trader")).toBeNull();

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
    expect(() => getServiceQueuePreview(999)).toThrow("Service not found");

    appStore.queue.push({
      id: 999,
      traderName: "Broken Reference",
      serviceId: 999,
      priority: "low",
      joinedAt: new Date().toISOString(),
    });
    expect(() => estimateWaitForQueueIndex(1)).toThrow(
      "Queue entry references an unknown service"
    );
  });

  it("covers queue boundaries, downward movement, and waiting status", async () => {
    const first = await joinQueue({ traderName: "First", serviceId: 1 });
    const second = await joinQueue({ traderName: "Second", serviceId: 1 });
    const third = await joinQueue({ traderName: "Third", serviceId: 1 });

    await moveQueueEntry(first.id, "up");
    expect(appStore.queue.map((entry) => entry.id)).toEqual([
      first.id,
      second.id,
      third.id,
    ]);

    await moveQueueEntry(first.id, "down");
    expect(appStore.queue.map((entry) => entry.id)).toEqual([
      second.id,
      first.id,
      third.id,
    ]);
    expect(buildActiveQueue("Third")).toMatchObject({
      peopleAhead: 2,
      position: 3,
      status: "waiting",
    });

    await serveNext();
    expect((await getQueueSnapshot()).currentlyServing?.id).toBe(second.id);
  });
});
