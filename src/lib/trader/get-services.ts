import "server-only";

import { getService, listServices } from "@/server/services";
import type { Service } from "@/types/domain";

export async function getServices(): Promise<Service[]> {
  return listServices({ openOnly: true });
}

export async function getServiceById(id: number): Promise<Service | undefined> {
  return (await getService(id)) ?? undefined;
}
