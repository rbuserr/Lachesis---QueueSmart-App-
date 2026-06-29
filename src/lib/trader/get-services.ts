import { MOCK_SERVICES } from "@/lib/mock-data";
import type { Service } from "@/types/trader";

export async function getServices(): Promise<Service[]> {
  return MOCK_SERVICES;
  // A3: return fetch("/api/trader/services").then((r) => r.json());
}

export async function getServiceById(id: number): Promise<Service | undefined> {
  const services = await getServices();
  return services.find((service) => service.id === id);
}
