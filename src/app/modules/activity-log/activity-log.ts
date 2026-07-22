export interface ActivityEntry {
  id: number;
  message: string;
  timestamp: number;
}

type Listener = () => void;

class ActivityLogManager {
  private entries: ActivityEntry[] = [];
  private nextId = 1;
  private listeners: Listener[] = [];
  private readonly maxEntries = 50;

  // lets components react to new log entries
  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // runs all subscribed listeners
  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // adds a new entry to the top and trims list to max size
  log(message: string): void {
    this.entries.unshift({ id: this.nextId++, message, timestamp: Date.now() });
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }
    this.notify();
  }

  // returns the most recent entries, limited by count
  getEntries(limit = 10): ActivityEntry[] {
    return this.entries.slice(0, limit);
  }
}

export const activityLog = new ActivityLogManager();