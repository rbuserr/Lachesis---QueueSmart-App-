import { activityLog } from "@/app/modules/activity-log/activity-log";

export type Priority = "Low" | "Medium" | "High";

export interface QueueEntry {
  id: number;
  trader: string;
  service: string;
  priority: Priority;
  joinedAt: number;
}

export interface AddTraderRequest {
  trader: string;
  service: string;
  priority: Priority;
}

type Listener = () => void;

class QueueManagement {
  private queue: QueueEntry[] = [];
  private nextId = 1;
  private open = true;
  private listeners: Listener[] = [];
  // the trader currently being helped, separate from those still waiting
  private currentlyServing: QueueEntry | null = null;

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  getQueue(): QueueEntry[] {
    return [...this.queue];
  }

  getQueueByService(serviceName: string): QueueEntry[] {
    return this.queue.filter((e) => e.service === serviceName);
  }

  isQueueOpen(): boolean {
    return this.open;
  }

  // returns whoever is currently being helped, or null if no one is
  getCurrentlyServing(): QueueEntry | null {
    return this.currentlyServing;
  }

  addTrader(data: AddTraderRequest): QueueEntry {
    if (!this.open) {
      throw new Error("Queue is currently closed.");
    }

    if (!data.trader.trim()) {
      throw new Error("Trader name is required.");
    }

    if (!data.service.trim()) {
      throw new Error("Please select a service.");
    }

    const entry: QueueEntry = {
      id: this.nextId++,
      trader: data.trader,
      service: data.service,
      priority: data.priority,
      joinedAt: Date.now(),
    };

    this.queue.push(entry);
    activityLog.log(`${entry.trader} joined the queue for ${entry.service}`);
    this.notify();

    return entry;
  }

  removeTrader(id: number): boolean {
    const index = this.queue.findIndex((e) => e.id === id);
    if (index === -1) return false;

    const [removed] = this.queue.splice(index, 1);
    activityLog.log(`${removed.trader} removed from the queue`);
    this.notify();

    return true;
  }

  // pulls the next waiting trader into "currently serving" (does not discard them)
  serveNext(): QueueEntry | null {
    if (this.currentlyServing) {
      throw new Error("Finish the current trader before serving the next one.");
    }

    if (this.queue.length === 0) return null;

    const [next] = this.queue.splice(0, 1);
    this.currentlyServing = next;
    activityLog.log(`${next.trader} is now being served for ${next.service}`);
    this.notify();

    return next;
  }

  // marks the currently served trader as done and clears the slot
  completeService(): QueueEntry | null {
    if (!this.currentlyServing) return null;

    const finished = this.currentlyServing;
    this.currentlyServing = null;
    activityLog.log(`${finished.trader} finished being served for ${finished.service}`);
    this.notify();

    return finished;
  }

  moveUp(id: number): void {
    const index = this.queue.findIndex((e) => e.id === id);
    if (index <= 0) return;

    [this.queue[index], this.queue[index - 1]] = [this.queue[index - 1], this.queue[index]];
    this.notify();
  }

  moveDown(id: number): void {
    const index = this.queue.findIndex((e) => e.id === id);
    if (index === -1 || index === this.queue.length - 1) return;

    [this.queue[index], this.queue[index + 1]] = [this.queue[index + 1], this.queue[index]];
    this.notify();
  }

  toggleQueueStatus(): boolean {
    this.open = !this.open;
    activityLog.log(`Queue ${this.open ? "opened" : "closed"} by Administrator`);
    this.notify();

    return this.open;
  }

  getStats() {
    const waiting = this.queue.length;
    const highPriority = this.queue.filter((e) => e.priority === "High").length;
    const now = Date.now();
    const averageWaitMinutes =
      waiting === 0
        ? 0
        : Math.round(
            this.queue.reduce((sum, e) => sum + (now - e.joinedAt), 0) / waiting / 60000
          );

    return { waiting, highPriority, averageWaitMinutes };
  }
}

export const queueManager = new QueueManagement();