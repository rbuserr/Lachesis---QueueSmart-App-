import "server-only";

import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type {
  CreateServiceInput,
  Priority,
  Service,
  UpdateServiceInput,
} from "@/types/domain";

const priorities: Priority[] = ["low", "medium", "high"];

function validateService(input: {
  name: string;
  description: string;
  expectedDurationMinutes: number;
  priority: Priority;
}): void {
  if (!input.name.trim()) {
    throw new AppError("Service name is required.");
  }
  if (input.name.trim().length > 100) {
    throw new AppError("Service name cannot exceed 100 characters.");
  }
  if (!input.description.trim()) {
    throw new AppError("Description is required.");
  }
  if (input.description.trim().length > 500) {
    throw new AppError("Description cannot exceed 500 characters.");
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
  const services = await prisma.service.findMany({
    where: options?.openOnly ? { isOpen: true } : undefined,
    orderBy: { id: "asc" },
  });

  return services as unknown as Service[];
}

export async function getService(id: number): Promise<Service | null> {
  const service = await prisma.service.findUnique({ where: { id } });
  return service as unknown as Service | null;
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

  // Create the Service and its initial open Queue together so they either
  // both succeed or both fail — no service can exist without a queue.
  const service = await prisma.service.create({
    data: {
      name: normalized.name,
      description: normalized.description,
      expectedDurationMinutes: normalized.expectedDurationMinutes,
      priority: normalized.priority,
      isOpen: true,
      queues: {
        create: {
          status: "open",
        },
      },
    },
  });

  return service as unknown as Service;
}

export async function updateService(
  id: number,
  updates: UpdateServiceInput
): Promise<Service> {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Service not found.", 404);
  }

  const merged = {
    name: updates.name?.trim() ?? existing.name,
    description: updates.description?.trim() ?? existing.description,
    expectedDurationMinutes:
      updates.expectedDurationMinutes ?? existing.expectedDurationMinutes,
    priority: (updates.priority ?? existing.priority) as Priority,
    isOpen: updates.isOpen ?? existing.isOpen,
  };

  validateService(merged);

  const updated = await prisma.service.update({
    where: { id },
    data: merged,
  });

  return updated as unknown as Service;
}

export async function deleteService(id: number): Promise<void> {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Service not found.", 404);
  }

  const activeEntryCount = await prisma.queueEntry.count({
    where: {
      serviceId: id,
      status: { in: ["waiting", "serving"] },
    },
  });

  if (activeEntryCount > 0) {
    throw new AppError(
      "A service with active queue entries cannot be deleted.",
      409
    );
  }

  try {
    // Cascades to Queue rows automatically (onDelete: Cascade in schema).
    // Will throw if QueueHistory rows reference this service (onDelete: Restrict).
    await prisma.service.delete({ where: { id } });
  } catch (err) {
    throw new AppError(
      "This service has queue history and cannot be deleted.",
      409
    );
  }
}