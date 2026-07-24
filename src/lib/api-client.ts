import type {
  CreateServiceInput,
  QueueEntry,
  QueueSnapshot,
  Service,
  UpdateServiceInput,
} from "@/types/domain";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `Request failed with status ${response.status}.`);
  }

  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

export const api = {
  services: {
    list: () => request<Service[]>("/api/services"),
    create: (input: CreateServiceInput) =>
      request<Service>("/api/services", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: number, input: UpdateServiceInput) =>
      request<Service>(`/api/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    remove: (id: number) =>
      request<void>(`/api/services/${id}`, { method: "DELETE" }),
  },
  queue: {
    snapshot: () => request<QueueSnapshot>("/api/queue"),
    join: (input: { traderName: string; serviceId: number }) =>
      request<QueueEntry>("/api/queue", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    leave: (id: number) =>
      request<void>(`/api/queue/${id}`, { method: "DELETE" }),
    move: (id: number, direction: "up" | "down") =>
      request<void>(`/api/queue/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ direction }),
      }),
    serveNext: () =>
      request<{ entry: QueueEntry | null }>("/api/queue/serve-next", {
        method: "POST",
      }),
    complete: () =>
      request<{ entry: QueueEntry | null }>("/api/queue/complete", {
        method: "POST",
      }),
    setOpen: (isOpen: boolean) =>
      request<{ isOpen: boolean }>("/api/queue/open", {
        method: "PATCH",
        body: JSON.stringify({ isOpen }),
      }),
  },
};
