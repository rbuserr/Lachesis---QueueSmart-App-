"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api-client";
import type { QueueSnapshot } from "@/types/domain";

const emptySnapshot: QueueSnapshot = {
  entries: [],
  currentlyServing: null,
  isOpen: true,
  stats: {
    waiting: 0,
    highPriority: 0,
    averageEstimatedWaitMinutes: 0,
  },
};

export function useQueue(pollIntervalMs = 1500) {
  const [snapshot, setSnapshot] = useState<QueueSnapshot>(emptySnapshot);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setSnapshot(await api.queue.snapshot());
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the queue."
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), pollIntervalMs);
    return () => window.clearInterval(interval);
  }, [pollIntervalMs, refresh]);

  return { snapshot, error, refresh };
}
