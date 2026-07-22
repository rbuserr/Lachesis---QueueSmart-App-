import "server-only";

import { appStore } from "@/server/app-store";
import { AppError } from "@/server/errors";
import type {
  CreateServiceInput,
  Priority,
  Service,
  UpdateServiceInput,
} from "@/types/domain";

const priorities: Priority[] = ["low", "medium", "high"];

function validateService(input: CreateServiceInput): void {
  if (!input.name.trim()) {
    throw new AppError("Service name is required.");
  }
  if (input.name.trim().length > 100) {
    throw new AppError("Service name cannot exceed 100 characters.");
  }
  if (!input.description.trim()) {
    throw new AppError("Description is required.");
  }
  if (
    !Number.isFinite(input.expectedDurationMinutes) ||
    input.expectedDurationMinutes <= 0
  ) {
    throw new AppError("Expected duration must be greater than zero.");
  }
  if (!priorities.includes(input.priority)) {
    throw new AppError("Priority must be low, medium, or high.");
  }
}

export async function listServices(options?: {
  openOnly?: boolean;
}): Promise<Service[]> {
  const services = options?.openOnly
    ? appStore.services.filter((service) => service.isOpen)
    : appStore.services;

  return services.map((service) => ({ ...service }));
}

export async function getService(id: number): Promise<Service | null> {
  const service = appStore.services.find((item) => item.id === id);
  return service ? { ...service } : null;
}

export async function createService(
  input: CreateServiceInput
): Promise<Service> {
  const normalized = {
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
  };
  validateService(normalized);

  const service: Service = {
    id: appStore.nextServiceId++,
    ...normalized,
    isOpen: true,
  };
  appStore.services.push(service);

  return { ...service };
}

export async function updateService(
  id: number,
  updates: UpdateServiceInput
): Promise<Service> {
  const index = appStore.services.findIndex((service) => service.id === id);
  if (index === -1) {
    throw new AppError("Service not found.", 404);
  }

  const existing = appStore.services[index];
  const merged: Service = {
    ...existing,
    ...updates,
    name: updates.name?.trim() ?? existing.name,
    description: updates.description?.trim() ?? existing.description,
  };

  validateService(merged);
  appStore.services[index] = merged;

  return { ...merged };
}

export async function deleteService(id: number): Promise<void> {
  const index = appStore.services.findIndex((service) => service.id === id);
  if (index === -1) {
    throw new AppError("Service not found.", 404);
  }

  const isInUse =
    appStore.queue.some((entry) => entry.serviceId === id) ||
    appStore.currentlyServing?.serviceId === id;
  if (isInUse) {
    throw new AppError("A service with active queue entries cannot be deleted.", 409);
  }

  appStore.services.splice(index, 1);
}
