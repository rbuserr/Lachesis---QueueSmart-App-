"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api-client";
import type { Service } from "@/types/domain";

export function useServices(pollIntervalMs = 1500) {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setServices(await api.services.list());
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load services."
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), pollIntervalMs);
    return () => window.clearInterval(interval);
  }, [pollIntervalMs, refresh]);

  return { services, error, refresh };
}
